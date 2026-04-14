"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { MeterCreate, MeterOut } from "@/lib/types";
import { toast } from "sonner";

interface RegisterMeterDialogProps {
  onCreated: (meter: MeterOut) => void;
}

export function RegisterMeterDialog({ onCreated }: RegisterMeterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MeterCreate>({
    serial_number: "",
    ip_address: "",
    port: 4059,
    auth_password: "",
    security_level: "LLS",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.serial_number.trim()) {
        toast.error("Serial number is required");
        return;
      }
      setLoading(true);
      try {
        const meter = await api<MeterOut>("/api/meters", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            ip_address: form.ip_address || null,
            auth_password: form.auth_password || "",
          }),
        });
        toast.success(`Meter ${meter.serial_number} registered successfully`);
        onCreated(meter);
        setOpen(false);
        setForm({
          serial_number: "",
          ip_address: "",
          port: 4059,
          auth_password: "",
          security_level: "LLS",
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to register meter");
      } finally {
        setLoading(false);
      }
    },
    [form, onCreated]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#16a34a] hover:bg-[#15803d]" />}>
        <Plus className="mr-2 h-4 w-4" />
        Register Meter
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Meter</DialogTitle>
          <DialogDescription>
            Add a new STS prepayment smart meter to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serial_number">Serial Number *</Label>
            <Input
              id="serial_number"
              value={form.serial_number}
              onChange={(e) => setForm((f) => ({ ...f, serial_number: e.target.value }))}
              placeholder="e.g. METER-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip_address">IP Address</Label>
            <Input
              id="ip_address"
              value={form.ip_address || ""}
              onChange={(e) => setForm((f) => ({ ...f, ip_address: e.target.value }))}
              placeholder="e.g. 192.168.1.100"
              pattern="^(\d{1,3}\.){3}\d{1,3}$"
              title="Enter a valid IPv4 address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={form.port}
                onChange={(e) => setForm((f) => ({ ...f, port: Number(e.target.value) }))}
                min={1}
                max={65535}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security_level">Security Level</Label>
              <Select
                value={form.security_level}
                onValueChange={(v) => v !== null && setForm((f) => ({ ...f, security_level: v }))}
              >
                <SelectTrigger id="security_level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLS">LLS</SelectItem>
                  <SelectItem value="HLS">HLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth_password">Auth Password</Label>
            <Input
              id="auth_password"
              type="password"
              value={form.auth_password}
              onChange={(e) => setForm((f) => ({ ...f, auth_password: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#16a34a] hover:bg-[#15803d]">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
