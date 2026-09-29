const http = require("http");

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

function checkServer(server) {

    return new Promise((resolve) => {

        const request = http.get(
            {
                hostname: server.host,
                port: server.port,
                path: "/health",
                timeout: 2000
            },
            (response) => {

                let data = "";

                response.on("data", (chunk) => {
                    data += chunk;
                });

                response.on("end", () => {

                    try {

                        const result = JSON.parse(data);

                        resolve({
                            name: server.name,
                            online: true,
                            status: result.status,
                            load: result.load,
                            responseTime: result.responseTime
                        });

                    } catch (error) {

                        resolve({
                            name: server.name,
                            online: false,
                            status: "error",
                            load: null,
                            responseTime: null
                        });
                    }
                });
            }
        );

        request.on("error", () => {

            resolve({
                name: server.name,
                online: false,
                status: "offline",
                load: null,
                responseTime: null
            });
        });

        request.on("timeout", () => {

            request.destroy();

            resolve({
                name: server.name,
                online: false,
                status: "timeout",
                load: null,
                responseTime: null
            });
        });
    });
}

async function monitorServers() {

    console.clear();

    console.log("==============================================");
    console.log("        LoadShield Server Monitor");
    console.log("==============================================");
    console.log(`Time: ${new Date().toLocaleTimeString()}`);
    console.log("");

    const results = await Promise.all(
        SERVERS.map(checkServer)
    );

    results.forEach((server) => {

        console.log("----------------------------------------------");

        console.log(`Server: ${server.name}`);

        if (!server.online) {

            console.log("Status: OFFLINE");
            console.log("Load:   --");
            console.log("Response Time: --");

            return;
        }

        console.log(`Status: ${server.status.toUpperCase()}`);
        console.log(`Load:   ${server.load}%`);
        console.log(`Response Time: ${server.responseTime} ms`);
    });

    console.log("----------------------------------------------");
    console.log("");
    console.log("Monitoring every 2 seconds...");
    console.log("Press Ctrl + C to stop.");
}

monitorServers();

setInterval(monitorServers, 2000);