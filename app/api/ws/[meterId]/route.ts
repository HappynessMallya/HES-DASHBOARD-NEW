import { NextRequest } from "next/server";
import WebSocket from "ws";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const maxDuration = 300; // 5 min max for streaming

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ meterId: string }> }
) {
  const { meterId } = await params;

  const interval = request.nextUrl.searchParams.get("interval") || "5";
  const objects = request.nextUrl.searchParams.get("objects") || "energy,voltage,current,power,balance";

  const wsUrl = BACKEND_URL.replace(/^http/, "ws") + `/ws/meters/${meterId}/live`;

  const encoder = new TextEncoder();
  let ws: WebSocket | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send a comment to keep the connection alive initially
      controller.enqueue(encoder.encode(": connected\n\n"));

      ws = new WebSocket(wsUrl);

      ws.on("open", () => {
        // Configure the backend WebSocket
        ws!.send(
          JSON.stringify({
            interval: Number(interval),
            objects: objects.split(","),
          })
        );
        controller.enqueue(
          encoder.encode(`event: connected\ndata: {"status":"connected"}\n\n`)
        );
      });

      ws.on("message", (data) => {
        const message = data.toString();
        controller.enqueue(encoder.encode(`event: reading\ndata: ${message}\n\n`));
      });

      ws.on("close", () => {
        controller.enqueue(
          encoder.encode(`event: disconnected\ndata: {"status":"disconnected"}\n\n`)
        );
        controller.close();
      });

      ws.on("error", () => {
        controller.enqueue(
          encoder.encode(`event: error\ndata: {"error":"WebSocket connection failed"}\n\n`)
        );
        controller.close();
      });

      // Keep-alive ping every 30s
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 30000);

      // Clean up when the client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ stop: true }));
          ws.close();
        }
      });
    },
    cancel() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ stop: true }));
        ws.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
