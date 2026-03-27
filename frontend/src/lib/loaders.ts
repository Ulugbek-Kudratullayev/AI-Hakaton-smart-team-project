/**
 * Data hooks / loaders that fetch from the API and fall back to mock data.
 *
 * Each function returns the same type the UI already expects,
 * transforming from API shape → frontend shape when needed.
 */

import { api, getToken, ApiVehicle, ApiTask, ApiAlert, ApiMaintenance, ApiDriver, ApiDashboardSummary } from '@/lib/api';
import {
  vehicles as mockVehicles,
  tasks as mockTasks,
  alerts as mockAlerts,
  maintenanceRecords as mockMaintenance,
  kpiData as mockKpi,
  activityLogs as mockLogs,
} from '@/data/mockData';
import type { Vehicle, Task, Alert, Maintenance, KPIData, ActivityLog } from '@/types';

// ─── Auto-login for demo ────────────────────────────────────────────────────

let _autoLoginPromise: Promise<void> | null = null;

async function ensureAuth() {
  if (getToken()) return;
  if (!_autoLoginPromise) {
    _autoLoginPromise = api.login('admin', 'Admin123!').then(() => {}).catch(() => {});
  }
  await _autoLoginPromise;
}

// ─── Enum label maps (backend → frontend Uzbek labels) ─────────────────────

const vehicleTypeLabel: Record<string, string> = {
  tractor: 'traktor',
  utility_truck: 'yuk_mashinasi',
  service_car: 'xizmat_avtomobili',
  municipal_vehicle: 'avtobus',
  water_tanker: "sug'orish_mashinasi",
  loader: 'ekskovator',
  other: 'xizmat_avtomobili',
};

const departmentLabel: Record<string, string> = {
  agriculture: "Qishloq xo'jaligi bo'limi",
  municipal: "Kommunal xo'jalik bo'limi",
  sanitation: "Ekologiya bo'limi",
  transport: "Yo'l-transport bo'limi",
  maintenance: "Qurilish bo'limi",
  other: "Boshqa bo'lim",
};

const vehicleStatusMap: Record<string, Vehicle['status']> = {
  active: 'faol',
  idle: 'kutish',
  in_service: "ta'mirda",
  offline: 'kutish',
  unavailable: "ta'mirda",
};

const taskStatusMap: Record<string, Task['status']> = {
  pending: 'rejalashtirilgan',
  assigned: 'rejalashtirilgan',
  in_progress: 'jarayonda',
  completed: 'bajarildi',
  cancelled: 'bekor_qilindi',
};

const taskPriorityMap: Record<string, Task['priority']> = {
  low: 'past',
  medium: "o'rta",
  high: 'yuqori',
  critical: 'yuqori',
};

const taskTypeMap: Record<string, string> = {
  field_work: "Qishloq xo'jalik",
  equipment_delivery: 'Transport',
  municipal_service: 'Kommunal',
  road_service: 'Qurilish',
  transport_support: 'Transport',
  inspection: 'Ekologiya',
  emergency: 'Kommunal',
  other: 'Boshqa',
};

const alertTypeMap: Record<string, Alert['type']> = {
  fuel_anomaly: 'yoqilgi_anomaliya',
  excessive_idle: 'ortiqcha_kutish',
  overdue_service: 'texnik_xizmat',
  unusual_movement: 'marshrut_buzilishi',
  low_efficiency: 'tezlik_buzilishi',
};

const alertSeverityMap: Record<string, Alert['severity']> = {
  low: 'past',
  medium: "o'rta",
  high: 'yuqori',
  critical: 'yuqori',
};

