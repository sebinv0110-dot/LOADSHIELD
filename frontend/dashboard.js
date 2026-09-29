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
    load
) {

    loadElement.textContent = load + "%";

    progressElement.style.width = load + "%";

    const status = getServerStatus(load);

    statusElement.textContent = status;

    const color = getServerColor(load);

    progressElement.style.background = color;

    progressElement.style.boxShadow =
        `0 0 15px ${color}`;

    statusElement.style.color = color;

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

        heroStatus.textContent = status;

        heroStatus.className = "";

        if (status === "NORMAL") {
            heroStatus.style.color = "#35e58a";
        }

        else if (status === "WARNING") {
            heroStatus.style.color = "#f5c451";
        }

        else if (status === "HIGH LOAD") {
            heroStatus.style.color = "#ff914d";
        }

        else {
            heroStatus.style.color = "#ff5364";
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

    requestsPerSecond.textContent =
        data.requestsPerSecond.toLocaleString();

    activeUsers.textContent =
        data.activeUsers.toLocaleString();

    responseTime.textContent =
        data.responseTime + " ms";

    errorRate.textContent =
        data.errorRate + "%";


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


    if (data.systemStatus === "NORMAL") {

        trafficDecision.textContent =
            "Normal traffic distribution";

        trafficReason.textContent =
            "All servers operating normally";

    }

    else if (data.systemStatus === "WARNING") {

        trafficDecision.textContent =
            "Continue monitoring traffic";

        trafficReason.textContent =
            "Traffic increase detected";

    }

    else if (data.systemStatus === "HIGH LOAD") {

        trafficDecision.textContent =
            "Redirect traffic";

        trafficReason.textContent =
            data.bottleneck +
            " is under high load";

    }

    else if (data.systemStatus === "CRITICAL") {

        trafficDecision.textContent =
            "Activate waiting room";

        trafficReason.textContent =
            "All available servers are heavily loaded";

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

    estimatedWait.textContent =
        data.estimatedWait + " sec";


    // -------------------------
    // EVENT
    // -------------------------

    addEventForState(data);

}


// =========================================================
// LIVE EVENTS
// =========================================================

function addEvent(message) {

    const now = new Date();

    const time =
        now.toLocaleTimeString();

    const event =
        document.createElement("div");

    event.className = "event";

    event.innerHTML = `
        <span class="event-time">
            ${time}
        </span>

        <span class="event-message">
            ${message}
        </span>
    `;

    eventList.prepend(event);


    while (eventList.children.length > 8) {

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
        data.systemStatus +
        "-" +
        data.action;


    if (currentState === lastEventState) {
        return;
    }


    lastEventState = currentState;


    if (data.systemStatus === "NORMAL") {

        addEvent(
            "System operating normally"
        );

    }

    else if (data.systemStatus === "WARNING") {

        addEvent(
            "Traffic increase detected"
        );

    }

    else if (data.systemStatus === "HIGH LOAD") {

        addEvent(
            "High server load detected"
        );

    }

    else if (data.systemStatus === "CRITICAL") {

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

let demoIndex = 0;

let demoInterval = null;


// =========================================================
// START DEMO
// =========================================================

function startDemo() {

    if (demoInterval !== null) {
        return;
    }


    demoIndex = 0;

    lastEventState = "";

    updateDashboard(
        demoData[demoIndex]
    );


    demoInterval = setInterval(() => {

        demoIndex++;


        if (
            demoIndex >=
            demoData.length
        ) {

            demoIndex = 0;

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

    clearInterval(
        demoInterval
    );

    demoInterval = null;

}


// =========================================================
// RESET
// =========================================================

function resetDemo() {

    stopDemo();

    demoIndex = 0;

    lastEventState = "";

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

const API_URL =
    "http://localhost:3000/api/status";


async function fetchBackendData() {

    try {

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Backend response error"
            );

        }


        const data =
            await response.json();


        updateDashboard(data);


        console.log(
            "Backend data received:",
            data
        );

    }

    catch (error) {

        console.log(
            "Backend is not connected yet."
        );

    }

}


// Check backend every 2 seconds
// Backend polling disabled temporarily.
// Will be enabled when Person 1's backend is connected.

// setInterval(() => {
//     fetchBackendData();
// }, 2000);

// =========================================================
// INITIAL STATE
// =========================================================

updateDashboard(
    demoData[0]
);