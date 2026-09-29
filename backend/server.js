const http = require("http");
const config = require("./config.json");

const {
    getNextServer
} = require("./router");

const {
    forwardRequest
} = require("./gateway");

const {
    chooseHealthyServer,
    requestCounts
} = require("./decision");


// =========================================================
// PERSON 2 — MONITORING CONFIGURATION
// =========================================================

let monitoringConfig = {
    surgeMultiplier: 1.5,
    capacity: 1800,
    statusThresholds: {
        normal: 60,
        warning: 80,
        highLoad: 90
    }
};

try {

    monitoringConfig =
        require("../monitoring/config.json");

} catch (error) {

    console.warn(
        "Monitoring config not found. Using fallback configuration."
    );

}


// =========================================================
// PERSON 4 — LOAD BALANCER
// =========================================================

const LOAD_BALANCER_URL =
    "http://localhost:4000";


// =========================================================
// TRAFFIC BASELINE
// =========================================================

const NORMAL_TRAFFIC =
    1000;


// =========================================================
// RUNTIME METRICS
// =========================================================

let totalRequests =
    0;

let failedRequests =
    0;

let activeRequests =
    0;


// Requests/sec sampling
let previousTotalRequests =
    0;

let previousRps =
    0;

let previousRpsTimestamp =
    Date.now();


// =========================================================
// CORS
// =========================================================

function setCorsHeaders(res) {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );
}


// =========================================================
// JSON RESPONSE HELPER
// =========================================================

function sendJson(
    res,
    statusCode,
    data
) {

    res.writeHead(
        statusCode,
        {
            "Content-Type":
                "application/json",

            "Cache-Control":
                "no-store"
        }
    );

    res.end(
        JSON.stringify(
            data,
            null,
            2
        )
    );
}


// =========================================================
// HTTP JSON REQUEST HELPER
// =========================================================

function readJson(
    url,
    timeout = 2500
) {

    return new Promise(
        (resolve, reject) => {

            const request =
                http.get(
                    url,
                    (response) => {

                        let data =
                            "";

                        response.on(
                            "data",
                            (chunk) => {

                                data +=
                                    chunk;

                            }
                        );

                        response.on(
                            "end",
                            () => {

                                if (
                                    response.statusCode <
                                    200 ||
                                    response.statusCode >=
                                    300
                                ) {

                                    reject(
                                        new Error(
                                            `HTTP ${response.statusCode}`
                                        )
                                    );

                                    return;
                                }


                                try {

                                    resolve(
                                        JSON.parse(
                                            data
                                        )
                                    );

                                }

                                catch (
                                    error
                                ) {

                                    reject(
                                        new Error(
                                            "Invalid JSON response"
                                        )
                                    );

                                }

                            }
                        );

                    }
                );


            request.setTimeout(
                timeout,
                () => {

                    request.destroy();

                    reject(
                        new Error(
                            "Request timeout"
                        )
                    );

                }
            );


            request.on(
                "error",
                reject
            );

        }
    );

}


// =========================================================
// PERSON 4 — LIVE SERVER DATA
// =========================================================

