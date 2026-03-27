from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class VehicleRoute(Base, TimestampMixin):
    __tablename__ = "vehicle_routes"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    route_name: Mapped[str] = mapped_column(String(200))
    color: Mapped[str] = mapped_column(String(20), default="#ef4444")
    waypoints_json: Mapped[str] = mapped_column(Text)  # JSON array of [lat, lng]

    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])


class ServiceZone(Base, TimestampMixin):
    __tablename__ = "service_zones"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    zone_name: Mapped[str] = mapped_column(String(200))
    color: Mapped[str] = mapped_column(String(20), default="#10b981")
    polygon_json: Mapped[str] = mapped_column(Text)  # JSON array of [lat, lng]

    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])
