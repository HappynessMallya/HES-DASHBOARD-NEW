"use client";

import { createContext, useContext } from "react";

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
  // The backend does not have a dedicated alert count endpoint.
  // Alert counts can be derived from notification rules or events when needed.
  return (
    <AlertCountContext value={{ active: 0, critical: 0 }}>
      {children}
    </AlertCountContext>
  );
}

export function useAlertCount() {
  return useContext(AlertCountContext);
}
