from sqlalchemy import Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import DriverStatus


class Driver(Base, TimestampMixin):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), index=True)
    phone: Mapped[str] = mapped_column(String(30), unique=True)
    license_type: Mapped[str] = mapped_column(String(50))
    status: Mapped[DriverStatus] = mapped_column(Enum(DriverStatus, native_enum=False), index=True)
    experience_years: Mapped[int] = mapped_column(Integer, default=1)
    assigned_vehicle_id: Mapped[int | None] = mapped_column(ForeignKey("vehicles.id"), nullable=True)
    current_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_lng: Mapped[float | None] = mapped_column(Float, nullable=True)

    assigned_vehicle = relationship("Vehicle", foreign_keys=[assigned_vehicle_id])
    daily_logs = relationship("DailyLog", back_populates="driver")
    tasks = relationship("Task", back_populates="assigned_driver", foreign_keys="Task.assigned_driver_id")
