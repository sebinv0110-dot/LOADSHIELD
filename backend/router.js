const config = require("./config.json");

let currentServer = 0;

function getNextServer() {
  const servers = config.servers;

  if (!servers || servers.length === 0) {
    return null;
  }

  const server = servers[currentServer];

  currentServer = (currentServer + 1) % servers.length;

  return server;
}

module.exports = {
  getNextServer
};