async function getLiveServerData() {

    // -----------------------------------------------------
    // First: ask Person 4 Load Balancer
    // -----------------------------------------------------

    try {

        const data =
            await readJson(
                `${LOAD_BALANCER_URL}/servers`
            );


        if (
            Array.isArray(data)
        ) {

            return data.map(
                (server) => {

                    return {

                        name:
                            server.name,

                        host:
                            server.host ||
                            "localhost",

                        port:
                            server.port,

                        url:
                            `http://${server.host || "localhost"}:${server.port}`,

                        online:
                            Boolean(
                                server.online
                            ),

                        status:
                            String(
                                server.status ||
                                "offline"
                            ).toLowerCase(),

                        load:
                            Number.isFinite(
                                Number(
                                    server.load
                                )
                            )
                                ? Number(
                                    server.load
                                )
                                : null,

                        responseTime:
                            Number.isFinite(
                                Number(
                                    server.responseTime
                                )
                            )
                                ? Number(
                                    server.responseTime
                                )
                                : null

                    };

                }
            );

        }

    }

    catch (error) {

        console.warn(
            "Person 4 Load Balancer unavailable. Using direct server checks."
        );

    }


    // -----------------------------------------------------
    // Fallback: direct Server A/B/C checks
    // -----------------------------------------------------

    const results =
        await Promise.all(
            config.servers.map(
                async (configuredServer) => {

                    try {

                        const data =
                            await readJson(
                                `${configuredServer.url}/health`
                            );


                        return {

                            name:
                                configuredServer.name,

                            host:
                                "localhost",

                            port:
                                new URL(
                                    configuredServer.url
                                ).port,

                            url:
                                configuredServer.url,

                            online:
                                true,

                            status:
                                String(
                                    data.status ||
                                    "healthy"
                                ).toLowerCase(),

                            load:
                                Number.isFinite(
                                    Number(
                                        data.load
                                    )
                                )
                                    ? Number(
                                        data.load
                                    )
                                    : null,

                            responseTime:
                                Number.isFinite(
                                    Number(
                                        data.responseTime
                                    )
                                )
                                    ? Number(
                                        data.responseTime
                                    )
                                    : null

                        };

                    }

                    catch (error) {

                        return {

                            name:
                                configuredServer.name,

                            host:
                                "localhost",

                            port:
                                new URL(
                                    configuredServer.url
                                ).port,

                            url:
                                configuredServer.url,

                            online:
                                false,

                            status:
                                "offline",

                            load:
                                null,

                            responseTime:
                                null

                        };

                    }

                }
            )
        );


    return results;

}


// =========================================================
// PERSON 4 — QUEUE DATA
// =========================================================

async function getQueueData() {

    try {

        const data =
            await readJson(
                `${LOAD_BALANCER_URL}/queue`
            );


        return {

            waitingUsers:
                Number(
                    data.waitingUsers
                ) || 0,

            maxQueueSize:
                Number(
                    data.maxQueueSize
                ) || 20,

            queue:
                Array.isArray(
                    data.queue
                )
                    ? data.queue
                    : []

        };

    }

    catch (error) {

        return {

            waitingUsers:
                0,

            maxQueueSize:
                20,

            queue:
                []

        };

    }

}


// =========================================================
// PERSON 4 — ROUTING INFORMATION
// =========================================================

async function getRoutingHealth() {

    try {

        return await readJson(
            `${LOAD_BALANCER_URL}/health`
        );

    }

    catch (error) {

        return {

            status:
                "unavailable",

            selectedServer:
                null,

            load:
                null,

            serverStatus:
                "offline",

            responseTime:
                null,

            waitingUsers:
                0

        };

    }

}


// =========================================================
// REQUESTS PER SECOND
// =========================================================

function calculateTrafficSnapshot() {

    const now =
        Date.now();


    const elapsedSeconds =
        (
            now -
            previousRpsTimestamp
        ) / 1000;


    const requestDelta =
        totalRequests -
        previousTotalRequests;


    let currentRps =
        previousRps;


    if (
        elapsedSeconds >= 0.5
    ) {

        currentRps =
            Math.max(
                0,
                Math.round(
                    requestDelta /
                    elapsedSeconds
                )
            );

    }


    previousTotalRequests =
        totalRequests;


    previousRpsTimestamp =
        now;


    const previousTraffic =
        previousRps > 0
            ? previousRps
            : NORMAL_TRAFFIC;


    previousRps =
        currentRps;


    return {

        currentRps:
            currentRps,

        previousTraffic:
            previousTraffic

    };

}


// =========================================================
// PERSON 2 — SYSTEM STATUS
// =========================================================

function calculateSystemStatus(
    servers
) {

    const onlineServers =
        servers.filter(
            (server) =>
                server.online
        );


    if (
        onlineServers.length ===
        0
    ) {

        return "CRITICAL";

    }


    const liveLoads =
        onlineServers
            .map(
                (server) =>
                    server.load
            )
            .filter(
                (load) =>
                    Number.isFinite(
                        load
                    )
            );


    if (
        liveLoads.length ===
        0
    ) {

        return "WARNING";

    }


    const highestLoad =
        Math.max(
            ...liveLoads
        );


    const thresholds =
        monitoringConfig.statusThresholds;


    if (
        highestLoad <
        thresholds.normal
    ) {

        return "NORMAL";

    }


    if (
        highestLoad <
        thresholds.warning
    ) {

        return "WARNING";

    }


    if (
        highestLoad <
        thresholds.highLoad
    ) {

        return "HIGH LOAD";

    }


    return "CRITICAL";

}


