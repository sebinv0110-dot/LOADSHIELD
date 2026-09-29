const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });

  res.end(JSON.stringify({
    server: "Server C",
    status: "healthy",
    message: "Server C is responding"
  }));
});

server.listen(3003, () => {
  console.log("Server C running on http://localhost:3003");
});