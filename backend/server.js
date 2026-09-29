const http = require("http");
const config = require("./config.json");
const { getNextServer } = require("./router");
const { forwardRequest } = require("./gateway");
const { chooseHealthyServer, requestCounts } = require("./decision");

let totalRequests = 0;

const server = http.createServer(async (req, res) => {

  // Count only actual LoadShield traffic
  if (req.url === "/api/request" && req.method === "GET") {
    totalRequests++;
  }

  // Forward request through gateway
  if (req.url === "/api/request" && req.method === "GET") {
    const nextServer = await chooseHealthyServer(config.servers);

    if (!nextServer) {
      res.writeHead(503, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: "No healthy servers available"
      }));

      return;
    }

    forwardRequest(nextServer, req, res);
    return;
  }

  // Health check
  if (req.url === "/api/health" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      status: "ok"
    }));

    return;
  }

  // Check server health status
  if (req.url === "/api/status" && req.method === "GET") {
    const statuses = await Promise.all(
      config.servers.map(async (server) => {
        const healthy = await require("./decision").checkServer(server);

        return {
          name: server.name,
          url: server.url,
          status: healthy ? "healthy" : "offline"
        };
      })
    );

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(statuses));

    return;
  }

  // Dashboard information
  if (req.url === "/api/dashboard" && req.method === "GET") {
    const statuses = await Promise.all(
      config.servers.map(async (server) => {
        const healthy = await require("./decision").checkServer(server);

        return {
          name: server.name,
          url: server.url,
          status: healthy ? "healthy" : "offline"
        };
      })
    );

    const healthyServers = statuses.filter(
      (server) => server.status === "healthy"
    ).length;

    const offlineServers = statuses.filter(
      (server) => server.status === "offline"
    ).length;

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      system: "LoadShield",
      status: "running",
      totalRequests,
      totalServers: statuses.length,
      healthyServers,
      offlineServers,
      servers: statuses,
      requestCounts
    }));

    return;
  }

  // Get all configured servers
  if (req.url === "/api/servers" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(config.servers));

    return;
  }

  // Get the next server
  if (req.url === "/api/next-server" && req.method === "GET") {
    const nextServer = getNextServer();

    if (!nextServer) {
      res.writeHead(503, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: "No servers available"
      }));

      return;
    }

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(nextServer));

    return;
  }

  // Default response
  res.writeHead(200, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify({
    message: "LoadShield server is running"
  }));
});

server.listen(3000, () => {
  console.log("LoadShield is running on http://localhost:3000");
});