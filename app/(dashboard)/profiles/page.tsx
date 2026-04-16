"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/components/shared/permission-gate";
import {
  useProfiles,
  useCreateProfile,
  useDeleteProfile,
} from "@/lib/hooks/use-profiles";
import type { ProfileCreate } from "@/lib/types";
import { Plus, Trash2, Settings2, Gauge } from "lucide-react";

export default function ProfilesPage() {
  const { data: profiles, isLoading } = useProfiles();
  const deleteProfile = useDeleteProfile();

  const handleDelete = async (id: number) => {
    try {
      await deleteProfile.mutateAsync(id);
      toast.success("Profile deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14532d]">Meter Profiles</h1>
        <Can permission="meters.create">
          <AddProfileDialog />
        </Can>
      </div>

      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <Settings2 className="h-5 w-5" />
            Connection Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !profiles?.length ? (
            <p className="py-8 text-center text-sm text-[#6b7280]">No profiles configured</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Auth Type</TableHead>
                  <TableHead>Handshake</TableHead>
                  <TableHead className="text-center">Meters</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.manufacturer ?? "—"}</TableCell>
                    <TableCell>{p.model ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.auth_type ?? "NONE"}</Badge>
                    </TableCell>
                    <TableCell>{p.handshake ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1">
                        <Gauge className="h-3 w-3" />
                        {p.meter_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Can permission="meters.delete">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(p.id)}
                          disabled={deleteProfile.isPending}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Delete profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddProfileDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProfileCreate>({
    name: "",
    manufacturer: "",
    model: "",
    handshake: "registration_first",
    client_address: 1,
    server_address: 1,
    auth_type: "HIGH_GMAC",
    default_password: "",
    connection_timeout: 10,
    post_registration_delay_ms: 500,
  });
  const create = useCreateProfile();

  const updateField = <K extends keyof ProfileCreate>(key: K, value: ProfileCreate[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    try {
      await create.mutateAsync(form);
      toast.success("Profile created");
      setOpen(false);
      setForm({
        name: "",
        manufacturer: "",
        model: "",
        handshake: "registration_first",
        client_address: 1,
        server_address: 1,
        auth_type: "HIGH_GMAC",
        default_password: "",
        connection_timeout: 10,
        post_registration_delay_ms: 500,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#16a34a] hover:bg-[#15803d]" />}>
        <Plus className="mr-2 h-4 w-4" /> Add Profile
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Meter Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Profile Name *</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="BUYI STS Prepay" />
            </div>
            <div>
              <Label>Manufacturer</Label>
              <Input value={form.manufacturer ?? ""} onChange={(e) => updateField("manufacturer", e.target.value)} placeholder="BUYI Tech" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Model</Label>
              <Input value={form.model ?? ""} onChange={(e) => updateField("model", e.target.value)} placeholder="BY100C" />
            </div>
            <div>
              <Label>Auth Type</Label>
              <Input value={form.auth_type ?? ""} onChange={(e) => updateField("auth_type", e.target.value)} placeholder="HIGH_GMAC" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client Address</Label>
              <Input type="number" value={form.client_address ?? 1} onChange={(e) => updateField("client_address", Number(e.target.value))} />
            </div>
            <div>
              <Label>Server Address</Label>
              <Input type="number" value={form.server_address ?? 1} onChange={(e) => updateField("server_address", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Default Password (hex)</Label>
            <Input value={form.default_password ?? ""} onChange={(e) => updateField("default_password", e.target.value)} placeholder="3132333435363738" className="font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Connection Timeout (s)</Label>
              <Input type="number" value={form.connection_timeout ?? 10} onChange={(e) => updateField("connection_timeout", Number(e.target.value))} />
            </div>
            <div>
              <Label>Post-Registration Delay (ms)</Label>
              <Input type="number" value={form.post_registration_delay_ms ?? 500} onChange={(e) => updateField("post_registration_delay_ms", Number(e.target.value))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!form.name || create.isPending} className="bg-[#16a34a] hover:bg-[#15803d]">
            {create.isPending ? "Creating..." : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
