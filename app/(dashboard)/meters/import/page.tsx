"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { ProgressBar } from "@/components/shared/progress-bar";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ImportPreviewRow, ImportResult } from "@/lib/types";

type ImportStep = "upload" | "preview" | "importing" | "complete";

export default function BatchImportPage() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/proxy/api/meters/import/preview", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(error.detail || "Failed to parse file");
      }

      const data: ImportPreviewRow[] = await res.json();
      setPreview(data);
      setStep("preview");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to preview file"
      );
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress since we don't have real-time progress
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 500);

      const res = await fetch("/api/proxy/api/meters/import", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Import failed" }));
        throw new Error(error.detail || "Import failed");
      }

      const data: ImportResult = await res.json();
      setResult(data);
      setStep("complete");

      if (data.failed === 0) {
        toast.success(`Successfully imported ${data.success} meters`);
      } else {
        toast.warning(
          `Imported ${data.success} meters, ${data.failed} failed`
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
      setStep("preview");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setPreview([]);
    setResult(null);
    setProgress(0);
  };

  const validCount = preview.filter((r) => r.valid).length;
  const invalidCount = preview.filter((r) => !r.valid).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Import"
        description="Import meters in bulk using CSV or Excel templates"
      />

      {/* Step: Upload */}
      {step === "upload" && (
        <Card className="border-[#bbf7d0]">
          <CardHeader>
            <CardTitle className="text-[#14532d]">Upload Device File</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file with meter data. Required columns:
              serial_number, ip_address, port, security_level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onFileSelect={handleFileSelect}
              selectedFile={file}
              onClear={() => setFile(null)}
            />
            {loading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-[#6b7280]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing file...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-700 border-green-200"
              >
                {validCount} valid
              </Badge>
              {invalidCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-700 border-red-200"
                >
                  {invalidCount} invalid
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0}
                className="bg-[#16a34a] hover:bg-[#15803d]"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import {validCount} Meters
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-[#bbf7d0] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
                  <TableHead className="text-[#14532d]">Row</TableHead>
                  <TableHead className="text-[#14532d]">Serial Number</TableHead>
                  <TableHead className="text-[#14532d]">IP Address</TableHead>
                  <TableHead className="text-[#14532d]">Port</TableHead>
                  <TableHead className="text-[#14532d]">Security</TableHead>
                  <TableHead className="text-[#14532d]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row) => (
                  <TableRow
                    key={row.row_number}
                    className={
                      row.valid
                        ? "hover:bg-[#f0fdf4]/50"
                        : "bg-red-50 hover:bg-red-50"
                    }
                  >
                    <TableCell>{row.row_number}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {row.serial_number}
                    </TableCell>
                    <TableCell>{row.ip_address}</TableCell>
                    <TableCell>{row.port}</TableCell>
                    <TableCell>{row.security_level}</TableCell>
                    <TableCell>
                      {row.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600">
                            {row.errors.join(", ")}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <Card className="border-[#bbf7d0]">
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#16a34a]" />
            <p className="text-lg font-medium text-[#14532d]">
              Importing meters...
            </p>
            <div className="mx-auto mt-4 max-w-md">
              <ProgressBar value={progress} label="Import progress" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Complete */}
      {step === "complete" && result && (
        <Card className="border-[#bbf7d0]">
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#16a34a]" />
            <p className="text-lg font-bold text-[#14532d]">Import Complete</p>
            <div className="mt-4 flex justify-center gap-6">
              <div>
                <p className="text-2xl font-bold text-[#16a34a]">
                  {result.success}
                </p>
                <p className="text-sm text-[#6b7280]">Successful</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {result.failed}
                </p>
                <p className="text-sm text-[#6b7280]">Failed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#14532d]">
                  {result.total}
                </p>
                <p className="text-sm text-[#6b7280]">Total</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mx-auto mt-6 max-w-lg text-left">
                <p className="mb-2 text-sm font-medium text-red-600">
                  Errors:
                </p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-sm text-[#6b7280]">
                    Row {err.row}: {err.message}
                  </p>
                ))}
              </div>
            )}

            <Button
              onClick={handleReset}
              className="mt-6 bg-[#16a34a] hover:bg-[#15803d]"
            >
              Import More
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
