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
import type { DeviceGroup, GroupType } from "@/lib/types";

interface CreateGroupDialogProps {
  onCreated: () => void;
}

export function CreateGroupDialog({ onCreated }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "static" as GroupType,
    criteria_field: "region",
    criteria_operator: "equals",
    criteria_value: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      type: form.type,
    };

    if (form.type === "dynamic" && form.criteria_value) {
      body.criteria = {
        [form.criteria_field]: form.criteria_value,
        operator: form.criteria_operator,
      };
    }

    try {
      await api<DeviceGroup>("/api/groups", {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Device group created");
      setOpen(false);
      setForm({
        name: "",
        description: "",
        type: "static",
        criteria_field: "region",
        criteria_operator: "equals",
        criteria_value: "",
      });
      onCreated();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create group"
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
            New Group
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Device Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Group Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Dar es Salaam Region"
              required
              className="border-[#bbf7d0]"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Optional description"
              className="border-[#bbf7d0]"
            />
          </div>

          <div className="space-y-2">
            <Label>Group Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm({ ...form, type: (v ?? "static") as GroupType })
              }
            >
              <SelectTrigger className="border-[#bbf7d0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">
                  Static — Manually assign meters
                </SelectItem>
                <SelectItem value="dynamic">
                  Dynamic — Auto-group by criteria
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.type === "dynamic" && (
            <div className="space-y-3 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
              <p className="text-sm font-medium text-[#14532d]">
                Dynamic Criteria
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={form.criteria_field}
                  onValueChange={(v) =>
                    setForm({ ...form, criteria_field: v ?? "" })
                  }
                >
                  <SelectTrigger className="border-[#bbf7d0] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="region">Region</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="security_level">
                      Security Level
                    </SelectItem>
                    <SelectItem value="transformer">Transformer</SelectItem>
                    <SelectItem value="substation">Substation</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={form.criteria_operator}
                  onValueChange={(v) =>
                    setForm({ ...form, criteria_operator: v ?? "" })
                  }
                >
                  <SelectTrigger className="border-[#bbf7d0] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="starts_with">Starts with</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={form.criteria_value}
                  onChange={(e) =>
                    setForm({ ...form, criteria_value: e.target.value })
                  }
                  placeholder="Value"
                  className="border-[#bbf7d0] bg-white"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !form.name}
            className="w-full bg-[#16a34a] hover:bg-[#15803d]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Group
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
