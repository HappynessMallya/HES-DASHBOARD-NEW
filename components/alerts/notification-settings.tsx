"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface NotificationConfig {
  sms_enabled: boolean;
  email_enabled: boolean;
  upstream_enabled: boolean;
  sms_recipients: string[];
  email_recipients: string[];
}

export function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    sms_enabled: false,
    email_enabled: false,
    upstream_enabled: false,
    sms_recipients: [],
    email_recipients: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [smsInput, setSmsInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const fetchConfig = useCallback(async () => {
    try {
      const data = await api<NotificationConfig>(
        "/api/alerts/notification-config"
      );
      setConfig(data);
      setSmsInput(data.sms_recipients.join(", "));
      setEmailInput(data.email_recipients.join(", "));
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api("/api/alerts/notification-config", {
        method: "PUT",
        body: JSON.stringify({
          ...config,
          sms_recipients: smsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          email_recipients: emailInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      toast.success("Notification settings saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="border-[#bbf7d0]">
      <CardHeader>
        <CardTitle className="text-[#14532d]">Notification Settings</CardTitle>
        <CardDescription>
          Configure how alert notifications are delivered
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>SMS Notifications</Label>
          <Switch
            checked={config.sms_enabled}
            onCheckedChange={(v) =>
              setConfig({ ...config, sms_enabled: v })
            }
          />
        </div>
        {config.sms_enabled && (
          <div className="space-y-2">
            <Label className="text-xs text-[#6b7280]">
              SMS Recipients (comma-separated phone numbers)
            </Label>
            <Input
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              placeholder="+255..."
              className="border-[#bbf7d0]"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>Email Notifications</Label>
          <Switch
            checked={config.email_enabled}
            onCheckedChange={(v) =>
              setConfig({ ...config, email_enabled: v })
            }
          />
        </div>
        {config.email_enabled && (
          <div className="space-y-2">
            <Label className="text-xs text-[#6b7280]">
              Email Recipients (comma-separated)
            </Label>
            <Input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="operator@tanesco.co.tz"
              className="border-[#bbf7d0]"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>Forward to Upstream Systems</Label>
          <Switch
            checked={config.upstream_enabled}
            onCheckedChange={(v) =>
              setConfig({ ...config, upstream_enabled: v })
            }
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#16a34a] hover:bg-[#15803d]"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
