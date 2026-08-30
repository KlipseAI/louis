import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 9876;

const server = createServer();
const wss = new WebSocketServer({ server });

let clientSocket = null;

wss.on("connection", (ws) => {
  console.log("⚡ [figma-live] Figma Plugin connected to Live Bridge!");
  clientSocket = ws;
  ws.send(`figma.notify("⚡ [KDS] Antigravity Live Bridge 연결됨! 이제 에이전트가 직접 제어합니다.", { timeout: 3000 });`);

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log(`[figma-client]`, data);
    } catch (e) {
      console.log(`[figma-client]`, msg.toString());
    }
  });

  ws.on("close", () => {
    console.log("🔌 [figma-live] Figma disconnected.");
    clientSocket = null;
  });
});

server.listen(PORT, () => {
  console.log(`🚀 [figma-live] Figma Live Bridge Server running on ws://localhost:${PORT}`);
});

export function sendToFigma(code) {
  if (!clientSocket || clientSocket.readyState !== 1) {
    throw new Error("Figma is not connected to Live Bridge.");
  }
  clientSocket.send(code);
}