// =========================================================
// PERSON 2 — BOTTLENECK DETECTION
// =========================================================

function calculateBottleneck(
    servers
) {

    const candidates =
        servers
            .filter(
                (server) =>
                    Number.isFinite(
                        server.load
                    )
            )
            .sort(
                (a, b) =>
                    b.load -
                    a.load
            );


    if (
        candidates.length ===
        0
    ) {

        return {

            name:
                "NONE",

            load:
                null

        };

    }


    return {

        name:
            candidates[0].name,

        load:
            candidates[0].load

    };

}


// =========================================================
// PERSON 2 — OVERLOAD PREDICTION
// =========================================================

function calculatePrediction(
    currentTraffic,
    previousTraffic
) {

    const trafficIncrease =
        currentTraffic -
        previousTraffic;


    const predictedTraffic =
        currentTraffic +
        trafficIncrease;


    const capacity =
        Number(
            monitoringConfig.capacity
        ) || 1800;


    const surgeLimit =
        (
            Number(
                monitoringConfig.surgeMultiplier
            ) || 1.5
        ) *
        NORMAL_TRAFFIC;


    let overloadRisk =
        "LOW RISK";


    if (
        predictedTraffic >
        capacity
    ) {

        overloadRisk =
            "HIGH RISK";

    }


    return {

        previousTraffic:
            previousTraffic,

        currentTraffic:
            currentTraffic,

        trafficIncrease:
            trafficIncrease,

        predictedTraffic:
            predictedTraffic,

        capacity:
            capacity,

        surgeLimit:
            surgeLimit,

        overloadRisk:
            overloadRisk

    };

}


// =========================================================
// UNIFIED DASHBOARD DATA
// =========================================================

