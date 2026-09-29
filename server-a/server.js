const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });

  res.end(JSON.stringify({
    server: "Server A",
    status: "healthy",
    message: "Server A is responding"
  }));
});

server.listen(3001, () => {
  console.log("Server A running on http://localhost:3001");
});