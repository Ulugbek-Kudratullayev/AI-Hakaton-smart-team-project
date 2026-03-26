from datetime import datetime

from pydantic import BaseModel

from app.models.enums import DriverStatus
from app.schemas.base import ORMModel


class DriverBase(BaseModel):
    full_name: str
    phone: str
    license_type: str
    status: DriverStatus
    experience_years: int
    assigned_vehicle_id: int | None = None
    current_lat: float | None = None
    current_lng: float | None = None


class DriverCreate(DriverBase):
    pass


class DriverResponse(ORMModel):
    id: int
    full_name: str
    phone: str
    license_type: str
    status: DriverStatus
    experience_years: int
    assigned_vehicle_id: int | None
    current_lat: float | None
    current_lng: float | None
    created_at: datetime
    updated_at: datetime
