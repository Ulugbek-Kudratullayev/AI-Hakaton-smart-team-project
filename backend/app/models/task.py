from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import TaskPriority, TaskStatus, TaskType, VehicleType


class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str] = mapped_column(Text)
    task_type: Mapped[TaskType] = mapped_column(Enum(TaskType, native_enum=False), index=True)
    region: Mapped[str] = mapped_column(String(80), index=True)
    district: Mapped[str] = mapped_column(String(80), index=True)
    location_name: Mapped[str] = mapped_column(String(120))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority, native_enum=False), index=True)
    scheduled_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    scheduled_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus, native_enum=False), index=True)
    required_vehicle_type: Mapped[VehicleType | None] = mapped_column(Enum(VehicleType, native_enum=False), nullable=True)
    assigned_vehicle_id: Mapped[int | None] = mapped_column(ForeignKey("vehicles.id"), nullable=True)
    assigned_driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True)

    assigned_vehicle = relationship("Vehicle", back_populates="tasks", foreign_keys=[assigned_vehicle_id])
    assigned_driver = relationship("Driver", back_populates="tasks", foreign_keys=[assigned_driver_id])
    alerts = relationship("Alert", back_populates="task")
