from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class MaintenanceRecordBase(BaseModel):
    vehicle_id: int
    service_type: str
    service_date: date
    odometer_at_service: float = Field(ge=0)
    notes: str | None = None
    cost: float = Field(ge=0)


class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass


class MaintenanceRecordResponse(ORMModel):
    id: int
    vehicle_id: int
    service_type: str
    service_date: date
    odometer_at_service: float
    notes: str | None
    cost: float
    created_at: datetime
    updated_at: datetime
