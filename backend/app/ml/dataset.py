"""
Generate training datasets from daily logs using rule-based labels.
"""

from __future__ import annotations

import numpy as np
from sqlalchemy.orm import Session

from app.models.daily_log import DailyLog
from app.models.vehicle import Vehicle
from app.models.enums import VehicleType
from app.ml.anomaly import detect_daily_anomaly
from app.ml.maintenance import score_maintenance_risk
from app.ml.config import FUEL_L_PER_KM_BASELINE


# Ordinal encoding for vehicle types
VEHICLE_TYPE_ENCODING = {
    VehicleType.TRACTOR: 0,
    VehicleType.UTILITY_TRUCK: 1,
    VehicleType.SERVICE_CAR: 2,
    VehicleType.MUNICIPAL_VEHICLE: 3,
    VehicleType.WATER_TANKER: 4,
    VehicleType.LOADER: 5,
    VehicleType.OTHER: 6,
}


def generate_anomaly_dataset(db: Session) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generate anomaly detection dataset from daily logs.
    Returns (X, y_binary, y_type) where:
      - X: feature matrix
      - y_binary: 0/1 anomaly labels
      - y_type: anomaly type index (0=none, 1=fuel, 2=idle, 3=low_eff, 4=unusual)
    """
    vehicles = {v.id: v for v in db.query(Vehicle).all()}
    logs = db.query(DailyLog).all()

    features = []
    labels_binary = []
    labels_type = []

    type_map = {
        "fuel_anomaly": 1,
        "excessive_idle": 2,
        "low_efficiency": 3,
        "unusual_movement": 4,
    }

    for log in logs:
        vehicle = vehicles.get(log.vehicle_id)
        if not vehicle:
            continue

        total_km = float(log.total_km or 0)
        fuel_used = float(log.fuel_used or 0)
        idle_hours = float(log.idle_hours or 0)
        active_hours = float(log.active_hours or 0)
        task_count = float(log.task_count or 0)
        completed = float(log.completed_task_count or 0)

        total_hours = max(active_hours + idle_hours, 0.1)
        fuel_per_km = fuel_used / total_km if total_km > 0 else fuel_used
        idle_ratio = idle_hours / total_hours
        completion_ratio = completed / max(task_count, 1.0)
        vtype_encoded = VEHICLE_TYPE_ENCODING.get(vehicle.type, 6)

        feature_row = [
            total_km, fuel_used, idle_hours, active_hours,
            task_count, completed, fuel_per_km, idle_ratio,
            completion_ratio, vtype_encoded,
        ]

        # Generate label using rule-based detector
        metrics = {
            "total_km": total_km, "fuel_used": fuel_used,
            "idle_hours": idle_hours, "active_hours": active_hours,
            "task_count": task_count, "completed_task_count": completed,
            "date": str(log.date),
        }
        result = detect_daily_anomaly(vehicle.type, metrics)

        if result:
            labels_binary.append(1)
            atype = result["anomaly_type"]
            atype_str = atype.value if hasattr(atype, "value") else str(atype)
            labels_type.append(type_map.get(atype_str, 0))
        else:
            labels_binary.append(0)
            labels_type.append(0)

        features.append(feature_row)

    return np.array(features, dtype=np.float32), np.array(labels_binary), np.array(labels_type)


def generate_maintenance_dataset(db: Session) -> tuple[np.ndarray, np.ndarray]:
    """
    Generate maintenance risk dataset.
    Returns (X, y) where y is risk_score (0-100).
    """
    from datetime import date, timedelta

    vehicles = db.query(Vehicle).all()
    today = date.today()

    features = []
    labels = []

    for vehicle in vehicles:
        # Get recent logs
        recent_logs = (
            db.query(DailyLog)
            .filter(DailyLog.vehicle_id == vehicle.id)
            .filter(DailyLog.date >= today - timedelta(days=30))
            .all()
        )

        # Count anomalies
        anomaly_count = 0
        total_fuel_per_km = []
        total_idle_ratios = []
        total_km_30d = 0.0

        for log in recent_logs:
            total_km = float(log.total_km or 0)
            fuel_used = float(log.fuel_used or 0)
            idle_h = float(log.idle_hours or 0)
            active_h = float(log.active_hours or 0)
            total_km_30d += total_km

            if total_km > 0:
                total_fuel_per_km.append(fuel_used / total_km)
            total_h = max(idle_h + active_h, 0.1)
            total_idle_ratios.append(idle_h / total_h)

            metrics = {
                "total_km": total_km, "fuel_used": fuel_used,
                "idle_hours": idle_h, "active_hours": active_h,
                "task_count": float(log.task_count or 0),
                "completed_task_count": float(log.completed_task_count or 0),
                "date": str(log.date),
            }
            if detect_daily_anomaly(vehicle.type, metrics):
                anomaly_count += 1

        days_since_service = (today - vehicle.last_service_date).days if vehicle.last_service_date else 365
        km_over_due = max(0.0, float(vehicle.odometer or 0) - float(vehicle.next_service_due_km or vehicle.odometer or 0))
        vehicle_age = max(0, today.year - (vehicle.year or today.year))
        avg_fuel = float(np.mean(total_fuel_per_km)) if total_fuel_per_km else 0.2
        avg_idle = float(np.mean(total_idle_ratios)) if total_idle_ratios else 0.3
        vtype_encoded = VEHICLE_TYPE_ENCODING.get(vehicle.type, 6)

        feature_row = [
            days_since_service, km_over_due, vehicle_age,
            anomaly_count, avg_fuel, avg_idle, total_km_30d, vtype_encoded,
        ]

        # Label from rule-based scorer
        risk = score_maintenance_risk(
            last_service_date=vehicle.last_service_date,
            next_service_due_km=float(vehicle.next_service_due_km or 0),
            current_odometer=float(vehicle.odometer or 0),
            vehicle_year=vehicle.year or 2020,
            recent_anomaly_count=anomaly_count,
            reference_date=today,
        )

        features.append(feature_row)
        labels.append(risk["risk_score"])

    return np.array(features, dtype=np.float32), np.array(labels, dtype=np.float32)
