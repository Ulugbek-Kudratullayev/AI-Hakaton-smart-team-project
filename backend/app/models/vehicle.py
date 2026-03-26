from __future__ import annotations

from datetime import date as dt_date

from sqlalchemy import Date, Enum, Float, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import DepartmentType, FuelType, VehicleStatus, VehicleType


class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    plate_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    internal_code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    type: Mapped[VehicleType] = mapped_column(Enum(VehicleType, native_enum=False), index=True)
    department: Mapped[DepartmentType] = mapped_column(Enum(DepartmentType, native_enum=False), index=True)
    brand_model: Mapped[str] = mapped_column(String(120))
    year: Mapped[int] = mapped_column(Integer)
    fuel_type: Mapped[FuelType] = mapped_column(Enum(FuelType, native_enum=False))
    fuel_capacity: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[VehicleStatus] = mapped_column(Enum(VehicleStatus, native_enum=False), index=True)
    assigned_driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True)
    current_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    odometer: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    last_service_date: Mapped[dt_date | None] = mapped_column(Date, nullable=True)
    next_service_due_km: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    next_service_due_date: Mapped[dt_date | None] = mapped_column(Date, nullable=True)

    assigned_driver = relationship("Driver", foreign_keys=[assigned_driver_id])
    daily_logs = relationship("DailyLog", back_populates="vehicle", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="assigned_vehicle", foreign_keys="Task.assigned_vehicle_id")
    alerts = relationship("Alert", back_populates="vehicle")
