"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { AlertOut } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { AlertStats } from "@/components/alerts/alert-stats";
import { AlertTable } from "@/components/alerts/alert-table";
import { AlertConfigDialog } from "@/components/alerts/alert-config-dialog";
import { NotificationSettings } from "@/components/alerts/notification-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertOut[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api<AlertOut[]>("/api/alerts");
      setAlerts(data);
    } catch {
      // silently fail, table shows empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Monitor and manage system alerts, tamper events, and outage notifications"
        action={<AlertConfigDialog onCreated={fetchAlerts} />}
      />

      <AlertStats alerts={alerts} />

      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">
            <Bell className="mr-2 h-4 w-4" />
            Alert Log
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Notification Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-4">
          <AlertTable
            alerts={alerts}
            loading={loading}
            onRefresh={fetchAlerts}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
