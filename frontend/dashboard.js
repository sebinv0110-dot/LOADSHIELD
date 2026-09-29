// =========================================================
// LOADSHIELD — PROFESSIONAL DASHBOARD
// =========================================================


// =========================================================
// HTML ELEMENTS
// =========================================================

const requestsPerSecond =
    document.getElementById("requestsPerSecond");

const activeUsers =
    document.getElementById("activeUsers");

const responseTime =
    document.getElementById("responseTime");

const errorRate =
    document.getElementById("errorRate");


const serverALoad =
    document.getElementById("serverALoad");

const serverBLoad =
    document.getElementById("serverBLoad");

const serverCLoad =
    document.getElementById("serverCLoad");


const serverAProgress =
    document.getElementById("serverAProgress");

const serverBProgress =
    document.getElementById("serverBProgress");

const serverCProgress =
    document.getElementById("serverCProgress");


const serverAStatus =
    document.getElementById("serverAStatus");

const serverBStatus =
    document.getElementById("serverBStatus");

const serverCStatus =
    document.getElementById("serverCStatus");


const systemStatus =
    document.getElementById("systemStatus");

const overloadRisk =
    document.getElementById("overloadRisk");

const bottleneck =
    document.getElementById("bottleneck");


const trafficAction =
    document.getElementById("trafficAction");

const trafficDecision =
    document.getElementById("trafficDecision");

const trafficReason =
    document.getElementById("trafficReason");


const queueStatus =
    document.getElementById("queueStatus");

const queueSize =
    document.getElementById("queueSize");

const queuePosition =
    document.getElementById("queuePosition");

const estimatedWait =
    document.getElementById("estimatedWait");


const eventList =
    document.getElementById("eventList");


const heroStatus =
    document.getElementById("heroStatus");


// =========================================================
// DEMO DATA
// =========================================================

const demoData = [

    {
        source: "DEMO",

        requestsPerSecond: 500,
        activeUsers: 180,
        responseTime: 120,
        errorRate: 0.2,

        systemStatus: "NORMAL",
        overloadRisk: "NO RISK",
        bottleneck: "NONE",

        action: "NORMAL ROUTING",

        queueStatus: "INACTIVE",
        queueSize: 0,
        queuePosition: "-",
        estimatedWait: 0,

        servers: {
            A: 35,
            B: 42,
            C: 38
        }
    },


    {
        source: "DEMO",

        requestsPerSecond: 1200,
        activeUsers: 450,
        responseTime: 220,
        errorRate: 0.8,

        systemStatus: "WARNING",
        overloadRisk: "MEDIUM RISK",
        bottleneck: "Server C",

        action: "MONITORING TRAFFIC",

        queueStatus: "INACTIVE",
        queueSize: 0,
        queuePosition: "-",
        estimatedWait: 0,

        servers: {
            A: 62,
            B: 58,
            C: 72
        }
    },


    {
        source: "DEMO",

        requestsPerSecond: 2500,
        activeUsers: 850,
        responseTime: 420,
        errorRate: 2.4,

        systemStatus: "HIGH LOAD",
        overloadRisk: "HIGH RISK",
        bottleneck: "Server A",

        action: "ROUTING TO HEALTHY SERVER",

        queueStatus: "INACTIVE",
        queueSize: 0,
        queuePosition: "-",
        estimatedWait: 0,

        servers: {
            A: 85,
            B: 52,
            C: 70
        }
    },


    {
        source: "DEMO",

        requestsPerSecond: 4000,
        activeUsers: 1500,
        responseTime: 780,
        errorRate: 6.5,

        systemStatus: "CRITICAL",
        overloadRisk: "CRITICAL RISK",
        bottleneck: "Server C",

        action: "WAITING ROOM ACTIVE",

        queueStatus: "ACTIVE",
        queueSize: 126,
        queuePosition: 127,
        estimatedWait: 25,

        servers: {
            A: 94,
            B: 92,
            C: 97
        }
    },


    {
        source: "DEMO",

        requestsPerSecond: 1800,
        activeUsers: 700,
        responseTime: 300,
        errorRate: 1.2,

        systemStatus: "WARNING",
        overloadRisk: "LOW RISK",
        bottleneck: "Server A",

        action: "RECOVERY IN PROGRESS",

        queueStatus: "ACTIVE",
        queueSize: 45,
        queuePosition: 46,
        estimatedWait: 10,

        servers: {
            A: 68,
            B: 55,
            C: 62
        }
    },


    {
        source: "DEMO",

        requestsPerSecond: 500,
        activeUsers: 180,
        responseTime: 120,
        errorRate: 0.2,

        systemStatus: "NORMAL",
        overloadRisk: "NO RISK",
        bottleneck: "NONE",

        action: "NORMAL ROUTING",

        queueStatus: "INACTIVE",
        queueSize: 0,
        queuePosition: "-",
        estimatedWait: 0,

        servers: {
            A: 35,
            B: 42,
            C: 38
        }
    }

];