const alertStatusMap: Record<string, Alert['status']> = {
  open: 'yangi',
  acknowledged: "ko'rildi",
  resolved: 'hal_qilindi',
};

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapVehicle(v: ApiVehicle, drivers?: ApiDriver[]): Vehicle {
  const driver = drivers?.find(d => d.assigned_vehicle_id === v.id);
  return {
    id: `v-${String(v.id).padStart(3, '0')}`,
    internal_code: v.internal_code,
    plate_number: v.plate_number,
    type: (vehicleTypeLabel[v.type] || 'xizmat_avtomobili') as Vehicle['type'],
    department: departmentLabel[v.department] || v.department,
    status: vehicleStatusMap[v.status] || 'kutish',
    assigned_driver: driver?.full_name || 'Tayinlanmagan',
    current_location: {
      lat: v.current_lat ?? 41.3,
      lng: v.current_lng ?? 69.25,
    },
    odometer: v.odometer,
    efficiency_score: 75, // will be overridden by analytics endpoint
    maintenance_risk: 50,
    anomaly_count: 0,
    fuel_level: Math.round((1 - (v.odometer % 100) / 100) * 100), // simulated
    last_service: v.last_service_date || '2026-01-15',
    next_service: v.next_service_due_date || '2026-04-15',
    year: v.year,
    model: v.brand_model,
  };
}

function mapTask(t: ApiTask, vehicles?: ApiVehicle[]): Task {
  const vehicle = vehicles?.find(v => v.id === t.assigned_vehicle_id);
  return {
    id: `t-${String(t.id).padStart(3, '0')}`,
    title: t.title,
    type: taskTypeMap[t.task_type] || t.task_type,
    priority: taskPriorityMap[t.priority] || "o'rta",
    region: t.region,
    district: t.district,
    scheduled_start: t.scheduled_start,
    scheduled_end: t.scheduled_end,
    status: taskStatusMap[t.status] || 'rejalashtirilgan',
    assigned_vehicle: vehicle ? `v-${String(vehicle.id).padStart(3, '0')}` : null,
    assigned_vehicle_code: vehicle?.internal_code || null,
    description: t.description,
    created_at: t.created_at,
    recommended_vehicles: [],
    lat: t.lat || undefined,
    lng: t.lng || undefined,
  };
}

function mapAlert(a: ApiAlert, vehicles?: ApiVehicle[]): Alert {
  const vehicle = vehicles?.find(v => v.id === a.vehicle_id);
  return {
    id: `a-${String(a.id).padStart(3, '0')}`,
    type: alertTypeMap[a.alert_type] || 'texnik_xizmat',
    severity: alertSeverityMap[a.severity] || "o'rta",
    vehicle_id: vehicle ? `v-${String(vehicle.id).padStart(3, '0')}` : 'v-000',
    vehicle_code: vehicle?.internal_code || 'N/A',
    message: a.title,
    created_at: a.created_at,
    status: alertStatusMap[a.status] || 'yangi',
    details: a.description,
  };
}

function mapMaintenance(m: ApiMaintenance, vehicles?: ApiVehicle[]): Maintenance {
  const vehicle = vehicles?.find(v => v.id === m.vehicle_id);
  const today = new Date();
  const serviceDate = new Date(m.service_date);
  const isPast = serviceDate < today;
  return {
    id: `m-${String(m.id).padStart(3, '0')}`,
    vehicle_id: vehicle ? `v-${String(vehicle.id).padStart(3, '0')}` : 'v-000',
    vehicle_code: vehicle?.internal_code || 'N/A',
    plate_number: vehicle?.plate_number || 'N/A',
    service_type: m.service_type,
    due_date: m.service_date,
    completed_date: isPast ? m.service_date : null,
    risk_score: isPast ? 10 : 50,
    status: isPast ? 'bajarildi' : 'rejalashtirilgan',
    mechanic: 'Texnik xodim',
    notes: m.notes || '',
    cost: m.cost > 0 ? m.cost : null,
  };
}

function mapDashboardToKpi(d: ApiDashboardSummary): KPIData {
  return {
    total_vehicles: d.total_vehicles,
    active_vehicles: d.active_vehicles,
    idle_vehicles: d.idle_vehicles,
    in_service: d.vehicles_in_service,
    average_efficiency: Math.round(d.average_efficiency),
    anomaly_alerts: d.open_alerts,
  };
}

