const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });

  res.end(JSON.stringify({
    server: "Server A",
    status: "healthy"
  }));
});

server.listen(3001, () => {
  console.log("Server A is running on http://localhost:3001");
});