function buildDashboardData(
    servers,
    queueData,
    routingHealth
) {

    const traffic =
        calculateTrafficSnapshot();


    const systemStatus =
        calculateSystemStatus(
            servers
        );


    const bottleneck =
        calculateBottleneck(
            servers
        );


    const prediction =
        calculatePrediction(
            traffic.currentRps,
            traffic.previousTraffic
        );


    const healthyServers =
        servers.filter(
            (server) =>
                server.online &&
                server.status ===
                    "healthy"
        ).length;


    const offlineServers =
        servers.filter(
            (server) =>
                !server.online
        ).length;


    const responseTimes =
        servers
            .map(
                (server) =>
                    server.responseTime
            )
            .filter(
                (value) =>
                    Number.isFinite(
                        value
                    )
            );


    const averageResponseTime =
        responseTimes.length > 0

            ? Math.round(
                responseTimes.reduce(
                    (sum, value) =>
                        sum +
                        value,
                    0
                ) /
                responseTimes.length
            )

            : null;


    const waitingUsers =
        Number(
            queueData.waitingUsers
        ) || 0;


    const firstQueueUser =
        queueData.queue.length > 0

            ? queueData.queue[0]

            : null;


    // -----------------------------------------------------
    // TRAFFIC DECISION
    // -----------------------------------------------------

    let action =
        "NORMAL ROUTING";


    let trafficDecision =
        "Normal traffic distribution";


    let trafficReason =
        "All servers operating normally";


    if (
        systemStatus ===
        "WARNING"
    ) {

        action =
            "MONITORING TRAFFIC";


        trafficDecision =
            "Continue monitoring traffic";


        trafficReason =
            bottleneck.load !== null

                ? `${bottleneck.name} is at ${bottleneck.load}% load`

                : "Traffic conditions require monitoring";

    }


    else if (
        systemStatus ===
        "HIGH LOAD"
    ) {

        if (
            routingHealth.selectedServer
        ) {

            action =
                "ROUTING TO HEALTHY SERVER";


            trafficDecision =
                `Route traffic to ${routingHealth.selectedServer}`;


            trafficReason =
                bottleneck.load !== null

                    ? `${bottleneck.name} has the highest load at ${bottleneck.load}%`

                    : "Healthy server capacity is available";

        }

        else {

            action =
                "WAITING ROOM ACTIVE";


            trafficDecision =
                "Activate waiting room";


            trafficReason =
                "No suitable healthy server is available";

        }

    }


    else if (
        systemStatus ===
        "CRITICAL"
    ) {

        action =
            "WAITING ROOM ACTIVE";


        trafficDecision =
            "Activate waiting room";


        trafficReason =
            waitingUsers > 0

                ? `${waitingUsers} user(s) currently waiting`

                : "All available servers are heavily loaded";

    }


    // -----------------------------------------------------
    // ERROR RATE
    // -----------------------------------------------------

    const calculatedErrorRate =
        totalRequests > 0

            ? (
                (
                    failedRequests /
                    totalRequests
                ) *
                100
            )

            : 0;


    // -----------------------------------------------------
    // QUEUE
    // -----------------------------------------------------

    const queueStatus =
        waitingUsers > 0
            ? "ACTIVE"
            : "INACTIVE";


    const queuePosition =
        firstQueueUser
            ? firstQueueUser.position
            : "-";


    const estimatedWait =
        firstQueueUser
            ? firstQueueUser.estimatedWaitSeconds
            : 0;


    // -----------------------------------------------------
    // SERVER SUMMARY
    // -----------------------------------------------------

    const serverSummary =
        servers.map(
            (server) => ({

                name:
                    server.name,

                status:
                    server.status,

                online:
                    server.online,

                load:
                    server.load,

                responseTime:
                    server.responseTime

            })
        );


    // -----------------------------------------------------
    // FINAL UNIFIED RESPONSE
    // -----------------------------------------------------

    return {

        system:
            "LoadShield",

        source:
            "BACKEND",

        status:
            "running",


        // Main metrics
        totalRequests:
            totalRequests,

        requestsPerSecond:
            traffic.currentRps,

        activeUsers:
            activeRequests,

        responseTime:
            averageResponseTime,

        errorRate:
            Number(
                calculatedErrorRate.toFixed(
                    2
                )
            ),


        // Server information
        totalServers:
            servers.length,

        healthyServers:
            healthyServers,

        offlineServers:
            offlineServers,

        servers:
            serverSummary,

        requestCounts:
            requestCounts,


        // Person 2 monitoring
        systemStatus:
            systemStatus,

        overloadRisk:
            prediction.overloadRisk,

        normalTraffic:
            NORMAL_TRAFFIC,

        surgeLimit:
            prediction.surgeLimit,

        previousTraffic:
            prediction.previousTraffic,

        trafficIncrease:
            prediction.trafficIncrease,

        predictedTraffic:
            prediction.predictedTraffic,

        capacity:
            prediction.capacity,


        // Person 2 bottleneck
        bottleneck:
            bottleneck.name,

        bottleneckLoad:
            bottleneck.load,


        // Traffic control
        action:
            action,

        trafficDecision:
            trafficDecision,

        trafficReason:
            trafficReason,


        // Person 4 routing
        selectedServer:
            routingHealth.selectedServer ||
            null,


        // Person 4 queue
        queueStatus:
            queueStatus,

        queueSize:
            waitingUsers,

        queuePosition:
            queuePosition,

        estimatedWait:
            estimatedWait,

        maxQueueSize:
            queueData.maxQueueSize,


        // Server summary for future UI
        serverSummary:
            serverSummary

    };

}


// =========================================================
// GET COMPLETE DASHBOARD DATA
// =========================================================

async function getDashboardData() {

    const [
        servers,
        queueData,
        routingHealth
    ] = await Promise.all([

        getLiveServerData(),

        getQueueData(),

        getRoutingHealth()

    ]);


    return buildDashboardData(
        servers,
        queueData,
        routingHealth
    );

}


// =========================================================
// LOADSHIELD GATEWAY
// =========================================================

