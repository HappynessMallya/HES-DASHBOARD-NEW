"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MeterSelector } from "@/components/shared/meter-selector";
import { StatCard } from "@/components/shared/stat-card";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import type { MeterOut, LiveReadResponse } from "@/lib/types";
import {
  Radio,
  RadioOff,
  Zap,
  Activity,
  Gauge,
  Power,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const AVAILABLE_OBJECTS = [
  { key: "energy", label: "Energy" },
  { key: "voltage", label: "Voltage" },
  { key: "current", label: "Current" },
  { key: "power", label: "Power" },
  { key: "balance", label: "Balance" },
];

const SERIES_CONFIG: Record<string, { color: string; icon: typeof Zap; unit: string }> = {
  energy: { color: "#16a34a", icon: Zap, unit: "kWh" },
  voltage: { color: "#0ea5e9", icon: Activity, unit: "V" },
  current: { color: "#f59e0b", icon: Gauge, unit: "A" },
  power: { color: "#8b5cf6", icon: Power, unit: "kW" },
  balance: { color: "#ef4444", icon: Wallet, unit: "kWh" },
};

const MAX_POINTS = 60;

// Use SSE proxy in production (HTTPS), direct WebSocket locally
function getLiveUrl(meterId: string, interval: string, objects: string[]): { type: "sse" | "ws"; url: string } {
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

  if (isHttps) {
    // SSE proxy through Next.js API route
    const params = new URLSearchParams({
      interval,
      objects: objects.join(","),
    });
    return { type: "sse", url: `/api/ws/${meterId}?${params}` };
  }

  // Direct WebSocket for local dev
  const directUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const wsBase = directUrl.replace(/^http/, "ws");
  return { type: "ws", url: `${wsBase}/ws/meters/${meterId}/live` };
}

export default function LiveReadingsPage() {
  const [meters, setMeters] = useState<MeterOut[]>([]);
  const [selectedMeter, setSelectedMeter] = useState("");
  const [interval, setInterval_] = useState("5");
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(
    new Set(["energy", "voltage", "current", "power", "balance"])
  );
  const [connected, setConnected] = useState(false);
  const [latestReading, setLatestReading] = useState<Record<string, number | null>>({});
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);

  const connectionRef = useRef<EventSource | WebSocket | null>(null);
  const reconnectRef = useRef<number>(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api<MeterOut[]>("/api/meters")
      .then(setMeters)
      .catch(() => toast.error("Failed to load meters"));
  }, []);

  const handleReading = useCallback((data: LiveReadResponse) => {
    setLatestReading(data.readings);
    setChartData((prev) => {
      const point: Record<string, unknown> = {
        time: format(new Date(data.timestamp), "HH:mm:ss"),
      };
      for (const [key, val] of Object.entries(data.readings)) {
        point[key] = val;
      }
      const next = [...prev, point];
      return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
    });
  }, []);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (connectionRef.current) {
      if (connectionRef.current instanceof EventSource) {
        connectionRef.current.close();
      } else {
        connectionRef.current.close();
      }
      connectionRef.current = null;
    }
    setConnected(false);
  }, []);

  const scheduleReconnect = useCallback((connectFn: () => void) => {
    const delay = Math.min(1000 * Math.pow(2, reconnectRef.current), 30000);
    reconnectRef.current++;
    reconnectTimerRef.current = setTimeout(connectFn, delay);
  }, []);

  const connectStream = useCallback(() => {
    if (!selectedMeter) return;
    cleanup();

    const objectsArray = Array.from(selectedObjects);
    const { type, url } = getLiveUrl(selectedMeter, interval, objectsArray);

    if (type === "sse") {
      // SSE mode (production via Vercel proxy)
      const es = new EventSource(url);
      connectionRef.current = es;

      es.addEventListener("connected", () => {
        setConnected(true);
        reconnectRef.current = 0;
      });

      es.addEventListener("reading", (event) => {
        try {
          const data: LiveReadResponse = JSON.parse(event.data);
          handleReading(data);
        } catch {
          // Ignore parse errors
        }
      });

      es.addEventListener("disconnected", () => {
        setConnected(false);
        es.close();
        scheduleReconnect(connectStream);
      });

      es.addEventListener("error", () => {
        setConnected(false);
        es.close();
        scheduleReconnect(connectStream);
      });

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) {
          setConnected(false);
          scheduleReconnect(connectStream);
        }
      };
    } else {
      // WebSocket mode (local dev)
      const ws = new WebSocket(url);
      connectionRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectRef.current = 0;
        ws.send(
          JSON.stringify({
            interval: Number(interval),
            objects: objectsArray,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data: LiveReadResponse = JSON.parse(event.data);
          handleReading(data);
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnected(false);
        scheduleReconnect(connectStream);
      };

      ws.onerror = () => {
        // onclose will fire after onerror
      };
    }
  }, [selectedMeter, interval, selectedObjects, cleanup, handleReading, scheduleReconnect]);

  const disconnect = useCallback(() => {
    if (connectionRef.current instanceof WebSocket) {
      if (connectionRef.current.readyState === WebSocket.OPEN) {
        connectionRef.current.send(JSON.stringify({ stop: true }));
      }
    }
    cleanup();
    reconnectRef.current = 0;
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const toggleObject = (key: string) => {
    setSelectedObjects((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14532d]">Live Readings</h1>

      {/* Controls */}
      <Card className="border-[#bbf7d0]">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label>Meter</Label>
              <MeterSelector
                meters={meters}
                value={selectedMeter}
                onValueChange={(v) => {
                  setSelectedMeter(v);
                  setChartData([]);
                  setLatestReading({});
                }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ws-interval">Interval (sec)</Label>
              <Input
                id="ws-interval"
                type="number"
                value={interval}
                onChange={(e) => setInterval_(e.target.value)}
                min={1}
                max={60}
                className="w-20"
              />
            </div>
            <div>
              {connected ? (
                <Button variant="outline" onClick={disconnect} className="border-[#dc2626] text-[#dc2626] hover:bg-red-50">
                  <RadioOff className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={connectStream}
                  disabled={!selectedMeter}
                  className="bg-[#16a34a] hover:bg-[#15803d]"
                >
                  <Radio className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              )}
            </div>
            <Badge
              variant="outline"
              className={
                connected
                  ? "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]"
                  : "bg-gray-50 text-[#6b7280] border-gray-200"
              }
            >
              <span
                className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                  connected ? "bg-[#16a34a] animate-pulse-dot" : "bg-[#6b7280]"
                }`}
              />
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {/* Object toggles */}
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_OBJECTS.map((obj) => (
              <button
                key={obj.key}
                onClick={() => toggleObject(obj.key)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  selectedObjects.has(obj.key)
                    ? "bg-[#16a34a] text-white border-transparent"
                    : "border-[#bbf7d0] bg-white text-[#6b7280] hover:bg-[#f0fdf4]"
                }`}
                aria-pressed={selectedObjects.has(obj.key)}
              >
                {obj.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live stat cards */}
      {Object.keys(latestReading).length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from(selectedObjects).map((key) => {
            const cfg = SERIES_CONFIG[key];
            if (!cfg) return null;
            return (
              <StatCard
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={formatNumber(latestReading[key])}
                unit={cfg.unit}
                icon={cfg.icon}
                accent="green"
              />
            );
          })}
        </div>
      )}

      {/* Live chart */}
      {chartData.length > 0 && (
        <Card className="border-[#bbf7d0]">
          <CardHeader>
            <CardTitle className="text-[#14532d]">Real-Time Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartTooltip />
                <Legend />
                {Array.from(selectedObjects).map((key) => {
                  const cfg = SERIES_CONFIG[key];
                  if (!cfg) return null;
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={`${key} (${cfg.unit})`}
                      stroke={cfg.color}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!connected && chartData.length === 0 && (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-12 text-center">
          <Radio className="mx-auto h-12 w-12 text-[#bbf7d0]" />
          <p className="mt-4 text-lg font-medium text-[#14532d]">No live data</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Select a meter and click Connect to start receiving live readings
          </p>
        </div>
      )}
    </div>
  );
}
