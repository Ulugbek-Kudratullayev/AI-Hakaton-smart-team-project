from __future__ import annotations

import random
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.ml.anomaly import detect_daily_anomaly
from app.ml.maintenance import score_maintenance_risk
from app.models.alert import Alert
from app.models.daily_log import DailyLog
from app.models.driver import Driver
from app.models.enums import (
    AlertSeverity,
    AlertStatus,
    AlertType,
    DriverStatus,
    TaskPriority,
    TaskStatus,
    TaskType,
    UserRole,
    VehicleStatus,
)
from app.models.maintenance_record import MaintenanceRecord
from app.models.task import Task
from app.models.user import User
from app.models.vehicle import Vehicle
from app.utils.demo_data import DRIVER_NAMES, TASK_TEMPLATES, UZBEKISTAN_LOCATIONS, VEHICLE_TEMPLATES


SEED_PASSWORDS = {
    "admin": "Admin123!",
    "dispatcher": "Dispatch123!",
    "mechanic": "Mechanic123!",
    "viewer": "Viewer123!",
}


ALERT_TITLES = {
    AlertType.FUEL_ANOMALY: "High fuel anomaly risk",
    AlertType.EXCESSIVE_IDLE: "Excessive idle time",
    AlertType.OVERDUE_SERVICE: "Vehicle service overdue",
    AlertType.UNUSUAL_MOVEMENT: "Unusual movement signal",
    AlertType.LOW_EFFICIENCY: "Efficiency below target",
}