// ─── Data Loaders ───────────────────────────────────────────────────────────

export async function loadVehicles(): Promise<{ data: Vehicle[]; source: 'api' | 'mock' }> {
  await ensureAuth();
  const fallback = () => mockVehicles.map(v => ({
    id: 0, plate_number: v.plate_number, internal_code: v.internal_code,
    type: 'service_car', department: 'other', brand_model: v.model,
    year: v.year, fuel_type: 'diesel', fuel_capacity: 60,
    status: 'active', assigned_driver_id: null,
    current_lat: v.current_location.lat, current_lng: v.current_location.lng,
    odometer: v.odometer,
    last_service_date: v.last_service, next_service_due_km: null,
    next_service_due_date: v.next_service,
    created_at: '', updated_at: '',
  }));

  const result = await api.getVehicles(fallback);

  if (result.source === 'mock') {
    return { data: mockVehicles, source: 'mock' };
  }

  // Fetch drivers to map names
  let drivers: ApiDriver[] = [];
  try {
    const driversRes = await api.getDrivers(() => []);
    drivers = driversRes.data;
  } catch { /* ignore */ }

  return {
    data: result.data.map(v => mapVehicle(v, drivers)),
    source: 'api',
  };
}

export async function loadTasks(): Promise<{ data: Task[]; source: 'api' | 'mock' }> {
  await ensureAuth();
  const result = await api.getTasks(() => []);

  if (result.source === 'mock' || result.data.length === 0) {
    return { data: mockTasks, source: 'mock' };
  }

  let vehicles: ApiVehicle[] = [];
  try {
    const vRes = await api.getVehicles(() => []);
    vehicles = vRes.data;
  } catch { /* ignore */ }

  return {
    data: result.data.map(t => mapTask(t, vehicles)),
    source: 'api',
  };
}

export async function loadAlerts(): Promise<{ data: Alert[]; source: 'api' | 'mock' }> {
  await ensureAuth();
  const result = await api.getAlerts(() => []);

  if (result.source === 'mock' || result.data.length === 0) {
    return { data: mockAlerts, source: 'mock' };
  }

  let vehicles: ApiVehicle[] = [];
  try {
    const vRes = await api.getVehicles(() => []);
    vehicles = vRes.data;
  } catch { /* ignore */ }

  return {
    data: result.data.map(a => mapAlert(a, vehicles)),
    source: 'api',
  };
}

export async function loadMaintenance(): Promise<{ data: Maintenance[]; source: 'api' | 'mock' }> {
  await ensureAuth();
  const result = await api.getMaintenance(() => []);

  if (result.source === 'mock' || result.data.length === 0) {
    return { data: mockMaintenance, source: 'mock' };
  }

  let vehicles: ApiVehicle[] = [];
  try {
    const vRes = await api.getVehicles(() => []);
    vehicles = vRes.data;
  } catch { /* ignore */ }

  return {
    data: result.data.map(m => mapMaintenance(m, vehicles)),
    source: 'api',
  };
}

export async function loadDashboard(): Promise<{ kpi: KPIData; source: 'api' | 'mock'; apiSummary?: ApiDashboardSummary }> {
  await ensureAuth();
  const result = await api.getDashboardSummary(() => ({
    total_vehicles: 0,
    active_vehicles: 0,
    idle_vehicles: 0,
    vehicles_in_service: 0,
    average_efficiency: 0,
    anomaly_count: 0,
    high_risk_maintenance_vehicles: 0,
    task_completion_summary: {},
    vehicles_by_department: {},
    vehicles_by_type: {},
    open_alerts: 0,
  }));

  if (result.source === 'mock' || result.data.total_vehicles === 0) {
    return { kpi: mockKpi, source: 'mock' };
  }

  return {
    kpi: mapDashboardToKpi(result.data),
    source: 'api',
    apiSummary: result.data,
  };
}

export async function loadActivityLogs(): Promise<ActivityLog[]> {
  // Activity logs don't have a dedicated endpoint, always use mock
  return mockLogs;
}
