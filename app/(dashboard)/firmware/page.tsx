"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { FirmwareVersion, FirmwareDeployment } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressBar } from "@/components/shared/progress-bar";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import {
  Upload,
  Loader2,
  Rocket,
  HardDrive,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { relativeTime } from "@/lib/utils";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-[#6b7280]" />,
  in_progress: <Loader2 className="h-4 w-4 animate-spin text-amber-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-600" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function FirmwarePage() {
  const [versions, setVersions] = useState<FirmwareVersion[]>([]);
  const [deployments, setDeployments] = useState<FirmwareDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadVersion, setUploadVersion] = useState("");
  const [uploadDeviceType, setUploadDeviceType] = useState<"meter" | "dcu">("meter");
  const [uploading, setUploading] = useState(false);
  const [deployFirmwareId, setDeployFirmwareId] = useState("");
  const [deployTargets, setDeployTargets] = useState("");
  const [deploying, setDeploying] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [v, d] = await Promise.allSettled([
        api<FirmwareVersion[]>("/api/firmware"),
        api<FirmwareDeployment[]>("/api/firmware/deployments"),
      ]);
      if (v.status === "fulfilled") setVersions(v.value);
      if (d.status === "fulfilled") setDeployments(d.value);
    } catch {
      // empty state shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async () => {
    if (!uploadFile || !uploadVersion) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("version", uploadVersion);
      formData.append("device_type", uploadDeviceType);

      const res = await fetch("/api/proxy/api/firmware", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(error.detail);
      }

      toast.success("Firmware uploaded successfully");
      setUploadOpen(false);
      setUploadFile(null);
      setUploadVersion("");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeploy = async () => {
    if (!deployFirmwareId || !deployTargets) return;
    setDeploying(true);

    try {
      await api("/api/firmware/deploy", {
        method: "POST",
        body: JSON.stringify({
          firmware_id: deployFirmwareId,
          target_ids: deployTargets.split(",").map((s) => s.trim()),
        }),
      });
      toast.success("Firmware deployment started");
      setDeployOpen(false);
      setDeployFirmwareId("");
      setDeployTargets("");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deploy failed");
    } finally {
      setDeploying(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firmware Management"
        description="Upload and deploy firmware updates to meters and data concentrators"
        action={
          <div className="flex gap-2">
            <Dialog open={deployOpen} onOpenChange={setDeployOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline">
                    <Rocket className="mr-2 h-4 w-4" />
                    Deploy
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy Firmware</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Firmware Version</Label>
                    <Select
                      value={deployFirmwareId}
                      onValueChange={(v) => setDeployFirmwareId(v ?? "")}
                    >
                      <SelectTrigger className="border-[#bbf7d0]">
                        <SelectValue placeholder="Select firmware" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.version} ({v.device_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Device IDs (comma-separated)</Label>
                    <Input
                      value={deployTargets}
                      onChange={(e) => setDeployTargets(e.target.value)}
                      placeholder="device-id-1, device-id-2"
                      className="border-[#bbf7d0]"
                    />
                  </div>
                  <Button
                    onClick={handleDeploy}
                    disabled={deploying || !deployFirmwareId || !deployTargets}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d]"
                  >
                    {deploying && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Start Deployment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-[#16a34a] hover:bg-[#15803d]">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Firmware
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Firmware</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input
                      value={uploadVersion}
                      onChange={(e) => setUploadVersion(e.target.value)}
                      placeholder="e.g., 2.4.1"
                      className="border-[#bbf7d0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Device Type</Label>
                    <Select
                      value={uploadDeviceType}
                      onValueChange={(v) =>
                        setUploadDeviceType((v ?? "meter") as "meter" | "dcu")
                      }
                    >
                      <SelectTrigger className="border-[#bbf7d0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meter">Meter</SelectItem>
                        <SelectItem value="dcu">Data Concentrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FileUploadZone
                    accept=".bin,.hex,.fw,.img"
                    onFileSelect={setUploadFile}
                    selectedFile={uploadFile}
                    onClear={() => setUploadFile(null)}
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !uploadFile || !uploadVersion}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d]"
                  >
                    {uploading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Firmware Versions Table */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <HardDrive className="h-5 w-5" />
            Available Firmware
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#bbf7d0] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
                    <TableHead className="text-[#14532d]">Version</TableHead>
                    <TableHead className="text-[#14532d]">Device Type</TableHead>
                    <TableHead className="text-[#14532d]">Filename</TableHead>
                    <TableHead className="text-[#14532d]">Size</TableHead>
                    <TableHead className="text-[#14532d]">Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-[#6b7280]"
                      >
                        No firmware versions uploaded
                      </TableCell>
                    </TableRow>
                  ) : (
                    versions.map((v) => (
                      <TableRow key={v.id} className="hover:bg-[#f0fdf4]/50">
                        <TableCell className="font-medium">
                          {v.version}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              v.device_type === "meter"
                                ? "bg-sky-100 text-sky-700 border-sky-200"
                                : "bg-purple-100 text-purple-700 border-purple-200"
                            }
                          >
                            {v.device_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {v.filename}
                        </TableCell>
                        <TableCell>{formatSize(v.size_bytes)}</TableCell>
                        <TableCell className="text-sm text-[#6b7280]">
                          {relativeTime(v.uploaded_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Deployments */}
      {deployments.length > 0 && (
        <Card className="border-[#bbf7d0]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#14532d]">
              <Rocket className="h-5 w-5" />
              Deployments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deployments.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-4 rounded-lg border border-[#bbf7d0] p-3"
              >
                {STATUS_ICONS[d.status]}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#14532d]">
                    v{d.firmware_version} → {d.target_ids.length} devices
                  </p>
                  <ProgressBar
                    value={d.progress_percent}
                    className="mt-1"
                  />
                </div>
                <Badge
                  variant="outline"
                  className={
                    d.status === "completed"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : d.status === "failed"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-amber-100 text-amber-700 border-amber-200"
                  }
                >
                  {d.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
