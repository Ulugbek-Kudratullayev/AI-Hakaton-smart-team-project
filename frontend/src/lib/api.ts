/**
 * API Client for Hokimiyat Transport Nazorati AI
 *
 * Connects to FastAPI backend at /api/v1.
 * Falls back to mock data if the backend is unavailable.
 */

const API_BASE = '/api/v1';

// ─── Auth Token Management ─────────────────────────────────────────────────

let accessToken: string | null = null;

export function setToken(token: string) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function getToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
}

export function clearToken() {
  accessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

// ─── Fetch Wrapper ──────────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { body, skipAuth, ...rest } = options;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((rest.headers as Record<string, string>) || {}),
  };

  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errBody.detail || response.statusText);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Safe Fetch (with mock fallback) ────────────────────────────────────────

async function safeFetch<T>(
  endpoint: string,
  fallback: () => T,
  options: FetchOptions = {},
): Promise<{ data: T; source: 'api' | 'mock' }> {
  try {
    const data = await apiFetch<T>(endpoint, options);
    return { data, source: 'api' };
  } catch {
    console.warn(`[API] ${endpoint} unavailable, using mock data`);
    return { data: fallback(), source: 'mock' };
  }
}

// ─── Backend Response Types ─────────────────────────────────────────────────

export interface ApiVehicle {
  id: number;
  plate_number: string;
  internal_code: string;
  type: string;
  department: string;
  brand_model: string;
  year: number;
  fuel_type: string;
  fuel_capacity: number;
  status: string;
  assigned_driver_id: number | null;
  current_lat: number | null;
  current_lng: number | null;
  odometer: number;
  last_service_date: string | null;
  next_service_due_km: number | null;
  next_service_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiTask {
  id: number;
  title: string;
  description: string;
  task_type: string;
  region: string;
  district: string;
  location_name: string;
  lat: number;
  lng: number;
  priority: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  required_vehicle_type: string | null;
  assigned_vehicle_id: number | null;
  assigned_driver_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiAlert {
  id: number;
  vehicle_id: number | null;
  task_id: number | null;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApiMaintenance {
  id: number;
  vehicle_id: number;
  service_type: string;
  service_date: string;
  odometer_at_service: number;
  notes: string | null;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface ApiDriver {
  id: number;
  full_name: string;
  phone: string;
  license_type: string;
  status: string;
  experience_years: number;
  assigned_vehicle_id: number | null;
  current_lat: number | null;
  current_lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiDashboardSummary {
  total_vehicles: number;
  active_vehicles: number;
  idle_vehicles: number;
  vehicles_in_service: number;
  average_efficiency: number;
  anomaly_count: number;
  high_risk_maintenance_vehicles: number;
  task_completion_summary: Record<string, number>;
  vehicles_by_department: Record<string, number>;
  vehicles_by_type: Record<string, number>;
  open_alerts: number;
}

export interface ApiRecommendation {
  vehicle_id: number;
  plate_number: string;
  vehicle_type: string;
  score: number;
  distance_km: number;
  explanation: string;
}

export interface ApiTokenResponse {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
}

export interface ApiUserResponse {
  id: number;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiRoute {
  id: number;
  vehicle_id: number;
  route_name: string;
  color: string;
  waypoints: number[][];
  created_at: string;
  updated_at: string;
}

export interface ApiZone {
  id: number;
  vehicle_id: number;
  zone_name: string;
  color: string;
  polygon: number[][];
  created_at: string;
  updated_at: string;
}

// ─── API Methods ────────────────────────────────────────────────────────────

// Auth
export const api = {
  // Auth
  async login(username: string, password: string): Promise<ApiTokenResponse> {
    const data = await apiFetch<ApiTokenResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
      skipAuth: true,
    });
    setToken(data.access_token);
    return data;
  },

  async me(): Promise<ApiUserResponse> {
    return apiFetch<ApiUserResponse>('/auth/me');
  },

  // Vehicles
  async getVehicles(fallback: () => ApiVehicle[]) {
    return safeFetch<ApiVehicle[]>('/vehicles', fallback);
  },

  async getVehicle(id: number) {
    return apiFetch<ApiVehicle>(`/vehicles/${id}`);
  },

  // Tasks
  async getTasks(fallback: () => ApiTask[]) {
    return safeFetch<ApiTask[]>('/tasks', fallback);
  },

  async createTask(data: Partial<ApiTask>) {
    return apiFetch<ApiTask>('/tasks', { method: 'POST', body: data });
  },

  async assignTask(taskId: number, vehicleId: number, driverId?: number) {
    return apiFetch<ApiTask>(`/tasks/${taskId}/assign`, {
      method: 'POST',
      body: { vehicle_id: vehicleId, driver_id: driverId ?? null },
    });
  },

  // Alerts
  async getAlerts(fallback: () => ApiAlert[]) {
    return safeFetch<ApiAlert[]>('/alerts', fallback);
  },

  // Maintenance
  async getMaintenance(fallback: () => ApiMaintenance[], vehicleId?: number) {
    const query = vehicleId ? `?vehicle_id=${vehicleId}` : '';
    return safeFetch<ApiMaintenance[]>(`/maintenance${query}`, fallback);
  },

  // Drivers
  async getDrivers(fallback: () => ApiDriver[]) {
    return safeFetch<ApiDriver[]>('/drivers', fallback);
  },

  // Analytics
  async getDashboardSummary(fallback: () => ApiDashboardSummary) {
    return safeFetch<ApiDashboardSummary>('/analytics/dashboard', fallback);
  },

  async getVehicleEfficiency(vehicleId: number) {
    return apiFetch<{
      vehicle_id: number;
      vehicle_label: string;
      score: number;
      breakdown: Record<string, number>;
      period_days: number;
    }>(`/analytics/vehicles/${vehicleId}/efficiency`);
  },

  async getVehicleAnomalies(vehicleId: number) {
    return apiFetch<{
      vehicle_id: number;
      vehicle_label: string;
      flagged_days: number;
      latest_score: number;
      items: Array<{
        date: string;
        anomaly_score: number;
        anomaly_type: string;
        confidence: number;
        explanation: string;
        severity: string;
      }>;
    }>(`/analytics/vehicles/${vehicleId}/anomalies`);
  },

  async getMaintenanceRisk(vehicleId: number) {
    return apiFetch<{
      vehicle_id: number;
      vehicle_label: string;
      risk_score: number;
      risk_level: string;
      recommended_action: string;
      inputs: Record<string, number>;
    }>(`/analytics/vehicles/${vehicleId}/maintenance-risk`);
  },

  // Recommendations
  async getTaskRecommendations(taskId: number) {
    return apiFetch<ApiRecommendation[]>(`/recommendations/tasks/${taskId}/vehicles`);
  },

  // Simulation
  async getLivePositions() {
    return apiFetch<LivePosition[]>('/simulation/positions', { skipAuth: true });
  },

  async getSimulationStatus() {
    return apiFetch<SimulationStatus>('/simulation/status', { skipAuth: true });
  },

  async controlSimulation(action: string) {
    return apiFetch<{ status: string }>('/simulation/control', {
      method: 'POST', body: { action }, skipAuth: true,
    });
  },

  async getActivityLog() {
    return apiFetch<ActivityLogEntry[]>('/simulation/activity-log', { skipAuth: true });
  },

  // Vehicle CRUD
  async createVehicle(data: Partial<ApiVehicle>) {
    return apiFetch<ApiVehicle>('/vehicles', { method: 'POST', body: data });
  },

  async updateVehicle(id: number, data: Partial<ApiVehicle>) {
    return apiFetch<ApiVehicle>(`/vehicles/${id}`, { method: 'PATCH', body: data });
  },

  async deleteVehicle(id: number) {
    return apiFetch<{ ok: boolean }>(`/vehicles/${id}`, { method: 'DELETE' });
  },

  // Routes
  async getRoutes() {
    return safeFetch<ApiRoute[]>('/manage/routes', () => []);
  },

  async createRoute(data: { vehicle_id: number; route_name: string; color: string; waypoints: number[][] }) {
    return apiFetch<ApiRoute>('/manage/routes', { method: 'POST', body: data });
  },

  async updateRoute(id: number, data: { route_name?: string; color?: string; waypoints?: number[][] }) {
    return apiFetch<ApiRoute>(`/manage/routes/${id}`, { method: 'PATCH', body: data });
  },

  async deleteRoute(id: number) {
    return apiFetch<{ ok: boolean }>(`/manage/routes/${id}`, { method: 'DELETE' });
  },

  // Zones
  async getZones() {
    return safeFetch<ApiZone[]>('/manage/zones', () => []);
  },

  async createZone(data: { vehicle_id: number; zone_name: string; color: string; polygon: number[][] }) {
    return apiFetch<ApiZone>('/manage/zones', { method: 'POST', body: data });
  },

  async updateZone(id: number, data: { zone_name?: string; color?: string; polygon?: number[][] }) {
    return apiFetch<ApiZone>(`/manage/zones/${id}`, { method: 'PATCH', body: data });
  },

  async deleteZone(id: number) {
    return apiFetch<{ ok: boolean }>(`/manage/zones/${id}`, { method: 'DELETE' });
  },

  // AI Predictions
  async getBreakdownForecast(vehicleId: number) {
    return apiFetch<BreakdownForecast>(`/predictions/vehicles/${vehicleId}/breakdown-forecast`, { skipAuth: true });
  },

  async getFuelAnomalyProbability(vehicleId: number) {
    return apiFetch<FuelAnomalyProbability>(`/predictions/vehicles/${vehicleId}/fuel-anomaly-probability`, { skipAuth: true });
  },

  async getFleetRiskRanking() {
    return apiFetch<FleetRiskItem[]>('/predictions/fleet/risk-ranking', { skipAuth: true });
  },
};

// ─── Simulation & Prediction Types ──────────────────────────────────────────

export interface LivePosition {
  vehicle_id: number;
  internal_code: string;
  vehicle_type: string;
  lat: number;
  lng: number;
  speed_kmh: number;
  heading: number;
  status: string;
  fuel_level: number;
  odometer: number;
}

export interface SimulationStatus {
  running: boolean;
  speed_multiplier: number;
  tick_count: number;
  total_vehicles: number;
  active_vehicles: number;
  sim_time: string;
}

export interface ActivityLogEntry {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  vehicle_code: string | null;
}

export interface BreakdownForecast {
  vehicle_id: number;
  internal_code: string;
  current_risk_score: number;
  risk_level: string;
  predicted_days_to_high_risk: number;
  confidence: number;
  risk_factors: string[];
  model_type: string;
  daily_risk_increase: number;
}

export interface FuelAnomalyProbability {
  vehicle_id: number;
  internal_code: string;
  probability_7d: number;
  trend: string;
  explanation: string;
  recent_daily_probabilities: number[];
  model_type: string;
}

export interface FleetRiskItem {
  vehicle_id: number;
  internal_code: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  combined_risk: number;
  maintenance_risk: number;
  anomaly_probability: number;
  anomaly_count_14d: number;
  risk_level: string;
}