const server =
    http.createServer(
        async (req, res) => {

            setCorsHeaders(res);


            // -------------------------------------------------
            // CORS PREFLIGHT
            // -------------------------------------------------

            if (
                req.method ===
                "OPTIONS"
            ) {

                res.writeHead(
                    204
                );

                res.end();

                return;

            }


            // =================================================
            // REAL LOADSHIELD REQUEST
            // =================================================

            if (
                req.url ===
                    "/api/request" &&
                req.method ===
                    "GET"
            ) {

                totalRequests++;

                activeRequests++;


                let released =
                    false;


                const release =
                    () => {

                        if (
                            released
                        ) {

                            return;

                        }


                        released =
                            true;


                        if (
                            activeRequests >
                            0
                        ) {

                            activeRequests--;

                        }

                    };


                res.once(
                    "finish",
                    release
                );


                res.once(
                    "close",
                    release
                );


                try {

                    const nextServer =
                        await chooseHealthyServer(
                            config.servers
                        );


                    if (
                        !nextServer
                    ) {

                        failedRequests++;


                        release();


                        sendJson(
                            res,
                            503,
                            {

                                error:
                                    "No healthy servers available",

                                message:
                                    "LoadShield cannot route the request. Waiting room conditions may be active."

                            }
                        );


                        return;

                    }


                    forwardRequest(
                        nextServer,
                        req,
                        res
                    );


                }

                catch (error) {

                    failedRequests++;


                    release();


                    sendJson(
                        res,
                        502,
                        {

                            error:
                                "Gateway routing error",

                            message:
                                error.message

                        }
                    );

                }


                return;

            }


            // =================================================
            // BASIC HEALTH
            // =================================================

            if (
                req.url ===
                    "/api/health" &&
                req.method ===
                    "GET"
            ) {

                sendJson(
                    res,
                    200,
                    {

                        system:
                            "LoadShield",

                        status:
                            "ok"

                    }
                );


                return;

            }


            // =================================================
            // SERVER STATUS
            // =================================================

            if (
                req.url ===
                    "/api/status" &&
                req.method ===
                    "GET"
            ) {

                try {

                    const data =
                        await getDashboardData();


                    sendJson(
                        res,
                        200,
                        data.servers
                    );

                }

                catch (error) {

                    sendJson(
                        res,
                        500,
                        {

                            error:
                                "Unable to read server status",

                            message:
                                error.message

                        }
                    );

                }


                return;

            }


            // =================================================
            // UNIFIED DASHBOARD API
            // =================================================

            if (
                req.url ===
                    "/api/dashboard" &&
                req.method ===
                    "GET"
            ) {

                try {

                    const dashboardData =
                        await getDashboardData();


                    sendJson(
                        res,
                        200,
                        dashboardData
                    );

                }

                catch (error) {

                    sendJson(
                        res,
                        500,
                        {

                            error:
                                "Unable to build dashboard data",

                            message:
                                error.message

                        }
                    );

                }


                return;

            }


            // =================================================
            // LIVE SERVERS
            // =================================================

            if (
                req.url ===
                    "/api/servers" &&
                req.method ===
                    "GET"
            ) {

                try {

                    const servers =
                        await getLiveServerData();


                    sendJson(
                        res,
                        200,
                        servers
                    );

                }

                catch (error) {

                    sendJson(
                        res,
                        500,
                        {

                            error:
                                "Unable to read live servers",

                            message:
                                error.message

                        }
                    );

                }


                return;

            }


            // =================================================
            // NEXT SERVER
            // =================================================

            if (
                req.url ===
                    "/api/next-server" &&
                req.method ===
                    "GET"
            ) {

                const nextServer =
                    getNextServer();


                if (
                    !nextServer
                ) {

                    sendJson(
                        res,
                        503,
                        {

                            error:
                                "No servers available"

                        }
                    );


                    return;

                }


                sendJson(
                    res,
                    200,
                    nextServer
                );


                return;

            }


            // =================================================
            // DEFAULT
            // =================================================

            sendJson(
                res,
                200,
                {

                    system:
                        "LoadShield",

                    message:
                        "LoadShield unified gateway is running",

                    endpoints: {

                        health:
                            "/api/health",

                        status:
                            "/api/status",

                        dashboard:
                            "/api/dashboard",

                        servers:
                            "/api/servers",

                        nextServer:
                            "/api/next-server",

                        request:
                            "/api/request"

                    }

                }
            );

        }
    );


// =========================================================
// START GATEWAY
// =========================================================

server.listen(
    3000,
    () => {

        console.log(
            "=============================================="
        );

        console.log(
            "       LOADSHIELD UNIFIED GATEWAY"
        );

        console.log(
            "=============================================="
        );

        console.log(
            "Gateway: http://localhost:3000"
        );

        console.log(
            "Dashboard: http://localhost:3000/api/dashboard"
        );

        console.log(
            "Person 4 Load Balancer: http://localhost:4000"
        );

        console.log(
            `Traffic Capacity: ${monitoringConfig.capacity} req/s`
        );

        console.log(
            "Monitoring: Person 2"
        );

        console.log(
            "Simulation: Person 4"
        );

        console.log(
            "=============================================="
        );

    }
);G