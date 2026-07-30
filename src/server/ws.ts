import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface ExtWebSocket extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

const clients = new Map<string, Set<ExtWebSocket>>();

wss.on("connection", (ws: ExtWebSocket, req) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    ws.close(4001, "Unauthorized");
    return;
  }

  ws.userId = userId;
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(ws);

  console.log(`User ${userId} connected`);

  ws.on("message", (message) => {
    // Only handling broadcasts for now
    try {
      const data = JSON.parse(message.toString());
      if (data.type === "BOOKMARK_CREATED" || data.type === "BOOKMARK_UPDATED") {
        // Broadcast to all clients of the same user EXCEPT the sender
        const userClients = clients.get(userId);
        if (userClients) {
          userClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      }
    } catch (e) {
      console.error("Invalid message format", e);
    }
  });

  ws.on("close", () => {
    const userClients = clients.get(userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        clients.delete(userId);
      }
    }
    console.log(`User ${userId} disconnected`);
  });
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const extWs = ws as ExtWebSocket;
    if (extWs.isAlive === false) return extWs.terminate();

    extWs.isAlive = false;
    extWs.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

console.log("WebSocket server listening on port 8080");
