import { createServer } from "node:http";

const PORT = 9876;
const queue = [];
let waitingRes = null;

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === "/poll") {
    if (queue.length > 0) {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(queue.shift());
    } else {
      waitingRes = res;
    }
    return;
  }

  if (req.url === "/exec" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      console.log(`[figma-live] Received command to execute in Figma (${body.length} chars)`);
      if (waitingRes) {
        waitingRes.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        waitingRes.end(body);
        waitingRes = null;
      } else {
        queue.push(body);
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, queued: queue.length }));
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`🚀 [figma-live] Figma Live Bridge Server is listening on http://localhost:${PORT}`);
});
