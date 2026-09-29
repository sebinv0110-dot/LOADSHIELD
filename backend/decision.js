const http = require("http");
const requestCounts = {};

let currentServer = 0;

function checkServer(server) {
  return new Promise((resolve) => {
    const request = http.get(server.url, (response) => {
      response.resume();

      if (response.statusCode >= 200 && response.statusCode < 400) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    request.on("error", () => {
      resolve(false);
    });

    request.setTimeout(2000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function chooseHealthyServer(servers) {
  if (!servers || servers.length === 0) {
    return null;
  }

  // Try every server, starting from the current position.
  for (let i = 0; i < servers.length; i++) {
    const index = (currentServer + i) % servers.length;
    const server = servers[index];

    const healthy = await checkServer(server);

    if (healthy) {
  // Next request starts after this server.
  currentServer = (index + 1) % servers.length;

  requestCounts[server.name] = (requestCounts[server.name] || 0) + 1;

  return server;
}
  }

  return null;
}

module.exports = {
  checkServer,
  chooseHealthyServer,
  requestCounts
};