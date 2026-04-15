"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { MeterConfig } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ConfigTabProps {
  meterId: string;
}

const DEFAULT_CONFIG: MeterConfig = {
  tariff_scheme: "",
  load_limit_kw: 0,
  ct_ratio: 1,
  vt_ratio: 1,
  demand_limit_kw: 0,
  region: "",
};

export function ConfigTab({ meterId }: ConfigTabProps) {
  const [config, setConfig] = useState<MeterConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await api<MeterConfig>(
        `/api/meters/${meterId}/config`
      );
      setConfig(data);
    } catch {
      // Use defaults if no config exists
    } finally {
      setLoading(false);
    }
  }, [meterId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api(`/api/meters/${meterId}/config`, {
        method: "PUT",
        body: JSON.stringify(config),
      });
      toast.success("Configuration saved and deployed");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="text-[#14532d]">Meter Configuration</CardTitle>
          <CardDescription>
            Configure tariff, load limits, transformer ratios, and region
            settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tariff Scheme</Label>
              <Input
                value={config.tariff_scheme}
                onChange={(e) =>
                  setConfig({ ...config, tariff_scheme: e.target.value })
                }
                placeholder="e.g., TOU-2024"
                className="border-[#bbf7d0]"
              />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Input
                value={config.region}
                onChange={(e) =>
                  setConfig({ ...config, region: e.target.value })
                }
                placeholder="e.g., Dar es Salaam"
                className="border-[#bbf7d0]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Load Limit (kW)</Label>
              <Input
                type="number"
                value={config.load_limit_kw}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    load_limit_kw: Number(e.target.value),
                  })
                }
                min={0}
                step={0.1}
                className="border-[#bbf7d0]"
              />
            </div>
            <div className="space-y-2">
              <Label>Demand Limit (kW)</Label>
              <Input
                type="number"
                value={config.demand_limit_kw}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    demand_limit_kw: Number(e.target.value),
                  })
                }
                min={0}
                step={0.1}
                className="border-[#bbf7d0]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>CT Ratio</Label>
              <Input
                type="number"
                value={config.ct_ratio}
                onChange={(e) =>
                  setConfig({ ...config, ct_ratio: Number(e.target.value) })
                }
                min={1}
                className="border-[#bbf7d0]"
              />
            </div>
            <div className="space-y-2">
              <Label>VT Ratio</Label>
              <Input
                type="number"
                value={config.vt_ratio}
                onChange={(e) =>
                  setConfig({ ...config, vt_ratio: Number(e.target.value) })
                }
                min={1}
                className="border-[#bbf7d0]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#16a34a] hover:bg-[#15803d]"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save & Deploy
            </Button>
            <Button variant="outline" onClick={fetchConfig}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
