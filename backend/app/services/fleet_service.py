from datetime import timedelta
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.daily_log import DailyLog
from app.models.driver import Driver
from app.models.enums import AlertStatus, TaskStatus
from app.models.maintenance_record import MaintenanceRecord
from app.models.task import Task
from app.models.vehicle import Vehicle
from app.schemas.daily_log import DailyLogCreate
from app.schemas.maintenance import MaintenanceRecordCreate
from app.schemas.task import TaskAssignRequest, TaskCreate, TaskUpdate
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


class FleetService:
    @staticmethod
    def list_vehicles(db: Session) -> list[Vehicle]:
        return list(db.scalars(select(Vehicle).order_by(Vehicle.department, Vehicle.type, Vehicle.plate_number)).all())

    @staticmethod
    def get_vehicle(db: Session, vehicle_id: int) -> Vehicle:
        vehicle = db.get(Vehicle, vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        return vehicle

    @staticmethod
    def create_vehicle(db: Session, payload: VehicleCreate) -> Vehicle:
        vehicle = Vehicle(**payload.model_dump())
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
        return vehicle

    @staticmethod
    def update_vehicle(db: Session, vehicle_id: int, payload: VehicleUpdate) -> Vehicle:
        vehicle = FleetService.get_vehicle(db, vehicle_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(vehicle, key, value)
        db.commit()
        db.refresh(vehicle)
        return vehicle

    @staticmethod
    def delete_vehicle(db: Session, vehicle_id: int) -> dict[str, bool]:
        vehicle = FleetService.get_vehicle(db, vehicle_id)
        db.delete(vehicle)
        db.commit()
        return {"ok": True}

    @staticmethod
    def list_drivers(db: Session) -> list[Driver]:
        return list(db.scalars(select(Driver).order_by(Driver.full_name)).all())

    @staticmethod
    def create_driver(db: Session, payload: dict[str, Any]) -> Driver:
        driver = Driver(**payload)
        db.add(driver)
        db.commit()
        db.refresh(driver)
        return driver

    @staticmethod
    def list_tasks(db: Session) -> list[Task]:
        return list(db.scalars(select(Task).order_by(desc(Task.scheduled_start))).all())

    @staticmethod
    def get_task(db: Session, task_id: int) -> Task:
        task = db.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return task

    @staticmethod
    def create_task(db: Session, payload: TaskCreate) -> Task:
        task = Task(**payload.model_dump())
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task(db: Session, task_id: int, payload: TaskUpdate) -> Task:
        task = FleetService.get_task(db, task_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def assign_task(db: Session, task_id: int, payload: TaskAssignRequest) -> Task:
        task = FleetService.get_task(db, task_id)
        vehicle = FleetService.get_vehicle(db, payload.vehicle_id)
        driver = db.get(Driver, payload.driver_id) if payload.driver_id else None
        task.assigned_vehicle_id = vehicle.id
        task.assigned_driver_id = driver.id if driver else None
        task.status = TaskStatus.ASSIGNED
        vehicle.assigned_driver_id = driver.id if driver else vehicle.assigned_driver_id
        if driver:
            driver.assigned_vehicle_id = vehicle.id
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def list_daily_logs(db: Session, vehicle_id: int | None = None) -> list[DailyLog]:
        stmt = select(DailyLog).order_by(desc(DailyLog.date))
        if vehicle_id:
            stmt = stmt.where(DailyLog.vehicle_id == vehicle_id)
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_daily_log(db: Session, payload: DailyLogCreate) -> DailyLog:
        log = DailyLog(**payload.model_dump())
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def list_maintenance_records(db: Session, vehicle_id: int | None = None) -> list[MaintenanceRecord]:
        stmt = select(MaintenanceRecord).order_by(desc(MaintenanceRecord.service_date))
        if vehicle_id:
            stmt = stmt.where(MaintenanceRecord.vehicle_id == vehicle_id)
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_maintenance_record(db: Session, payload: MaintenanceRecordCreate) -> MaintenanceRecord:
        record = MaintenanceRecord(**payload.model_dump())
        db.add(record)
        db.flush()
        vehicle = FleetService.get_vehicle(db, payload.vehicle_id)
        vehicle.last_service_date = payload.service_date
        vehicle.next_service_due_km = payload.odometer_at_service + 5000
        vehicle.next_service_due_date = payload.service_date + timedelta(days=120)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def list_alerts(db: Session) -> list[Alert]:
        return list(db.scalars(select(Alert).order_by(desc(Alert.created_at))).all())
