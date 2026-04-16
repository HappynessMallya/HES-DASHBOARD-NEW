"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getWsUrl } from "../api";
import type { LiveMeterMessage } from "../types";

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

export function useLiveMeter(meterId: string | null) {
  const [data, setData] = useState<LiveMeterMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState<LiveMeterMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (!meterId || unmountedRef.current) return;

    const url = getWsUrl(meterId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retriesRef.current = 0;
    };

    ws.onclose = () => {
      setConnected(false);
      if (unmountedRef.current) return;
      const delay = RECONNECT_DELAYS[Math.min(retriesRef.current, RECONNECT_DELAYS.length - 1)];
      retriesRef.current++;
      setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (e) => {
      try {
        const msg: LiveMeterMessage = JSON.parse(e.data);
        setData(msg);
        if (msg.type === "reading") {
          setHistory((prev) => [...prev.slice(-99), msg]);
        }
      } catch {
        // ignore malformed messages
      }
    };
  }, [meterId]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      if (wsRef.current) {
        try {
          wsRef.current.send(JSON.stringify({ stop: true }));
        } catch {
          // already closed
        }
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
      setData(null);
      setHistory([]);
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    unmountedRef.current = true;
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ stop: true }));
      } catch {
        // already closed
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  return { data, connected, history, disconnect };
}