def seed_demo_data(db: Session, reset: bool = False) -> None:
    if reset:
        for model in (Alert, MaintenanceRecord, DailyLog, Task, Vehicle, Driver, User):
            db.execute(delete(model))
        db.commit()

    if db.scalar(select(User.id).limit(1)):
        return

    rng = random.Random(42)
    today = date.today()

    users = [
        User(username="admin", full_name="System Admin", hashed_password=get_password_hash(SEED_PASSWORDS["admin"]), role=UserRole.ADMIN),
        User(username="dispatcher", full_name="Central Dispatcher", hashed_password=get_password_hash(SEED_PASSWORDS["dispatcher"]), role=UserRole.DISPATCHER),
        User(username="mechanic", full_name="Chief Mechanic", hashed_password=get_password_hash(SEED_PASSWORDS["mechanic"]), role=UserRole.MECHANIC),
        User(username="viewer", full_name="Audit Observer", hashed_password=get_password_hash(SEED_PASSWORDS["viewer"]), role=UserRole.VIEWER),
    ]
    db.add_all(users)
    db.flush()

    drivers: list[Driver] = []
    for index, name in enumerate(DRIVER_NAMES[:16], start=1):
        location = UZBEKISTAN_LOCATIONS[index % len(UZBEKISTAN_LOCATIONS)]
        drivers.append(
            Driver(
                full_name=name,
                phone=f"+99890{rng.randint(1000000, 9999999)}",
                license_type=rng.choice(["B", "C", "C,E", "B,C"]),
                status=rng.choices(
                    [DriverStatus.ACTIVE, DriverStatus.RESTING, DriverStatus.OFF_DUTY],
                    weights=[0.65, 0.2, 0.15],
                    k=1,
                )[0],
                experience_years=rng.randint(2, 18),
                current_lat=location["lat"] + rng.uniform(-0.008, 0.008),
                current_lng=location["lng"] + rng.uniform(-0.012, 0.012),
            )
        )
    db.add_all(drivers)
    db.flush()

    vehicles: list[Vehicle] = []
    for index in range(24):
        vehicle_type, department, fuel_type, brand_model, fuel_capacity = VEHICLE_TEMPLATES[index % len(VEHICLE_TEMPLATES)]
        location = UZBEKISTAN_LOCATIONS[index % len(UZBEKISTAN_LOCATIONS)]
        assigned_driver = drivers[index] if index < len(drivers) else None
        year = rng.randint(2012, 2024)
        base_odometer = rng.randint(18000, 148000)
        last_service_date = today - timedelta(days=rng.randint(10, 220))
        next_service_due_km = base_odometer + rng.randint(1500, 7000)
        status = rng.choices(
            [VehicleStatus.ACTIVE, VehicleStatus.IDLE, VehicleStatus.IN_SERVICE, VehicleStatus.OFFLINE],
            weights=[0.48, 0.28, 0.16, 0.08],
            k=1,
        )[0]
        vehicles.append(
            Vehicle(
                plate_number=f"{rng.randint(1, 14):02d} A{rng.randint(100, 999)} {chr(65 + index % 26)}{chr(66 + index % 24)}",
                internal_code=f"HTN-{index + 1:03d}",
                type=vehicle_type,
                department=department,
                brand_model=brand_model,
                year=year,
                fuel_type=fuel_type,
                fuel_capacity=fuel_capacity,
                status=status,
                assigned_driver_id=assigned_driver.id if assigned_driver else None,
                current_lat=location["lat"] + rng.uniform(-0.012, 0.012),
                current_lng=location["lng"] + rng.uniform(-0.018, 0.018),
                odometer=base_odometer,
                last_service_date=last_service_date,
                next_service_due_km=next_service_due_km,
                next_service_due_date=last_service_date + timedelta(days=120),
            )
        )
        if assigned_driver:
            assigned_driver.assigned_vehicle_id = index + 1
    db.add_all(vehicles)
    db.flush()

    tasks: list[Task] = []
    task_types = list(TASK_TEMPLATES.keys())
    for index in range(34):
        task_type = task_types[index % len(task_types)]
        location = UZBEKISTAN_LOCATIONS[index % len(UZBEKISTAN_LOCATIONS)]
        status = rng.choices(
            [TaskStatus.PENDING, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.CANCELLED],
            weights=[0.24, 0.18, 0.14, 0.38, 0.06],
            k=1,
        )[0]
        scheduled_day = today + timedelta(days=rng.randint(-8, 10))
        start_hour = rng.randint(7, 15)
        start_dt = datetime.combine(scheduled_day, time(hour=start_hour, tzinfo=timezone.utc))
        end_dt = start_dt + timedelta(hours=rng.randint(2, 8))
        assigned_vehicle = vehicles[index % len(vehicles)] if status != TaskStatus.PENDING else None
        assigned_driver = drivers[index % len(drivers)] if assigned_vehicle and rng.random() > 0.2 else None
        tasks.append(
            Task(
                title=rng.choice(TASK_TEMPLATES[task_type]),
                description=f"{location['district']} district duty for {task_type.value.replace('_', ' ')} coordination and fleet supervision.",
                task_type=task_type,
                region=location["region"],
                district=location["district"],
                location_name=location["location_name"],
                lat=location["lat"] + rng.uniform(-0.02, 0.02),
                lng=location["lng"] + rng.uniform(-0.02, 0.02),
                priority=rng.choices(
                    [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.CRITICAL],
                    weights=[0.2, 0.4, 0.3, 0.1],
                    k=1,
                )[0],
                scheduled_start=start_dt,
                scheduled_end=end_dt,
                status=status,
                required_vehicle_type=assigned_vehicle.type if assigned_vehicle and rng.random() > 0.35 else None,
                assigned_vehicle_id=assigned_vehicle.id if assigned_vehicle else None,
                assigned_driver_id=assigned_driver.id if assigned_driver else None,
            )
        )
    db.add_all(tasks)
    db.flush()

    maintenance_records: list[MaintenanceRecord] = []
    daily_logs: list[DailyLog] = []
    anomaly_seed_vehicle_ids = {3, 7, 12, 18, 22}

    for vehicle in vehicles:
        service_count = 2 if rng.random() > 0.45 else 1
        for service_index in range(service_count):
            service_date = vehicle.last_service_date - timedelta(days=60 * service_index)
            maintenance_records.append(
                MaintenanceRecord(
                    vehicle_id=vehicle.id,
                    service_type=rng.choice(["Oil change", "Hydraulics inspection", "Brake service", "Filter replacement"]),
                    service_date=service_date,
                    odometer_at_service=max(0, float(vehicle.odometer) - rng.randint(400, 6000)),
                    notes="Scheduled preventive maintenance.",
                    cost=rng.randint(900000, 6500000),
                )
            )

        cumulative_km = float(vehicle.odometer)
        for offset in range(35, 0, -1):
            log_date = today - timedelta(days=offset)
            assigned_driver_id = vehicle.assigned_driver_id or rng.choice(drivers).id
            active_hours = max(0.5, rng.gauss(5.5, 1.8))
            idle_hours = max(0.2, rng.gauss(1.8, 0.9))
            total_km = max(4.0, rng.gauss(65 if vehicle.type.value != "loader" else 28, 18))
            fuel_factor = {
                "tractor": 0.33,
                "utility_truck": 0.17,
                "service_car": 0.1,
                "municipal_vehicle": 0.23,
                "water_tanker": 0.30,
                "loader": 0.39,
                "other": 0.18,
            }[vehicle.type.value]
            task_count = max(0, int(rng.gauss(3, 1.2)))
            completed_task_count = max(0, min(task_count, task_count - rng.randint(0, 1)))
            trip_count = max(1, int(rng.gauss(3, 1)))
            fuel_used = max(2.0, total_km * fuel_factor + rng.uniform(-2.0, 4.0))

            if vehicle.id in anomaly_seed_vehicle_ids and offset in {5, 9, 14, 21}:
                idle_hours += rng.uniform(2.5, 4.5)
                fuel_used *= rng.uniform(1.25, 1.55)
                total_km *= rng.uniform(0.4, 0.7)
                completed_task_count = max(0, completed_task_count - 1)

            if vehicle.status in {VehicleStatus.IN_SERVICE, VehicleStatus.OFFLINE} and offset < 3:
                active_hours *= 0.3
                idle_hours *= 0.5
                total_km *= 0.25
                fuel_used *= 0.4
                task_count = 0
                completed_task_count = 0

            cumulative_km += total_km
            daily_logs.append(
                DailyLog(
                    vehicle_id=vehicle.id,
                    driver_id=assigned_driver_id,
                    date=log_date,
                    trip_count=trip_count,
                    total_km=round(total_km, 2),
                    fuel_used=round(fuel_used, 2),
                    idle_hours=round(idle_hours, 2),
                    active_hours=round(active_hours, 2),
                    task_count=task_count,
                    completed_task_count=completed_task_count,
                    notes="Routine district fleet activity.",
                )
            )
        vehicle.odometer = round(cumulative_km, 2)

    db.add_all(maintenance_records)
    db.add_all(daily_logs)
    db.flush()

    recent_logs_by_vehicle: dict[int, list[DailyLog]] = {}
    for log in daily_logs:
        if log.date >= today - timedelta(days=14):
            recent_logs_by_vehicle.setdefault(log.vehicle_id, []).append(log)

    alerts: list[Alert] = []
    for vehicle in vehicles:
        recent_logs = sorted(recent_logs_by_vehicle.get(vehicle.id, []), key=lambda item: item.date, reverse=True)
        for log in recent_logs[:6]:
            anomaly = detect_daily_anomaly(
                vehicle.type,
                {
                    "date": log.date,
                    "total_km": float(log.total_km),
                    "fuel_used": float(log.fuel_used),
                    "idle_hours": float(log.idle_hours),
                    "active_hours": float(log.active_hours),
                    "task_count": float(log.task_count),
                    "completed_task_count": float(log.completed_task_count),
                },
            )
            if anomaly and len([alert for alert in alerts if alert.vehicle_id == vehicle.id]) < 2:
                alerts.append(
                    Alert(
                        vehicle_id=vehicle.id,
                        alert_type=anomaly["anomaly_type"],
                        severity=anomaly["severity"],
                        title=ALERT_TITLES[anomaly["anomaly_type"]],
                        description=anomaly["explanation"],
                        status=AlertStatus.OPEN,
                    )
                )

        risk = score_maintenance_risk(
            vehicle.last_service_date,
            float(vehicle.next_service_due_km or vehicle.odometer),
            float(vehicle.odometer),
            vehicle.year,
            len([alert for alert in alerts if alert.vehicle_id == vehicle.id]),
            today,
        )
        if risk["risk_level"] == "high":
            alerts.append(
                Alert(
                    vehicle_id=vehicle.id,
                    alert_type=AlertType.OVERDUE_SERVICE,
                    severity=AlertSeverity.HIGH,
                    title=ALERT_TITLES[AlertType.OVERDUE_SERVICE],
                    description=f"Maintenance risk is {risk['risk_score']:.0f}/100. {risk['recommended_action']}",
                    status=AlertStatus.OPEN,
                )
            )

    db.add_all(alerts[:24])
    db.commit()
