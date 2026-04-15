"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
import type { AlertCountResponse } from "./types";

interface AlertCountContextValue {
  active: number;
  critical: number;
}

const AlertCountContext = createContext<AlertCountContextValue>({
  active: 0,
  critical: 0,
});

export function AlertCountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [counts, setCounts] = useState<AlertCountContextValue>({
    active: 0,
    critical: 0,
  });

  useEffect(() => {
    let mounted = true;

    const fetchCounts = () => {
      api<AlertCountResponse>("/api/alerts/count")
        .then((data) => {
          if (mounted) setCounts({ active: data.active, critical: data.critical });
        })
        .catch(() => {});
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <AlertCountContext value={counts}>{children}</AlertCountContext>
  );
}

export function useAlertCount() {
  return useContext(AlertCountContext);
}
