// --- Auth / RBAC ---
export type Role = "data_access" | "operations" | "device_management" | "user_admin";

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  roles: Role[];
  is_active: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserCreate {
  username: string;
  email: string;
  full_name: string;
  password: string;
  roles: Role[];
}

export interface UserOut {
  id: string;
  username: string;
  email: string;
  full_name: string;
  roles: Role[];
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

// --- Meter ---
export interface MeterCreate {
  serial_number: string;
  ip_address?: string | null;
  port?: number;
  auth_password?: string;
  security_level?: string;
}

export interface MeterOut {
  id: string;
  serial_number: string;
  ip_address: string | null;
  port: number;
  security_level: string;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
}

// --- Readings ---
export interface ReadRequest {
  objects?: string[];
}

export interface LiveReadResponse {
  meter_id: string;
  timestamp: string;
  readings: Record<string, number | null>;
}

export interface ReadingOut {
  id: string;
  meter_id: string;
  timestamp: string;
  energy_kwh?: number | null;
  energy_export_kwh?: number | null;
  voltage_v?: number | null;
  current_a?: number | null;
  power_kw?: number | null;
  balance_kwh?: number | null;
}

// --- Schedule ---
export interface ScheduleCreate {
  interval_minutes?: number;
  objects?: string[];
}

export interface ScheduleOut {
  id: string;
  meter_id: string;
  interval_minutes: number;
  objects: string[];
  enabled: boolean;
  last_run: string | null;
}

// --- Token / Top-Up ---
export interface TopupRequest {
  token: string;
}

export interface TopupResponse {
  status: string;
  new_balance?: number | null;
}

// --- Auto Top-Up ---
export interface AutoTopupCreate {
  threshold_kwh?: number;
  token_pool?: string[];
  enabled?: boolean;
}

export interface AutoTopupOut {
  id: string;
  meter_id: string;
  threshold_kwh: number;
  enabled: boolean;
  token_pool_json: string[] | null;
}

// --- Events ---
export interface EventOut {
  id: string;
  meter_id: string;
  timestamp: string;
  event_type: string;
  description: string | null;
}

// --- Relay ---
export interface RelayRequest {
  action: "connect" | "disconnect";
}

// --- Health ---
export interface HealthResponse {
  status: string;
  service: string;
}

// --- Alerts ---
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface AlertOut {
  id: string;
  meter_id: string;
  serial_number: string;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  duration_seconds: number | null;
}

export interface AlertRule {
  id: string;
  name: string;
  condition_type: string;
  threshold: number;
  severity: AlertSeverity;
  notify_sms: boolean;
  notify_email: boolean;
  recipients: string[];
  forward_upstream: boolean;
  enabled: boolean;
}

export interface AlertCountResponse {
  active: number;
  critical: number;
}

// --- Device Groups ---
export type GroupType = "static" | "dynamic";

export interface DeviceGroup {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  criteria?: Record<string, string | number | boolean>;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupCreate {
  name: string;
  description: string;
  type: GroupType;
  criteria?: Record<string, string | number | boolean>;
  meter_ids?: string[];
}

// --- Batch Import ---
export interface ImportPreviewRow {
  row_number: number;
  serial_number: string;
  ip_address: string;
  port: number;
  security_level: string;
  valid: boolean;
  errors: string[];
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}

// --- Meter Configuration ---
export interface MeterConfig {
  tariff_scheme: string;
  load_limit_kw: number;
  ct_ratio: number;
  vt_ratio: number;
  demand_limit_kw: number;
  region: string;
  encryption_key_id?: string;
}

export interface ConfigDeployment {
  id: string;
  config: Partial<MeterConfig>;
  target_ids: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  scheduled_at: string | null;
  completed_at: string | null;
  success_count: number;
  fail_count: number;
}

// --- Firmware ---
export interface FirmwareVersion {
  id: string;
  version: string;
  filename: string;
  device_type: "meter" | "dcu";
  size_bytes: number;
  checksum: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface FirmwareDeployment {
  id: string;
  firmware_id: string;
  firmware_version: string;
  target_ids: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  scheduled_at: string | null;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
}

// --- Performance ---
export interface PerformanceCounters {
  total_tasks: number;
  successful_tasks: number;
  failed_tasks: number;
  max_tasks_per_hour: number;
  avg_execution_time_ms: number;
  comm_success_rate: number;
  last_updated: string;
}

export interface CommQualityPoint {
  timestamp: string;
  success_rate: number;
  latency_ms: number;
  messages_processed: number;
}

export interface ReadingEstimate {
  meter_count: number;
  estimated_duration_seconds: number;
  estimated_success_rate: number;
}

// --- Reports ---
export interface ReportConfig {
  name: string;
  group_id?: string;
  meter_ids?: string[];
  from_date: string;
  to_date: string;
  metrics: string[];
  mode: "summary" | "detailed";
  chart_type: "line" | "bar" | "area" | "pie";
}

export interface ReportOut {
  id: string;
  name: string;
  config: ReportConfig;
  status: "generating" | "ready" | "failed";
  created_by: string;
  created_at: string;
  generated_at: string | null;
}

// --- GIS / Location ---
export interface DeviceLocation {
  id: string;
  serial_number: string;
  type: "meter" | "dcu";
  latitude: number;
  longitude: number;
  is_online: boolean;
  dcu_id: string | null;
  group_name: string | null;
}

export interface DCULocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  connected_meters: number;
  status: "online" | "offline";
}

// --- MDMS ---
export interface MDMSStatus {
  connected: boolean;
  last_sync: string | null;
  records_sent_24h: number;
  records_failed_24h: number;
  cim_compliance_score: number;
  interface_health: "healthy" | "degraded" | "down";
  interfaces: MDMSInterface[];
}

export interface MDMSInterface {
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  last_activity: string | null;
  messages_today: number;
}
