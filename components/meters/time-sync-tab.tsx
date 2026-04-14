"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Clock, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface TimeSyncTabProps {
  meterId: string;
}

export function TimeSyncTab({ meterId }: TimeSyncTabProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: string; time_set: string } | null>(null);

  const handleSync = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await api<{ status: string; time_set: string }>(
        `/api/meters/${meterId}/timesync`,
        { method: "POST" }
      );
      setResult(data);
      toast.success("Meter clock synchronized");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sync time");
    } finally {
      setLoading(false);
    }
  }, [meterId]);

  return (
    <Card className="border-[#bbf7d0]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#14532d]">
          <Clock className="h-5 w-5 text-[#16a34a]" />
          Time Synchronization
        </CardTitle>
        <CardDescription>
          Synchronize the meter&apos;s internal clock to UTC time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleSync}
          disabled={loading}
          className="bg-[#16a34a] hover:bg-[#15803d]"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Clock className="mr-2 h-4 w-4" />
          )}
          Sync Meter Clock to UTC
        </Button>

        {result && (
          <div className="flex items-center gap-2 rounded-lg bg-[#dcfce7] p-4 text-[#15803d]">
            <CheckCircle className="h-5 w-5" />
            <p>
              Clock synchronized — time set to{" "}
              <strong className="font-mono">{result.time_set}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
