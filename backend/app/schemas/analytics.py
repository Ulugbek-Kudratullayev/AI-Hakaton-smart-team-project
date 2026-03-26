from pydantic import BaseModel

from app.models.enums import AlertSeverity, AlertType


class EfficiencyBreakdown(BaseModel):
    active_utilization: float
    idle_penalty: float
    task_productivity: float
    distance_utilization: float
    fuel_efficiency: float
    completion_ratio: float


class VehicleEfficiencyResponse(BaseModel):
    vehicle_id: int
    vehicle_label: str
    score: float
    breakdown: EfficiencyBreakdown
    period_days: int


class VehicleAnomalyItem(BaseModel):
    date: str
    anomaly_score: float
    anomaly_type: AlertType
    confidence: float
    explanation: str
    severity: AlertSeverity


class VehicleAnomalyResponse(BaseModel):
    vehicle_id: int
    vehicle_label: str
    flagged_days: int
    latest_score: float
    items: list[VehicleAnomalyItem]


class MaintenanceRiskResponse(BaseModel):
    vehicle_id: int
    vehicle_label: str
    risk_score: float
    risk_level: str
    recommended_action: str
    inputs: dict[str, float | int]


class RecommendationItem(BaseModel):
    vehicle_id: int
    plate_number: str
    vehicle_type: str
    score: float
    distance_km: float
    explanation: str


class DashboardSummaryResponse(BaseModel):
    total_vehicles: int
    active_vehicles: int
    idle_vehicles: int
    vehicles_in_service: int
    average_efficiency: float
    anomaly_count: int
    high_risk_maintenance_vehicles: int
    task_completion_summary: dict[str, int]
    vehicles_by_department: dict[str, int]
    vehicles_by_type: dict[str, int]
    open_alerts: int
