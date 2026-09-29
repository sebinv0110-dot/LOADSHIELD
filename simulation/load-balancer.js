const http = require("http");

const PORT = 4000;

const SERVERS = [
    {
        name: "Server A",
        host: "localhost",
        port: 3001
    },
    {
        name: "Server B",
        host: "localhost",
        port: 3002
    },
    {
        name: "Server C",
        host: "localhost",
        port: 3003
    }
];

// Virtual waiting room
const waitingQueue = [];

const MAX_QUEUE_SIZE = 20;

// Simulated service time
const SERVICE_TIME = 5000;


/*
========================================
CHECK SERVER
========================================
*/

function checkServer(server) {

    return new Promise((resolve) => {

        const request = http.get(
            `http://${server.host}:${server.port}/health`,
            (response) => {

                let data = "";

                response.on("data", (chunk) => {
                    data += chunk;
                });

                response.on("end", () => {

                    try {

                        const result = JSON.parse(data);

                        resolve({
                            ...server,
                            online: true,
                            load: result.load,
                            status: result.status,
                            responseTime: result.responseTime
                        });

                    } catch (error) {

                        resolve({
                            ...server,
                            online: false
                        });
                    }
                });
            }
        );

        request.on("error", () => {

            resolve({
                ...server,
                online: false
            });
        });

        request.setTimeout(2000, () => {

            request.destroy();

            resolve({
                ...server,
                online: false
            });
        });
    });
}


/*
========================================
GET AVAILABLE SERVERS
========================================
*/

async function getAvailableServers() {

    const servers = await Promise.all(
        SERVERS.map(checkServer)
    );

    return servers.filter((server) => {

        return (
            server.online &&
            server.status !== "high" &&
            server.status !== "critical"
        );
    });
}


/*
========================================
SELECT LOWEST LOAD SERVER
========================================
*/

async function selectServer() {

    const availableServers =
        await getAvailableServers();

    if (availableServers.length === 0) {
        return null;
    }

    availableServers.sort(
        (a, b) => a.load - b.load
    );

    return availableServers[0];
}


/*
========================================
FORWARD REQUEST
========================================
*/

function forwardRequest(req, res, server) {

    const options = {
        hostname: server.host,
        port: server.port,
        path: req.url,
        method: req.method,
        headers: req.headers
    };

    const proxy = http.request(
        options,
        (serverResponse) => {

            res.writeHead(
                serverResponse.statusCode,
                serverResponse.headers
            );

            serverResponse.pipe(res);
        }
    );

    proxy.on("error", (error) => {

        console.log(
            "Proxy error:",
            error.message
        );

        if (!res.headersSent) {
            res.writeHead(502);
        }

        res.end(JSON.stringify({
            error: "Backend server unavailable"
        }));
    });

    req.pipe(proxy);
}


/*
========================================
ADD USER TO WAITING QUEUE
========================================
*/

function addToQueue(req, res) {

    if (waitingQueue.length >= MAX_QUEUE_SIZE) {

        res.writeHead(503, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            status: "queue_full",
            message: "Waiting room is currently full"
        }, null, 2));

        return;
    }

    const userId =
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000);

    const user = {
        id: userId,
        req: req,
        res: res,
        joinedAt: Date.now()
    };

    waitingQueue.push(user);

    const position = waitingQueue.length;

    const estimatedWaitSeconds =
        position * (SERVICE_TIME / 1000);

    console.log("");
    console.log("======================================");
    console.log("       USER ENTERED WAITING ROOM");
    console.log("======================================");
    console.log(`User ID: ${userId}`);
    console.log(`Position: ${position}`);
    console.log(
        `Estimated Wait: ${estimatedWaitSeconds} seconds`
    );
    console.log("======================================");

    res.writeHead(202, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        status: "waiting",
        userId: userId,
        queuePosition: position,
        estimatedWaitSeconds: estimatedWaitSeconds,
        message:
            "All servers are busy. You have been placed in the virtual waiting room."
    }, null, 2));
}


/*
========================================
LOAD BALANCER
========================================
*/

