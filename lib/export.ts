export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string
) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    })
  );

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadBlob(csv, `${filename}.csv`, "text/csv");
}

export function downloadJSON(
  data: Record<string, unknown>[],
  filename: string
) {
  const json = JSON.stringify(data, null, 2);
  downloadBlob(json, `${filename}.json`, "application/json");
}

export function downloadBlob(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadFromBackend(
  path: string,
  filename: string
) {
  const base =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "/api/proxy"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${base}${path}`, { credentials: "same-origin" });
  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
