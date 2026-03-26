from __future__ import annotations

from datetime import date as dt_date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class MaintenanceRecord(Base, TimestampMixin):
    __tablename__ = "maintenance_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    service_type: Mapped[str] = mapped_column(String(100))
    service_date: Mapped[dt_date] = mapped_column(Date, index=True)
    odometer_at_service: Mapped[float] = mapped_column(Numeric(12, 2))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cost: Mapped[float] = mapped_column(Numeric(12, 2), default=0)

    vehicle = relationship("Vehicle", back_populates="maintenance_records")
