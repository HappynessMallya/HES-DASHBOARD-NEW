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
import { useCreateMeter } from "@/lib/hooks/use-meters";
import { useProfiles } from "@/lib/hooks/use-profiles";
import type { MeterCreate, MeterOut } from "@/lib/types";
import { toast } from "sonner";

interface RegisterMeterDialogProps {
  onCreated: (meter: MeterOut) => void;
}

export function RegisterMeterDialog({ onCreated }: RegisterMeterDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MeterCreate>({
    serial_number: "",
    ip_address: "",
    port: 4059,
    auth_password: "",
    security_level: "HIGH_GMAC",
  });
  const createMeter = useCreateMeter();
  const { data: profiles } = useProfiles();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.serial_number.trim()) {
        toast.error("Serial number is required");
        return;
      }
      try {
        const meter = await createMeter.mutateAsync({
          ...form,
          ip_address: form.ip_address || null,
          auth_password: form.auth_password || "",
        });
        toast.success(`Meter ${meter.serial_number} registered successfully`);
        onCreated(meter);
        setOpen(false);
        setForm({
          serial_number: "",
          ip_address: "",
          port: 4059,
          auth_password: "",
          security_level: "HIGH_GMAC",
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to register meter");
      }
    },
    [form, onCreated, createMeter]
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
              placeholder="e.g. 0199100227362"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip_address">IP Address</Label>
            <Input
              id="ip_address"
              value={form.ip_address || ""}
              onChange={(e) => setForm((f) => ({ ...f, ip_address: e.target.value }))}
              placeholder="e.g. 154.74.127.115"
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
                  <SelectItem value="HIGH_GMAC">HIGH_GMAC</SelectItem>
                  <SelectItem value="LLS">LLS</SelectItem>
                  <SelectItem value="HLS">HLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {profiles && profiles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="profile_id">Connection Profile</Label>
              <Select
                value={form.profile_id ? String(form.profile_id) : ""}
                onValueChange={(v) => setForm((f) => ({ ...f, profile_id: v ? Number(v) : undefined }))}
              >
                <SelectTrigger id="profile_id">
                  <SelectValue placeholder="Select profile (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} {p.manufacturer ? `(${p.manufacturer})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="auth_password">Auth Password (hex)</Label>
            <Input
              id="auth_password"
              type="password"
              value={form.auth_password}
              onChange={(e) => setForm((f) => ({ ...f, auth_password: e.target.value }))}
              placeholder="e.g. 3132333435363738"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMeter.isPending} className="bg-[#16a34a] hover:bg-[#15803d]">
              {createMeter.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