// =========================================================
// SERVER STATUS
// =========================================================

function getServerStatus(load) {

    if (load < 60) {
        return "NORMAL";
    }

    if (load < 80) {
        return "WARNING";
    }

    if (load <= 90) {
        return "HIGH LOAD";
    }

    return "CRITICAL";
}


// =========================================================
// SERVER COLOR
// =========================================================

function getServerColor(load) {

    if (load < 60) {
        return "#35e58a";
    }

    if (load < 80) {
        return "#f5c451";
    }

    if (load <= 90) {
        return "#ff914d";
    }

    return "#ff5364";
}


// =========================================================
// UPDATE SERVER
// =========================================================

function updateServer(
    loadElement,
    progressElement,
    statusElement,
    loadOrInfo
) {

    // -------------------------
    // DEMO MODE
    // -------------------------

    if (typeof loadOrInfo === "number") {

        const load =
            Math.max(
                0,
                Math.min(100, loadOrInfo)
            );

        loadElement.textContent =
            load + "%";

        progressElement.style.width =
            load + "%";

        const status =
            getServerStatus(load);

        statusElement.textContent =
            status;

        const color =
            getServerColor(load);

        progressElement.style.background =
            color;

        progressElement.style.boxShadow =
            `0 0 15px ${color}`;

        statusElement.style.color =
            color;

        statusElement.style.background =
            `${color}14`;

        statusElement.style.borderColor =
            `${color}35`;

        return;
    }


    // -------------------------
    // BACKEND MODE
    // -------------------------

    const info =
        loadOrInfo || {};

    const isHealthy =
        String(info.status || "")
            .toLowerCase() === "healthy";

    const color =
        isHealthy
            ? "#35e58a"
            : "#ff5364";

    /*
     * Person 1 backend currently
     * reports health status only.
     * It does not report numeric
     * CPU/load percentage.
     */

    loadElement.textContent =
        "—";

    progressElement.style.width =
        "0%";

    progressElement.style.background =
        color;

    progressElement.style.boxShadow =
        `0 0 15px ${color}`;

    statusElement.textContent =
        isHealthy
            ? "ONLINE"
            : "OFFLINE";

    statusElement.style.color =
        color;

    statusElement.style.background =
        `${color}14`;

    statusElement.style.borderColor =
        `${color}35`;
}


// =========================================================
// SYSTEM STATUS COLOR
// =========================================================

function updateSystemStatus(status) {

    systemStatus.classList.remove(
        "status-normal",
        "status-warning",
        "status-high",
        "status-critical"
    );


    if (status === "NORMAL") {

        systemStatus.classList.add(
            "status-normal"
        );

    }

    else if (status === "WARNING") {

        systemStatus.classList.add(
            "status-warning"
        );

    }

    else if (status === "HIGH LOAD") {

        systemStatus.classList.add(
            "status-high"
        );

    }

    else if (status === "CRITICAL") {

        systemStatus.classList.add(
            "status-critical"
        );

    }


    if (heroStatus) {

        heroStatus.textContent =
            status;

        heroStatus.className = "";

        if (status === "NORMAL") {

            heroStatus.style.color =
                "#35e58a";
        }

        else if (status === "WARNING") {

            heroStatus.style.color =
                "#f5c451";
        }

        else if (status === "HIGH LOAD") {

            heroStatus.style.color =
                "#ff914d";
        }

        else {

            heroStatus.style.color =
                "#ff5364";
        }

    }

}


// =========================================================
// UPDATE DASHBOARD
// =========================================================

