const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });

  res.end(JSON.stringify({
    server: "Server B",
    status: "healthy"
  }));
});

server.listen(3002, () => {
  console.log("Server B is running on http://localhost:3002");
});