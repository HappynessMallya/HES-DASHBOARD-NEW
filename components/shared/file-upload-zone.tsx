"use client";

import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUploadZone({
  accept = ".csv,.xlsx,.xls",
  onFileSelect,
  selectedFile,
  onClear,
}: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
        <div className="flex items-center gap-3">
          <File className="h-5 w-5 text-[#16a34a]" />
          <div>
            <p className="text-sm font-medium text-[#14532d]">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[#6b7280]">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
        dragOver
          ? "border-[#16a34a] bg-[#dcfce7]"
          : "border-[#bbf7d0] bg-[#f0fdf4] hover:border-[#16a34a]"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <Upload className="mb-3 h-8 w-8 text-[#16a34a]" />
      <p className="text-sm font-medium text-[#14532d]">
        Drag & drop a file here
      </p>
      <p className="mt-1 text-xs text-[#6b7280]">or</p>
      <label className="mt-2 cursor-pointer">
        <span className="rounded-md bg-[#16a34a] px-4 py-2 text-sm font-medium text-white hover:bg-[#15803d] transition-colors">
          Browse Files
        </span>
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </label>
      <p className="mt-2 text-xs text-[#6b7280]">
        Supports CSV, Excel (.xlsx, .xls)
      </p>
    </div>
  );
}