function updateDashboard(data) {

    // -------------------------
    // MAIN METRICS
    // -------------------------

    const rps =
        Number(data.requestsPerSecond);

    requestsPerSecond.textContent =
        Number.isFinite(rps)
            ? rps.toLocaleString()
            : "—";


    const users =
        Number(data.activeUsers);

    activeUsers.textContent =
        Number.isFinite(users)
            ? users.toLocaleString()
            : "—";


    if (
        data.responseTime === "—" ||
        data.responseTime === null ||
        data.responseTime === undefined
    ) {

        responseTime.textContent =
            "—";

    }
    else {

        responseTime.textContent =
            data.responseTime + " ms";
    }


    if (
        data.errorRate === "—" ||
        data.errorRate === null ||
        data.errorRate === undefined
    ) {

        errorRate.textContent =
            "—";

    }
    else {

        errorRate.textContent =
            data.errorRate + "%";
    }


    // -------------------------
    // SERVERS
    // -------------------------

    updateServer(
        serverALoad,
        serverAProgress,
        serverAStatus,
        data.servers.A
    );


    updateServer(
        serverBLoad,
        serverBProgress,
        serverBStatus,
        data.servers.B
    );


    updateServer(
        serverCLoad,
        serverCProgress,
        serverCStatus,
        data.servers.C
    );


    // -------------------------
    // SYSTEM INTELLIGENCE
    // -------------------------

    systemStatus.textContent =
        data.systemStatus;

    overloadRisk.textContent =
        data.overloadRisk;

    bottleneck.textContent =
        data.bottleneck;


    updateSystemStatus(
        data.systemStatus
    );


    // -------------------------
    // TRAFFIC CONTROL
    // -------------------------

    trafficAction.textContent =
        data.action;


    if (data.source === "BACKEND") {

        if (
            data.systemStatus ===
            "NORMAL"
        ) {

            trafficDecision.textContent =
                "Normal routing";

            trafficReason.textContent =
                "All registered servers are healthy";
        }

        else if (
            data.systemStatus ===
            "WARNING"
        ) {

            trafficDecision.textContent =
                "Avoid unhealthy server";

            trafficReason.textContent =
                data.bottleneck +
                " is offline";
        }

        else if (
            data.systemStatus ===
            "CRITICAL"
        ) {

            trafficDecision.textContent =
                "Protect backend availability";

            trafficReason.textContent =
                "All registered servers are offline";
        }

        else {

            trafficDecision.textContent =
                "Backend health monitoring";

            trafficReason.textContent =
                "Waiting for monitoring data";
        }

    }

    else {

        // -------------------------
        // EXISTING DEMO BEHAVIOUR
        // -------------------------

        if (
            data.systemStatus ===
            "NORMAL"
        ) {

            trafficDecision.textContent =
                "Normal traffic distribution";

            trafficReason.textContent =
                "All servers operating normally";
        }

        else if (
            data.systemStatus ===
            "WARNING"
        ) {

            trafficDecision.textContent =
                "Continue monitoring traffic";

            trafficReason.textContent =
                "Traffic increase detected";
        }

        else if (
            data.systemStatus ===
            "HIGH LOAD"
        ) {

            trafficDecision.textContent =
                "Redirect traffic";

            trafficReason.textContent =
                data.bottleneck +
                " is under high load";
        }

        else if (
            data.systemStatus ===
            "CRITICAL"
        ) {

            trafficDecision.textContent =
                "Activate waiting room";

            trafficReason.textContent =
                "All available servers are heavily loaded";
        }

    }


    // -------------------------
    // QUEUE
    // -------------------------

    queueStatus.textContent =
        data.queueStatus;

    queueSize.textContent =
        data.queueSize;

    queuePosition.textContent =
        data.queuePosition;


    if (
        data.estimatedWait === "—" ||
        data.estimatedWait === null ||
        data.estimatedWait === undefined
    ) {

        estimatedWait.textContent =
            "—";

    }
    else {

        estimatedWait.textContent =
            data.estimatedWait + " sec";
    }


    // -------------------------
    // LIVE EVENT
    // -------------------------

    addEventForState(data);

}


// =========================================================
// LIVE EVENTS
// =========================================================

function addEvent(message) {

    const now =
        new Date();

    const time =
        now.toLocaleTimeString();


    const event =
        document.createElement("div");

    event.className =
        "event";


    event.innerHTML = `
        <span class="event-time">
            ${time}
        </span>

        <span class="event-message">
            ${message}
        </span>
    `;


    eventList.prepend(
        event
    );


    while (
        eventList.children.length >
        8
    ) {

        eventList.removeChild(
            eventList.lastChild
        );

    }

}


// =========================================================
// EVENT BASED ON STATE
// =========================================================

let lastEventState = "";


