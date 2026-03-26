from app.schemas.alert import AlertResponse, AlertSummary
from app.schemas.analytics import (
    DashboardSummaryResponse,
    MaintenanceRiskResponse,
    RecommendationItem,
    VehicleAnomalyResponse,
    VehicleEfficiencyResponse,
)
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.schemas.daily_log import DailyLogCreate, DailyLogResponse
from app.schemas.driver import DriverCreate, DriverResponse
from app.schemas.maintenance import MaintenanceRecordCreate, MaintenanceRecordResponse
from app.schemas.task import TaskAssignRequest, TaskCreate, TaskResponse, TaskUpdate
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
