const fs = require("fs");

// Read monitoring data
const metrics = JSON.parse(
    fs.readFileSync("metrics.json", "utf8")
);

// Read configuration
const config = JSON.parse(
    fs.readFileSync("config.json", "utf8")
);

// Previous and current traffic
const previousTraffic = 1000;
const currentTraffic = metrics.requestsPerSecond;

// Calculate traffic increase
const trafficIncrease = currentTraffic - previousTraffic;

// Predict next traffic level
const predictedTraffic = currentTraffic + trafficIncrease;

// Get server capacity
const capacity = config.capacity;

// Determine overload risk
let overloadRisk;

if (predictedTraffic > capacity) {
    overloadRisk = "HIGH";
} else {
    overloadRisk = "LOW";
}

// Display prediction
console.log("=================================");
console.log("    LOADSHIELD OVERLOAD PREDICTION");
console.log("=================================");

console.log("Previous traffic:", previousTraffic, "req/s");
console.log("Current traffic:", currentTraffic, "req/s");
console.log("Traffic increase:", trafficIncrease, "req/s");

console.log("---------------------------------");

console.log("Predicted traffic:", predictedTraffic, "req/s");
console.log("Server capacity:", capacity, "req/s");
console.log("Overload Risk:", overloadRisk);

console.log("=================================");