const loadBalancer =
    http.createServer(async (req, res) => {
        // ========================================
// JOIN WAITING ROOM
// ========================================

if (
    req.method === "GET" &&
    req.url === "/join"
) {

    const selectedServer = await selectServer();

    // Server available
    if (selectedServer) {

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            status: "admitted",
            server: selectedServer.name,
            load: selectedServer.load,
            message: "Server available. Request admitted."
        }, null, 2));

        return;
    }

    // All servers busy
    addToQueue(req, res);

    return;
}

    console.log("");
    console.log(
        `Incoming request: ${req.method} ${req.url}`
    );


    /*
    ========================================
    HEALTH ENDPOINT
    ========================================
    */

    if (
        req.method === "GET" &&
        req.url === "/health"
    ) {

        const servers =
            await Promise.all(
                SERVERS.map(checkServer)
            );

        const availableServers =
            servers.filter((server) => {

                return (
                    server.online &&
                    server.status !== "high" &&
                    server.status !== "critical"
                );
            });

        if (availableServers.length === 0) {

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                status: "waiting",
                message: "All servers are currently busy",
                waitingUsers: waitingQueue.length
            }, null, 2));

            return;
        }

        availableServers.sort(
            (a, b) => a.load - b.load
        );

        const selectedServer =
            availableServers[0];

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            status: "routing",
            selectedServer: selectedServer.name,
            load: selectedServer.load,
            serverStatus: selectedServer.status,
            responseTime: selectedServer.responseTime,
            waitingUsers: waitingQueue.length
        }, null, 2));

        return;
    }


    /*
    ========================================
    QUEUE ENDPOINT
    ========================================
    */

    if (
        req.method === "GET" &&
        req.url === "/queue"
    ) {

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            waitingUsers: waitingQueue.length,
            maxQueueSize: MAX_QUEUE_SIZE,

            queue: waitingQueue.map(
                (user, index) => ({

                    userId: user.id,

                    position: index + 1,

                    estimatedWaitSeconds:
                        (index + 1) *
                        (SERVICE_TIME / 1000),

                    status: "waiting"
                })
            )

        }, null, 2));

        return;
    }


    /*
    ========================================
    SERVERS ENDPOINT
    ========================================
    */

    if (
        req.method === "GET" &&
        req.url === "/servers"
    ) {

        const servers =
            await Promise.all(
                SERVERS.map(checkServer)
            );

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(
            JSON.stringify(
                servers,
                null,
                2
            )
        );

        return;
    }


    /*
    ========================================
    SELECT SERVER
    ========================================
    */

    const selectedServer =
        await selectServer();


    /*
    ========================================
    NO SERVER AVAILABLE
    ========================================
    */

    if (!selectedServer) {

        addToQueue(req, res);

        return;
    }


    /*
    ========================================
    FORWARD REQUEST
    ========================================
    */

    console.log(
        `Routing request to ${selectedServer.name}`
    );

    console.log(
        `Current load: ${selectedServer.load}%`
    );

    forwardRequest(
        req,
        res,
        selectedServer
    );
});


/*
========================================
QUEUE PROCESSOR
========================================
*/

async function processQueue() {

    if (waitingQueue.length === 0) {
        return;
    }

    const selectedServer =
        await selectServer();

    if (!selectedServer) {

        console.log(
            `Waiting room active: ${waitingQueue.length} user(s)`
        );

        return;
    }

    const user =
        waitingQueue.shift();

    console.log("");
    console.log("======================================");
    console.log("        USER RELEASED");
    console.log("======================================");
    console.log(`User ID: ${user.id}`);
    console.log(`Server: ${selectedServer.name}`);
    console.log("======================================");

    console.log(
        `User ${user.id} can now access ${selectedServer.name}`
    );
}


/*
========================================
START LOAD BALANCER
========================================
*/

loadBalancer.listen(
    PORT,
    "localhost",
    () => {

        console.log("");
        console.log("======================================");
        console.log("       LOADSHIELD LOAD BALANCER");
        console.log("======================================");

        console.log(
            "Load Balancer: http://localhost:4000"
        );

        console.log("");

        console.log("Backend Servers:");

        console.log(
            "Server A → http://localhost:3001"
        );

        console.log(
            "Server B → http://localhost:3002"
        );

        console.log(
            "Server C → http://localhost:3003"
        );

        console.log("");

        console.log(
            "Virtual Waiting Room: ENABLED"
        );

        console.log(
            `Maximum Queue Size: ${MAX_QUEUE_SIZE}`
        );

        console.log("");

        console.log("Status: RUNNING");

        console.log(
            "======================================"
        );
    }
);


/*
========================================
CHECK QUEUE EVERY 3 SECONDS
========================================
*/

setInterval(
    processQueue,
    3000
);