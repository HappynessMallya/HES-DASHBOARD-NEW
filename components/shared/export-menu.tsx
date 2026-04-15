"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download } from "lucide-react";

interface ExportMenuProps {
  onExport: (format: string) => void;
  formats?: string[];
}

const DEFAULT_FORMATS = ["CSV", "JSON", "Excel", "PDF", "Word", "XML"];

export function ExportMenu({
  onExport,
  formats = DEFAULT_FORMATS,
}: ExportMenuProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />
      <PopoverContent className="w-40 p-1" align="end">
        {formats.map((fmt) => (
          <button
            key={fmt}
            onClick={() => onExport(fmt.toLowerCase())}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-[#14532d] hover:bg-[#f0fdf4] transition-colors"
          >
            {fmt}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
