"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ClientSync({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Cross-tab sync using BroadcastChannel
    const bc = new BroadcastChannel("bookmarks-sync");

    bc.onmessage = (event) => {
      if (event.data.type === "BOOKMARK_CREATED" || event.data.type === "BOOKMARK_UPDATED") {
        router.refresh();
      }
    };

    // WebSocket connection to server
    let ws: WebSocket;

    const connectWs = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
      ws = new WebSocket(`${wsUrl}?userId=${userId}`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "BOOKMARK_CREATED" || data.type === "BOOKMARK_UPDATED") {
            router.refresh();
          }
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };

      ws.onclose = () => {
        setTimeout(connectWs, 5000); // Try to reconnect
      };
    };

    connectWs();

    return () => {
      bc.close();
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [userId, router]);

  return null;
}
