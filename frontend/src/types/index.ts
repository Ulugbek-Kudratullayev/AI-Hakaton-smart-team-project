export type VehicleType = 'traktor' | 'yuk_mashinasi' | 'xizmat_avtomobili' | 'avtobus' | 'ekskovator' | 'sug\'orish_mashinasi';
export type VehicleStatus = 'faol' | 'kutish' | 'ta\'mirda' | 'yo\'lda' | 'nomalum';
export type TaskStatus = 'rejalashtirilgan' | 'jarayonda' | 'bajarildi' | 'bekor_qilindi';
export type TaskPriority = 'yuqori' | 'o\'rta' | 'past';
export type AlertSeverity = 'yuqori' | 'o\'rta' | 'past';
export type AlertType = 'yoqilgi_anomaliya' | 'ortiqcha_kutish' | 'texnik_xizmat' | 'tezlik_buzilishi' | 'marshrut_buzilishi';
export type AlertStatus = 'yangi' | 'ko\'rildi' | 'hal_qilindi';
export type MaintenanceStatus = 'kutilmoqda' | 'rejalashtirilgan' | 'bajarildi' | 'muddati_o\'tgan';

export interface Vehicle {
  id: string;
  internal_code: string;
  plate_number: string;
  type: VehicleType;
  department: string;
  status: VehicleStatus;
  assigned_driver: string;
  current_location: { lat: number; lng: number };
  odometer: number;
  efficiency_score: number;
  maintenance_risk: number;
  anomaly_count: number;
  fuel_level: number;
  last_service: string;
  next_service: string;
  year: number;
  model: string;
}

export interface Task {
  id: string;
  title: string;
  type: string;
  priority: TaskPriority;
  region: string;
  district: string;
  scheduled_start: string;
  scheduled_end: string;
  status: TaskStatus;
  assigned_vehicle: string | null;
  assigned_vehicle_code: string | null;
  recommended_vehicles: RecommendedVehicle[];
  description: string;
  created_at: string;
}

export interface RecommendedVehicle {
  vehicle_id: string;
  vehicle_code: string;
  score: number;
  reason: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  vehicle_id: string;
  vehicle_code: string;
  message: string;
  created_at: string;
  status: AlertStatus;
  details: string;
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  vehicle_code: string;
  plate_number: string;
  service_type: string;
  due_date: string;
  completed_date: string | null;
  risk_score: number;
  status: MaintenanceStatus;
  mechanic: string;
  notes: string;
  cost: number | null;
}

export interface ActivityLog {
  id: string;
  type: 'task' | 'alert' | 'maintenance' | 'vehicle';
  message: string;
  timestamp: string;
  vehicle_code?: string;
}

export interface KPIData {
  total_vehicles: number;
  active_vehicles: number;
  idle_vehicles: number;
  in_service: number;
  average_efficiency: number;
  anomaly_alerts: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
}
