"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useNotificationRules,
  useCreateNotificationRule,
  useDeleteNotificationRule,
  useNotificationLog,
} from "@/lib/hooks/use-notifications";
import type { AlertRuleCreate, NotificationEventType, NotificationChannel, ConditionOperator } from "@/lib/types";
import { Bell, Plus, Trash2, Mail, Phone, Clock } from "lucide-react";
import { fullDateTime } from "@/lib/utils";

const EVENT_TYPES: { value: NotificationEventType; label: string }[] = [
  { value: "tamper", label: "Tamper" },
  { value: "offline", label: "Meter Offline" },
  { value: "low_balance", label: "Low Balance" },
  { value: "reading", label: "Reading" },
  { value: "relay_command", label: "Relay Command" },
  { value: "topup", label: "Top-Up" },
];

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "lt", label: "Less than" },
  { value: "lte", label: "Less or equal" },
  { value: "gt", label: "Greater than" },
  { value: "gte", label: "Greater or equal" },
  { value: "eq", label: "Equal to" },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14532d]">Notifications & Alerts</h1>
        <Can permission="notifications.manage">
          <AddRuleDialog />
        </Can>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="log">Notification Log</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <AlertRulesTab />
        </TabsContent>
        <TabsContent value="log" className="mt-4">
          <NotificationLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AlertRulesTab() {
  const { data: rules, isLoading } = useNotificationRules();
  const deleteRule = useDeleteNotificationRule();

  const handleDelete = async (id: string) => {
    try {
      await deleteRule.mutateAsync(id);
      toast.success("Rule deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!rules?.length) {
    return (
      <Card className="border-[#bbf7d0]">
        <CardContent className="py-12 text-center text-sm text-[#6b7280]">
          No alert rules configured. Create one to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rules.map((rule) => (
        <Card key={rule.id} className="border-[#bbf7d0]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-[#16a34a]" />
                {rule.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={rule.enabled ? "default" : "secondary"}>
                  {rule.enabled ? "Active" : "Disabled"}
                </Badge>
                <Can permission="notifications.manage">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(rule.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Delete rule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Can>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-4 text-[#6b7280]">
              <Badge variant="outline">{rule.event_type}</Badge>
              {rule.condition_field && (
                <span>
                  {rule.condition_field} {rule.condition_operator} {rule.condition_value}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[#6b7280]">
              {rule.channel === "sms" ? (
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> SMS</span>
              ) : (
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
              )}
              {rule.cooldown_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {rule.cooldown_minutes}m cooldown
                </span>
              )}
            </div>
            {rule.recipients?.length > 0 && (
              <p className="text-xs text-[#6b7280]">
                Recipients: {rule.recipients.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NotificationLogTab() {
  const [channel, setChannel] = useState<string>("");
  const { data: log, isLoading } = useNotificationLog({
    channel: channel || undefined,
    limit: 50,
  });

  return (
    <Card className="border-[#bbf7d0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-[#14532d]">Recent Notifications</CardTitle>
          <Select value={channel} onValueChange={(v) => setChannel(v ?? "")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !log?.length ? (
          <p className="py-8 text-center text-sm text-[#6b7280]">No notifications sent yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {log.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs">{fullDateTime(entry.sent_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {entry.channel === "sms" ? <Phone className="mr-1 h-3 w-3" /> : <Mail className="mr-1 h-3 w-3" />}
                      {entry.channel.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{entry.recipient}</TableCell>
                  <TableCell className="text-sm">{entry.event_type}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === "sent" ? "default" : "destructive"}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AddRuleDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AlertRuleCreate>({
    name: "",
    event_type: "low_balance",
    condition_field: "balance_kwh",
    condition_operator: "lt",
    condition_value: 10,
    channel: "sms",
    recipients: [],
    cooldown_minutes: 60,
  });
  const [recipientInput, setRecipientInput] = useState("");
  const create = useCreateNotificationRule();

  const addRecipient = () => {
    if (recipientInput.trim()) {
      setForm((prev) => ({
        ...prev,
        recipients: [...prev.recipients, recipientInput.trim()],
      }));
      setRecipientInput("");
    }
  };

  const removeRecipient = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async () => {
    try {
      await create.mutateAsync(form);
      toast.success("Alert rule created");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create rule");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#16a34a] hover:bg-[#15803d]" />}>
        <Plus className="mr-2 h-4 w-4" /> Add Rule
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label>Rule Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Low Balance Alert" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Event Type</Label>
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v as NotificationEventType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((et) => (
                    <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Channel</Label>
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v as NotificationChannel })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Condition Field</Label>
            <Input value={form.condition_field ?? ""} onChange={(e) => setForm({ ...form, condition_field: e.target.value })} placeholder="balance_kwh" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Operator</Label>
              <Select value={form.condition_operator ?? "lt"} onValueChange={(v) => setForm({ ...form, condition_operator: v as ConditionOperator })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Threshold Value</Label>
              <Input type="number" value={form.condition_value ?? ""} onChange={(e) => setForm({ ...form, condition_value: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Cooldown (minutes)</Label>
            <Input type="number" value={form.cooldown_minutes ?? 60} onChange={(e) => setForm({ ...form, cooldown_minutes: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Recipients</Label>
            <div className="flex gap-2">
              <Input
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder={form.channel === "sms" ? "+255700000000" : "email@example.com"}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRecipient(); } }}
              />
              <Button type="button" variant="outline" onClick={addRecipient}>Add</Button>
            </div>
            {form.recipients.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.recipients.map((r, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {r}
                    <button onClick={() => removeRecipient(i)} className="ml-1 text-xs hover:text-red-500">&times;</button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!form.name || !form.recipients.length || create.isPending} className="bg-[#16a34a] hover:bg-[#15803d]">
            {create.isPending ? "Creating..." : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
