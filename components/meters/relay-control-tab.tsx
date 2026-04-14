"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api } from "@/lib/api";
import { Power, PowerOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface RelayControlTabProps {
  meterId: string;
}

export function RelayControlTab({ meterId }: RelayControlTabProps) {
  const [loading, setLoading] = useState<"connect" | "disconnect" | null>(null);
  const [lastResult, setLastResult] = useState<{
    action: string;
    status: string;
  } | null>(null);

  const handleRelay = useCallback(
    async (action: "connect" | "disconnect") => {
      setLoading(action);
      setLastResult(null);
      try {
        const result = await api<{ status: string; action: string }>(
          `/api/meters/${meterId}/relay`,
          {
            method: "POST",
            body: JSON.stringify({ action }),
          }
        );
        setLastResult(result);
        toast.success(
          action === "connect"
            ? "Relay connected — power restored"
            : "Relay disconnected — power cut"
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to ${action} relay`);
      } finally {
        setLoading(null);
      }
    },
    [meterId]
  );

  return (
    <div className="space-y-6">
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="text-[#14532d]">Relay Control</CardTitle>
          <CardDescription>
            Remotely connect or disconnect the meter&apos;s relay to control power supply
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              size="lg"
              className="h-24 flex-col gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white"
              disabled={loading !== null}
              onClick={() => handleRelay("connect")}
            >
              {loading === "connect" ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Power className="h-8 w-8" />
              )}
              <span className="text-base font-semibold">Connect</span>
              <span className="text-xs opacity-80">Restore power supply</span>
            </Button>

            <ConfirmDialog
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  className="h-24 flex-col gap-2 border-[#dc2626] text-[#dc2626] hover:bg-red-50"
                  disabled={loading !== null}
                >
                  {loading === "disconnect" ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <PowerOff className="h-8 w-8" />
                  )}
                  <span className="text-base font-semibold">Disconnect</span>
                  <span className="text-xs opacity-80">Cut power supply</span>
                </Button>
              }
              title="Disconnect Relay"
              description="This will cut power to the customer. Are you sure you want to disconnect?"
              confirmLabel="Disconnect"
              variant="destructive"
              onConfirm={() => handleRelay("disconnect")}
            />
          </div>

          {lastResult && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg p-4 ${
                lastResult.status === "success" || lastResult.action === "connect"
                  ? "bg-[#dcfce7] text-[#15803d]"
                  : "bg-red-50 text-[#dc2626]"
              }`}
            >
              {lastResult.status === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p>
                Relay <strong>{lastResult.action}</strong> — {lastResult.status}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
