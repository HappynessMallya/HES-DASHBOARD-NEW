"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TokenInput } from "@/components/shared/token-input";
import { api } from "@/lib/api";
import { stripTokenDashes, formatNumber } from "@/lib/utils";
import type { TopupResponse, AutoTopupOut, AutoTopupCreate } from "@/lib/types";
import { CreditCard, Loader2, Plus, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TokenCreditTabProps {
  meterId: string;
}

export function TokenCreditTab({ meterId }: TokenCreditTabProps) {
  // Top-Up
  const [token, setToken] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupResult, setTopupResult] = useState<TopupResponse | null>(null);

  // Auto Top-Up
  const [autoTopup, setAutoTopup] = useState<AutoTopupOut | null>(null);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [threshold, setThreshold] = useState("5");
  const [tokenPool, setTokenPool] = useState<string[]>([]);
  const [newPoolToken, setNewPoolToken] = useState("");
  const [autoSaving, setAutoSaving] = useState(false);

  // Clear Credit
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    api<AutoTopupOut>(`/api/meters/${meterId}/auto-topup`)
      .then((data) => {
        setAutoTopup(data);
        setAutoEnabled(data.enabled);
        setThreshold(String(data.threshold_kwh));
        setTokenPool(data.token_pool_json || []);
      })
      .catch(() => {
        // No auto topup configured
      });
  }, [meterId]);

  const handleTopup = useCallback(async () => {
    const raw = stripTokenDashes(token);
    if (raw.length < 20) {
      toast.error("Token must be 20 digits");
      return;
    }
    setTopupLoading(true);
    setTopupResult(null);
    try {
      const result = await api<TopupResponse>(`/api/meters/${meterId}/topup`, {
        method: "POST",
        body: JSON.stringify({ token: raw }),
      });
      setTopupResult(result);
      if (result.status === "accepted") {
        toast.success("Token accepted!");
        setToken("");
      } else {
        toast.error("Token rejected");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Top-up failed");
    } finally {
      setTopupLoading(false);
    }
  }, [meterId, token]);

  const handleAutoSave = useCallback(async () => {
    setAutoSaving(true);
    try {
      const body: AutoTopupCreate = {
        threshold_kwh: Number(threshold),
        token_pool: tokenPool,
        enabled: autoEnabled,
      };
      const result = await api<AutoTopupOut>(`/api/meters/${meterId}/auto-topup`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setAutoTopup(result);
      toast.success("Auto top-up settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save auto top-up");
    } finally {
      setAutoSaving(false);
    }
  }, [meterId, threshold, tokenPool, autoEnabled]);

  const addPoolToken = () => {
    const raw = stripTokenDashes(newPoolToken);
    if (raw.length < 20) {
      toast.error("Token must be 20 digits");
      return;
    }
    setTokenPool((prev) => [...prev, raw]);
    setNewPoolToken("");
  };

  const handleClearCredit = useCallback(async () => {
    setClearing(true);
    try {
      const result = await api<{
        status: string;
        balance_before: number;
        balance_after: number;
      }>(`/api/meters/${meterId}/clear-credit`, { method: "POST" });
      toast.success(
        `Credit cleared: ${formatNumber(result.balance_before)} → ${formatNumber(result.balance_after)} kWh`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear credit");
    } finally {
      setClearing(false);
    }
  }, [meterId]);

  return (
    <div className="space-y-6">
      {/* Top-Up Section */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <CreditCard className="h-5 w-5 text-[#16a34a]" />
            Token Top-Up
          </CardTitle>
          <CardDescription>Enter a 20-digit STS token to top up this meter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TokenInput value={token} onChange={setToken} disabled={topupLoading} />
          <Button
            onClick={handleTopup}
            disabled={topupLoading || stripTokenDashes(token).length < 20}
            className="bg-[#16a34a] hover:bg-[#15803d]"
          >
            {topupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Token
          </Button>

          {topupResult && (
            <div
              className={`rounded-lg p-4 ${
                topupResult.status === "accepted"
                  ? "bg-[#dcfce7] text-[#15803d]"
                  : "bg-red-50 text-[#dc2626]"
              }`}
            >
              {topupResult.status === "accepted" ? (
                <p>
                  Token accepted! New balance:{" "}
                  <strong>{formatNumber(topupResult.new_balance)} kWh</strong>
                </p>
              ) : (
                <p>Token rejected. Please verify and try again.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Top-Up Section */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="text-[#14532d]">Auto Top-Up</CardTitle>
          <CardDescription>
            Automatically top up when balance drops below threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={autoEnabled}
              onCheckedChange={setAutoEnabled}
              aria-label="Enable auto top-up"
            />
            <Label>{autoEnabled ? "Enabled" : "Disabled"}</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold (kWh)</Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-32"
              step="0.1"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Token Pool</Label>
            <div className="flex flex-wrap gap-2">
              {tokenPool.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-mono text-[#15803d]"
                >
                  {t.slice(0, 8)}...
                  <button
                    onClick={() => setTokenPool((prev) => prev.filter((_, j) => j !== i))}
                    className="ml-1 text-[#6b7280] hover:text-[#dc2626]"
                    aria-label={`Remove token ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newPoolToken}
                onChange={(e) => setNewPoolToken(e.target.value.replace(/\D/g, "").slice(0, 20))}
                placeholder="Add token to pool"
                className="w-64"
              />
              <Button variant="outline" size="sm" onClick={addPoolToken}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
          <Button
            onClick={handleAutoSave}
            disabled={autoSaving}
            className="bg-[#16a34a] hover:bg-[#15803d]"
          >
            {autoSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Separator className="bg-[#bbf7d0]" />

      {/* Clear Credit Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#dc2626]">
            <AlertTriangle className="h-5 w-5" />
            Clear Credit
          </CardTitle>
          <CardDescription>
            This will zero out the meter&apos;s prepaid balance. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmDialog
            trigger={
              <Button variant="outline" className="border-[#dc2626] text-[#dc2626] hover:bg-red-50" disabled={clearing}>
                {clearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Clear Credit
              </Button>
            }
            title="Clear Meter Credit"
            description="This will zero out the meter's prepaid balance. Are you sure you want to continue?"
            confirmLabel="Clear Credit"
            variant="destructive"
            onConfirm={handleClearCredit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
