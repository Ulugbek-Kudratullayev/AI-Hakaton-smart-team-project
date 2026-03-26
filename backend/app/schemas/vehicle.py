from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.enums import DepartmentType, FuelType, VehicleStatus, VehicleType
from app.schemas.base import ORMModel


class VehicleBase(BaseModel):
    plate_number: str
    internal_code: str
    type: VehicleType
    department: DepartmentType
    brand_model: str
    year: int = Field(ge=1990, le=2100)
    fuel_type: FuelType
    fuel_capacity: float = Field(gt=0)
    status: VehicleStatus
    assigned_driver_id: int | None = None
    current_lat: float | None = None
    current_lng: float | None = None
    odometer: float = Field(ge=0)
    last_service_date: date | None = None
    next_service_due_km: float | None = Field(default=None, ge=0)
    next_service_due_date: date | None = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    plate_number: str | None = None
    internal_code: str | None = None
    type: VehicleType | None = None
    department: DepartmentType | None = None
    brand_model: str | None = None
    year: int | None = Field(default=None, ge=1990, le=2100)
    fuel_type: FuelType | None = None
    fuel_capacity: float | None = Field(default=None, gt=0)
    status: VehicleStatus | None = None
    assigned_driver_id: int | None = None
    current_lat: float | None = None
    current_lng: float | None = None
    odometer: float | None = Field(default=None, ge=0)
    last_service_date: date | None = None
    next_service_due_km: float | None = Field(default=None, ge=0)
    next_service_due_date: date | None = None


class VehicleResponse(ORMModel):
    id: int
    plate_number: str
    internal_code: str
    type: VehicleType
    department: DepartmentType
    brand_model: str
    year: int
    fuel_type: FuelType
    fuel_capacity: float
    status: VehicleStatus
    assigned_driver_id: int | None
    current_lat: float | None
    current_lng: float | None
    odometer: float
    last_service_date: date | None
    next_service_due_km: float | None
    next_service_due_date: date | None
    created_at: datetime
    updated_at: datetime
