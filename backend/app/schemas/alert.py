from datetime import datetime

from pydantic import BaseModel

from app.models.enums import AlertSeverity, AlertStatus, AlertType
from app.schemas.base import ORMModel


class AlertResponse(ORMModel):
    id: int
    vehicle_id: int | None
    task_id: int | None
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: str
    status: AlertStatus
    created_at: datetime
    updated_at: datetime


class AlertSummary(BaseModel):
    vehicle_id: int | None
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: str