function addEventForState(data) {

    const currentState =
        data.source +
        "-" +
        data.systemStatus +
        "-" +
        data.action +
        "-" +
        data.bottleneck;


    if (
        currentState ===
        lastEventState
    ) {

        return;
    }


    lastEventState =
        currentState;


    // -------------------------
    // BACKEND EVENTS
    // -------------------------

    if (
        data.source ===
        "BACKEND"
    ) {

        if (
            data.systemStatus ===
            "NORMAL"
        ) {

            addEvent(
                "All backend servers are healthy"
            );
        }

        else if (
            data.systemStatus ===
            "WARNING"
        ) {

            addEvent(
                data.bottleneck +
                " is unavailable"
            );
        }

        else if (
            data.systemStatus ===
            "CRITICAL"
        ) {

            addEvent(
                "All backend servers are unavailable"
            );
        }

        return;
    }


    // -------------------------
    // DEMO EVENTS
    // -------------------------

    if (
        data.systemStatus ===
        "NORMAL"
    ) {

        addEvent(
            "System operating normally"
        );

    }

    else if (
        data.systemStatus ===
        "WARNING"
    ) {

        addEvent(
            "Traffic increase detected"
        );

    }

    else if (
        data.systemStatus ===
        "HIGH LOAD"
    ) {

        addEvent(
            "High server load detected"
        );

    }

    else if (
        data.systemStatus ===
        "CRITICAL"
    ) {

        addEvent(
            "Critical overload risk detected"
        );

    }


    if (
        data.action ===
        "ROUTING TO HEALTHY SERVER"
    ) {

        addEvent(
            "Traffic redirected to healthier server"
        );

    }


    if (
        data.action ===
        "WAITING ROOM ACTIVE"
    ) {

        addEvent(
            "Virtual waiting room activated"
        );

    }


    if (
        data.action ===
        "RECOVERY IN PROGRESS"
    ) {

        addEvent(
            "System recovery in progress"
        );

    }

}


// =========================================================
// DEMO CONTROL
// =========================================================

let demoIndex =
    0;

let demoInterval =
    null;


// =========================================================
// START DEMO
// =========================================================

function startDemo() {

    if (
        demoInterval !==
        null
    ) {

        return;
    }


    demoIndex =
        0;

    lastEventState =
        "";


    updateDashboard(
        demoData[demoIndex]
    );


    demoInterval =
        setInterval(() => {

            demoIndex++;


            if (
                demoIndex >=
                demoData.length
            ) {

                demoIndex =
                    0;
            }


            updateDashboard(
                demoData[demoIndex]
            );

        }, 3000);

}


// =========================================================
// STOP DEMO
// =========================================================

function stopDemo() {

    if (
        demoInterval !==
        null
    ) {

        clearInterval(
            demoInterval
        );
    }


    demoInterval =
        null;

}


// =========================================================
// RESET
// =========================================================

function resetDemo() {

    stopDemo();

    demoIndex =
        0;

    lastEventState =
        "";


    updateDashboard(
        demoData[0]
    );

}


// =========================================================
// BUTTON EVENTS
// =========================================================

document
    .getElementById("startDemo")
    .addEventListener(
        "click",
        startDemo
    );


document
    .getElementById("stopDemo")
    .addEventListener(
        "click",
        stopDemo
    );


document
    .getElementById("resetDemo")
    .addEventListener(
        "click",
        resetDemo
    );


// =========================================================
// BACKEND API
// =========================================================

// Person 1 backend endpoint
const API_URL =
    "http://localhost:3000/api/dashboard";


// Used to calculate approximate RPS
// from the gateway's totalRequests value.
let previousTotalRequests =
    null;

let previousRequestTimestamp =
    null;


// Prevent console flooding.
let backendFailureLogged =
    false;


// =========================================================
// BACKEND DATA ADAPTER
// =========================================================

