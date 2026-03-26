from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class DailyLogBase(BaseModel):
    vehicle_id: int
    driver_id: int | None = None
    date: date
    trip_count: int = Field(ge=0)
    total_km: float = Field(ge=0)
    fuel_used: float = Field(ge=0)
    idle_hours: float = Field(ge=0)
    active_hours: float = Field(ge=0)
    task_count: int = Field(ge=0)
    completed_task_count: int = Field(ge=0)
    notes: str | None = None


class DailyLogCreate(DailyLogBase):
    pass


class DailyLogResponse(ORMModel):
    id: int
    vehicle_id: int
    driver_id: int | None
    date: date
    trip_count: int
    total_km: float
    fuel_used: float
    idle_hours: float
    active_hours: float
    task_count: int
    completed_task_count: int
    notes: str | None
    created_at: datetime
    updated_at: datetime
