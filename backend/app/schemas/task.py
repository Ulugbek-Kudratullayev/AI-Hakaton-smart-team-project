from datetime import datetime

from pydantic import BaseModel

from app.models.enums import TaskPriority, TaskStatus, TaskType, VehicleType
from app.schemas.base import ORMModel


class TaskBase(BaseModel):
    title: str
    description: str
    task_type: TaskType
    region: str
    district: str
    location_name: str
    lat: float
    lng: float
    priority: TaskPriority
    scheduled_start: datetime
    scheduled_end: datetime
    status: TaskStatus = TaskStatus.PENDING
    required_vehicle_type: VehicleType | None = None
    assigned_vehicle_id: int | None = None
    assigned_driver_id: int | None = None


class TaskCreate(TaskBase):
    pass


class TaskAssignRequest(BaseModel):
    vehicle_id: int
    driver_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    task_type: TaskType | None = None
    region: str | None = None
    district: str | None = None
    location_name: str | None = None
    lat: float | None = None
    lng: float | None = None
    priority: TaskPriority | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    status: TaskStatus | None = None
    required_vehicle_type: VehicleType | None = None
    assigned_vehicle_id: int | None = None
    assigned_driver_id: int | None = None


class TaskResponse(ORMModel):
    id: int
    title: str
    description: str
    task_type: TaskType
    region: str
    district: str
    location_name: str
    lat: float
    lng: float
    priority: TaskPriority
    scheduled_start: datetime
    scheduled_end: datetime
    status: TaskStatus
    required_vehicle_type: VehicleType | None
    assigned_vehicle_id: int | None
    assigned_driver_id: int | None
    created_at: datetime
    updated_at: datetime
