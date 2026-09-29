const fs = require("fs");

// Read monitoring data
const metrics = JSON.parse(
    fs.readFileSync("metrics.json", "utf8")
);

// Read configuration
const config = JSON.parse(
    fs.readFileSync("config.json", "utf8")
);

// Get server loads
const serverLoads = Object.values(metrics.servers);

// Find highest server load
const highestLoad = Math.max(...serverLoads);

// Determine system status
let systemStatus;

if (highestLoad < config.statusThresholds.normal) {
    systemStatus = "NORMAL";
} else if (highestLoad < config.statusThresholds.warning) {
    systemStatus = "WARNING";
} else if (highestLoad < config.statusThresholds.highLoad) {
    systemStatus = "HIGH_LOAD";
} else {
    systemStatus = "CRITICAL";
}

// Traffic surge detection
const normalTraffic = 1000;

const surgeLimit =
    normalTraffic * config.surgeMultiplier;

let surgeDetected;

if (metrics.requestsPerSecond > surgeLimit) {
    surgeDetected = true;
} else {
    surgeDetected = false;
}

// Display monitoring information
console.log("=================================");
console.log("       LOADSHIELD MONITORING");
console.log("=================================");

console.log("Requests/sec:", metrics.requestsPerSecond);
console.log("Active users:", metrics.activeUsers);
console.log("Response time:", metrics.responseTime, "ms");
console.log("Error rate:", metrics.errorRate + "%");

console.log("Server A:", metrics.servers["Server A"] + "%");
console.log("Server B:", metrics.servers["Server B"] + "%");
console.log("Server C:", metrics.servers["Server C"] + "%");

console.log("---------------------------------");

console.log("Normal traffic:", normalTraffic, "req/s");
console.log("Surge limit:", surgeLimit, "req/s");

if (surgeDetected) {
    console.log("Traffic Surge: DETECTED");
} else {
    console.log("Traffic Surge: NOT DETECTED");
}

console.log("---------------------------------");
console.log("Highest server load:", highestLoad + "%");
console.log("System Status:", systemStatus);

console.log("=================================");