const fs = require("fs");

// Read monitoring data
const metrics = JSON.parse(
    fs.readFileSync("metrics.json", "utf8")
);

// Get server names
const serverNames = Object.keys(metrics.servers);

// Find the server with the highest load
let bottleneckServer = serverNames[0];
let highestLoad = metrics.servers[bottleneckServer];

for (const server of serverNames) {
    if (metrics.servers[server] > highestLoad) {
        highestLoad = metrics.servers[server];
        bottleneckServer = server;
    }
}

// Display bottleneck information
console.log("=================================");
console.log("     LOADSHIELD BOTTLENECK");
console.log("=================================");

console.log("Server A:", metrics.servers["Server A"] + "%");
console.log("Server B:", metrics.servers["Server B"] + "%");
console.log("Server C:", metrics.servers["Server C"] + "%");

console.log("---------------------------------");

console.log("Bottleneck:", bottleneckServer);
console.log("Load:", highestLoad + "%");

console.log("=================================");