function normalizeBackendData(
    rawData
) {

    const serverList =
        Array.isArray(
            rawData.servers
        )
            ? rawData.servers
            : [];


    const serverMap = {};


    serverList.forEach(
        server => {

            const match =
                String(
                    server.name ||
                    ""
                )
                    .match(
                        /Server\s+([ABC])/i
                    );


            if (!match) {
                return;
            }


            const key =
                match[1]
                    .toUpperCase();


            serverMap[key] = {

                status:
                    String(
                        server.status ||
                        ""
                    )
                        .toLowerCase()

            };

        }
    );


    const totalServers =
        Number.isFinite(
            Number(
                rawData.totalServers
            )
        )
            ? Number(
                rawData.totalServers
            )
            : serverList.length;


    const healthyServers =
        Number.isFinite(
            Number(
                rawData.healthyServers
            )
        )
            ? Number(
                rawData.healthyServers
            )
            : serverList.filter(
                server =>
                    String(
                        server.status ||
                        ""
                    )
                        .toLowerCase() ===
                    "healthy"
            ).length;


    // -------------------------
    // SYSTEM STATE
    // -------------------------

    let systemStatus =
        "NORMAL";


    if (
        totalServers > 0 &&
        healthyServers === 0
    ) {

        systemStatus =
            "CRITICAL";
    }

    else if (
        totalServers > 0 &&
        healthyServers <
        totalServers
    ) {

        systemStatus =
            "WARNING";
    }


    // -------------------------
    // OFFLINE SERVERS
    // -------------------------

    const offlineNames =
        serverList
            .filter(
                server =>
                    String(
                        server.status ||
                        ""
                    )
                        .toLowerCase() !==
                    "healthy"
            )
            .map(
                server =>
                    server.name
            );


    const bottleneck =
        offlineNames.length > 0
            ? offlineNames.join(
                ", "
            )
            : "NONE";


    // -------------------------
    // RISK
    // -------------------------

    let overloadRisk =
        "NO RISK";


    if (
        systemStatus ===
        "WARNING"
    ) {

        overloadRisk =
            "ATTENTION";
    }


    if (
        systemStatus ===
        "CRITICAL"
    ) {

        overloadRisk =
            "CRITICAL RISK";
    }


    // -------------------------
    // TRAFFIC ACTION
    // -------------------------

    let action =
        "NORMAL ROUTING";


    if (
        systemStatus ===
        "WARNING"
    ) {

        action =
            "ROUTE AROUND OFFLINE SERVER";
    }


    if (
        systemStatus ===
        "CRITICAL"
    ) {

        action =
            "PROTECT BACKEND AVAILABILITY";
    }


    // -------------------------
    // TOTAL REQUESTS
    // -------------------------

    const totalRequests =
        Number.isFinite(
            Number(
                rawData.totalRequests
            )
        )
            ? Number(
                rawData.totalRequests
            )
            : 0;


    // -------------------------
    // APPROXIMATE RPS
    // -------------------------

    const now =
        performance.now();


    let requestsPerSecondValue =
        0;


    if (
        previousTotalRequests !== null &&
        previousRequestTimestamp !== null
    ) {

        const elapsedSeconds =
            (
                now -
                previousRequestTimestamp
            ) / 1000;


        const requestDelta =
            totalRequests -
            previousTotalRequests;


        if (
            elapsedSeconds > 0
        ) {

            requestsPerSecondValue =
                Math.max(
                    0,
                    Math.round(
                        requestDelta /
                        elapsedSeconds
                    )
                );
        }

    }


    previousTotalRequests =
        totalRequests;

    previousRequestTimestamp =
        now;


    // -------------------------
    // NORMALIZED OBJECT
    // -------------------------

    return {

        source:
            "BACKEND",

        requestsPerSecond:
            requestsPerSecondValue,

        // Person 1 does not provide
        // these metrics yet.
        activeUsers:
            "—",

        responseTime:
            "—",

        errorRate:
            "—",


        systemStatus:
            systemStatus,

        overloadRisk:
            overloadRisk,

        bottleneck:
            bottleneck,

        action:
            action,


        // Person 4 will provide these
        // during later integration.
        queueStatus:
            "NOT REPORTED",

        queueSize:
            "—",

        queuePosition:
            "—",

        estimatedWait:
            "—",


        servers: {

            A:
                serverMap.A ||
                {
                    status:
                        "offline"
                },

            B:
                serverMap.B ||
                {
                    status:
                        "offline"
                },

            C:
                serverMap.C ||
                {
                    status:
                        "offline"
                }

        }

    };

}


// =========================================================
// FETCH BACKEND DATA
// =========================================================

async function fetchBackendData() {

    // Do not allow backend polling
    // to overwrite Demo Mode.
    if (
        demoInterval !== null
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Backend response error: HTTP " +
                response.status
            );

        }


        const rawData =
            await response.json();


        const dashboardData =
            normalizeBackendData(
                rawData
            );


        updateDashboard(
            dashboardData
        );


        backendFailureLogged =
            false;


        console.log(
            "Backend data received:",
            rawData
        );

    }

    catch (error) {

        // Keep the dashboard running
        // even if backend temporarily stops.
        if (
            !backendFailureLogged
        ) {

            console.warn(
                "LoadShield backend unavailable:",
                error
            );

            backendFailureLogged =
                true;
        }

    }

}


// =========================================================
// BACKEND POLLING
// =========================================================

setInterval(
    () => {

        fetchBackendData();

    },
    2000
);


// =========================================================
// INITIAL STATE
// =========================================================

updateDashboard(
    demoData[0]
);