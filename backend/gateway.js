const http = require("http");

function forwardRequest(targetServer, req, res) {
  const targetUrl = new URL(targetServer.url);

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: "/",
    method: "GET"
  };

  const proxy = http.request(options, (serverRes) => {
    res.statusCode = serverRes.statusCode;

    for (const [key, value] of Object.entries(serverRes.headers)) {
      res.setHeader(key, value);
    }

    serverRes.pipe(res);
  });

  proxy.on("error", (error) => {
    console.error("Gateway error:", error.message);

    if (!res.headersSent) {
      res.writeHead(502, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: "Backend server unavailable"
      }));
    }
  });

  proxy.end();
}

module.exports = {
  forwardRequest
};