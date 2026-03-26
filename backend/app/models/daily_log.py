from __future__ import annotations

from datetime import date as dt_date

from sqlalchemy import Date, Float, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class DailyLog(Base, TimestampMixin):
    __tablename__ = "daily_logs"
    __table_args__ = (UniqueConstraint("vehicle_id", "date", name="uq_daily_logs_vehicle_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True, index=True)
    date: Mapped[dt_date] = mapped_column(Date, index=True)
    trip_count: Mapped[int] = mapped_column(Integer, default=0)
    total_km: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    fuel_used: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    idle_hours: Mapped[float] = mapped_column(Float, default=0)
    active_hours: Mapped[float] = mapped_column(Float, default=0)
    task_count: Mapped[int] = mapped_column(Integer, default=0)
    completed_task_count: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

    vehicle = relationship("Vehicle", back_populates="daily_logs")
    driver = relationship("Driver", back_populates="daily_logs")
