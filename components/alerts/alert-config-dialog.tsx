"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { AlertRule, AlertSeverity } from "@/lib/types";

interface AlertConfigDialogProps {
  onCreated: () => void;
}

export function AlertConfigDialog({ onCreated }: AlertConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    condition_type: "over_voltage",
    threshold: 0,
    severity: "warning" as AlertSeverity,
    notify_sms: false,
    notify_email: false,
    recipients: "",
    forward_upstream: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api<AlertRule>("/api/alerts/rules", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          recipients: form.recipients
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
          enabled: true,
        }),
      });
      toast.success("Alert rule created");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create alert rule"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-[#16a34a] hover:bg-[#15803d]">
            <Plus className="mr-2 h-4 w-4" />
            New Alert Rule
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rule Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Over Voltage Alert"
              required
              className="border-[#bbf7d0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condition Type</Label>
              <Select
                value={form.condition_type}
                onValueChange={(v) => setForm({ ...form, condition_type: v ?? "" })}
              >
                <SelectTrigger className="border-[#bbf7d0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="over_voltage">Over Voltage</SelectItem>
                  <SelectItem value="under_voltage">Under Voltage</SelectItem>
                  <SelectItem value="over_current">Over Current</SelectItem>
                  <SelectItem value="power_quality">Power Quality</SelectItem>
                  <SelectItem value="tamper">Tamper Detection</SelectItem>
                  <SelectItem value="outage">Outage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Threshold</Label>
              <Input
                type="number"
                value={form.threshold}
                onChange={(e) =>
                  setForm({ ...form, threshold: Number(e.target.value) })
                }
                className="border-[#bbf7d0]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <Select
              value={form.severity}
              onValueChange={(v) =>
                setForm({ ...form, severity: (v ?? "warning") as AlertSeverity })
              }
            >
              <SelectTrigger className="border-[#bbf7d0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recipients (comma-separated)</Label>
            <Input
              value={form.recipients}
              onChange={(e) => setForm({ ...form, recipients: e.target.value })}
              placeholder="email@example.com, +255..."
              className="border-[#bbf7d0]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Notify via SMS</Label>
              <Switch
                checked={form.notify_sms}
                onCheckedChange={(v) => setForm({ ...form, notify_sms: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notify via Email</Label>
              <Switch
                checked={form.notify_email}
                onCheckedChange={(v) => setForm({ ...form, notify_email: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Forward to Upstream Systems</Label>
              <Switch
                checked={form.forward_upstream}
                onCheckedChange={(v) =>
                  setForm({ ...form, forward_upstream: v })
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !form.name}
            className="w-full bg-[#16a34a] hover:bg-[#15803d]"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Rule
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
