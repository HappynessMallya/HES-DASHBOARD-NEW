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
