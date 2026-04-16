// --- Auth / RBAC ---
export type Role = "data_access" | "operations" | "device_management" | "user_admin";

export interface Permission {
  code: string;
  module: string;
  description?: string;
}

export interface RoleOut {
  id: number;
  name: string;
  permissions?: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: RoleOut;
  roles: Role[]; // kept for backward compat with existing pages
  is_active: boolean;
  created_at?: string;
  permissions: string[];
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
  role_id?: number;
  roles?: Role[];
}

export interface UserOut {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: RoleOut;
  roles: Role[];
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  permissions: string[];
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// --- Meter ---
export interface MeterCreate {
  serial_number: string;
  ip_address?: string | null;
  port?: number;
  auth_password?: string;
  security_level?: string;
  profile_id?: number;
}

export interface MeterOut {
  id: string;
  serial_number: string;
  ip_address: string | null;
  port: number;
  security_level: string;
  profile_id?: number;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
}

// --- Meter Profiles ---
export interface SecurityParams {
  password_hex?: boolean;
  security_mode?: string;
  system_title_hex?: string;
  block_cipher_key_hex?: string;
  authentication_key_hex?: string;
}

export interface ProfileCreate {
  name: string;
  manufacturer?: string;
  model?: string;
  handshake?: string;
  client_address?: number;
  server_address?: number;
  auth_type?: string;
  default_password?: string;
  security_params?: SecurityParams;
  obis_overrides?: Record<string, string>;
  connection_timeout?: number;
  post_registration_delay_ms?: number;
}

export interface ProfileOut {
  id: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  handshake: string | null;
  client_address: number;
  server_address: number;
  auth_type: string | null;
  default_password: string | null;
  security_params: SecurityParams | null;
  obis_overrides: Record<string, string> | null;
  connection_timeout: number;
  post_registration_delay_ms: number;
  meter_count: number;
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
  balance_kwh?: number | null;
  values_json?: Record<string, number | string> | null;
  objects_read?: string[];
  voltage_v?: number | null;
  current_a?: number | null;
  power_kw?: number | null;
}

// --- OBIS Catalog ---
export interface OBISCode {
  name: string;
  code: string;
  description: string;
  unit: string;
  category: string;
  cosem_class: number;
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

// --- Notification Rules ---
export type NotificationChannel = "sms" | "email";
export type NotificationEventType = "tamper" | "offline" | "low_balance" | "reading" | "relay_command" | "topup";
export type ConditionOperator = "lt" | "gt" | "eq" | "lte" | "gte";

export interface AlertRule {
  id: string;
  name: string;
  event_type: NotificationEventType;
  condition_field?: string;
  condition_operator?: ConditionOperator;
  condition_value?: number;
  channel: NotificationChannel;
  recipients: string[];
  cooldown_minutes?: number;
  enabled: boolean;
  // backward compat
  condition_type?: string;
  threshold?: number;
  severity?: AlertSeverity;
  notify_sms?: boolean;
  notify_email?: boolean;
  forward_upstream?: boolean;
}

export interface AlertRuleCreate {
  name: string;
  event_type: NotificationEventType;
  condition_field?: string;
  condition_operator?: ConditionOperator;
  condition_value?: number;
  channel: NotificationChannel;
  recipients: string[];
  cooldown_minutes?: number;
}

export interface NotificationLogEntry {
  id: string;
  rule_id: string;
  channel: NotificationChannel;
  recipient: string;
  event_type: string;
  message: string;
  sent_at: string;
  status: "sent" | "failed";
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
  description?: string;
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
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
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

export type ReportType = "readings" | "summary" | "tasks" | "events";
export type ReportFormat = "json" | "csv" | "excel";

export interface ReportTypeInfo {
  type: ReportType;
  name: string;
  description: string;
}

// --- GIS / Location ---
export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface GISDashboard {
  meters: { total: number; online: number; offline: number };
  dcus: { total: number; online: number };
  topology: { regions: number; substations: number; transformers: number };
  last_24h: { readings: number; tamper_events: number };
}

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

// --- Topology ---
export interface Region {
  id: number;
  name: string;
  code: string;
}

export interface Substation {
  id: number;
  name: string;
  region_id: number;
}

export interface Transformer {
  id: number;
  name: string;
  substation_id: number;
  rating_kva?: number;
}

export interface DCU {
  id: number;
  serial_number: string;
  transformer_id: number;
}

export interface MeterAssignment {
  region_id?: number;
  substation_id?: number;
  transformer_id?: number;
  latitude?: number;
  longitude?: number;
}

export interface BatchAssignment {
  meter_ids: string[];
  region_id?: number;
  substation_id?: number;
  transformer_id?: number;
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

// --- WebSocket ---
export interface LiveMeterMessage {
  meter_id: string;
  serial_number: string;
  timestamp: string;
  is_online: boolean;
  type: "heartbeat" | "reading";
  readings: Record<string, number>;
}
