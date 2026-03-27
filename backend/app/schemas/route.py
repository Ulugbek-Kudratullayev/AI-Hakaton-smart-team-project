from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import ORMModel


class RouteBase(BaseModel):
    vehicle_id: int
    route_name: str
    color: str = "#ef4444"
    waypoints: list[list[float]]  # [[lat, lng], ...]


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    route_name: str | None = None
    color: str | None = None
    waypoints: list[list[float]] | None = None


class RouteResponse(ORMModel):
    id: int
    vehicle_id: int
    route_name: str
    color: str
    waypoints: list[list[float]]
    created_at: datetime
    updated_at: datetime


class ZoneBase(BaseModel):
    vehicle_id: int
    zone_name: str
    color: str = "#10b981"
    polygon: list[list[float]]  # [[lat, lng], ...]


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(BaseModel):
    zone_name: str | None = None
    color: str | None = None
    polygon: list[list[float]] | None = None


class ZoneResponse(ORMModel):
    id: int
    vehicle_id: int
    zone_name: str
    color: str
    polygon: list[list[float]]
    created_at: datetime
    updated_at: datetime
