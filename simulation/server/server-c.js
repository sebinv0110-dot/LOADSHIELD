const http = require("http");

const PORT = 3003;

let serverLoad = 45;

const LOAD_LEVELS = {
    normal: 45,
    warning: 70,
    high: 85,
    critical: 95
};

function getServerStatus(load) {
    if (load >= 90) {
        return "critical";
    } else if (load >= 80) {
        return "high";
    } else if (load >= 60) {
        return "warning";
    } else {
        return "healthy";
    }
}

function getResponseTime(load) {
    if (load >= 90) {
        return 500;
    } else if (load >= 80) {
        return 350;
    } else if (load >= 60) {
        return 220;
    } else {
        return 120;
    }
}

function getServerData() {
    return {
        server: "Server C",
        status: getServerStatus(serverLoad),
        load: serverLoad,
        responseTime: getResponseTime(serverLoad)
    };
}

const server = http.createServer((req, res) => {

    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET" && req.url === "/") {

        const response = {
            ...getServerData(),
            message: "LoadShield Simulated Server C"
        };

        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
    }

    if (req.method === "GET" && req.url === "/health") {

        res.writeHead(200);
        res.end(JSON.stringify(getServerData(), null, 2));
        return;
    }

    if (req.method === "GET" && req.url === "/status") {

        const response = {
            ...getServerData(),
            port: PORT,
            uptime: process.uptime()
        };

        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
    }

    if (req.method === "GET" && req.url.startsWith("/load/")) {

        const level = req.url.split("/")[2];

        if (LOAD_LEVELS[level] !== undefined) {

            serverLoad = LOAD_LEVELS[level];

            const response = {
                server: "Server C",
                message: "Simulated load updated",
                level: level,
                load: serverLoad,
                status: getServerStatus(serverLoad),
                responseTime: getResponseTime(serverLoad)
            };

            res.writeHead(200);
            res.end(JSON.stringify(response, null, 2));
            return;
        }

        res.writeHead(400);

        res.end(JSON.stringify({
            error: "Invalid load level",
            allowedLevels: Object.keys(LOAD_LEVELS)
        }, null, 2));

        return;
    }

    res.writeHead(404);

    res.end(JSON.stringify({
        error: "Endpoint not found"
    }, null, 2));
});

server.listen(PORT, "localhost", () => {

    console.log("=================================");
    console.log(" LoadShield - Server C");
    console.log("=================================");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("");
    console.log("Health:");
    console.log(`http://localhost:${PORT}/health`);
    console.log("");
    console.log("Load simulation:");
    console.log(`http://localhost:${PORT}/load/normal`);
    console.log(`http://localhost:${PORT}/load/warning`);
    console.log(`http://localhost:${PORT}/load/high`);
    console.log(`http://localhost:${PORT}/load/critical`);
    console.log("");
    console.log(`Current Load: ${serverLoad}%`);
    console.log(`Current Status: ${getServerStatus(serverLoad)}`);
    console.log("=================================");
});