from collections import Counter
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ml.anomaly import detect_daily_anomaly
from app.ml.maintenance import score_maintenance_risk
from app.ml.scoring import average_scores, score_vehicle_efficiency
from app.models.alert import Alert
from app.models.daily_log import DailyLog
from app.models.enums import AlertStatus, VehicleStatus
from app.models.task import Task
from app.models.vehicle import Vehicle
from app.schemas.analytics import DashboardSummaryResponse, MaintenanceRiskResponse, VehicleAnomalyResponse, VehicleEfficiencyResponse


class AnalyticsService:
    @staticmethod
    def _recent_logs(db: Session, vehicle_id: int, days: int = 14) -> list[DailyLog]:
        cutoff = date.today() - timedelta(days=days)
        stmt = select(DailyLog).where(DailyLog.vehicle_id == vehicle_id, DailyLog.date >= cutoff).order_by(DailyLog.date.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def _vehicle_metrics(logs: list[DailyLog]) -> dict[str, float]:
        total_active = sum(float(log.active_hours) for log in logs)
        total_idle = sum(float(log.idle_hours) for log in logs)
        total_tasks = sum(log.task_count for log in logs)
        completed_tasks = sum(log.completed_task_count for log in logs)
        total_km = sum(float(log.total_km) for log in logs)
        fuel_used = sum(float(log.fuel_used) for log in logs)
        completion_ratio = completed_tasks / total_tasks if total_tasks else 0.0
        return {
            "active_hours": total_active,
            "idle_hours": total_idle,
            "task_count": float(total_tasks),
            "total_km": total_km,
            "fuel_used": fuel_used,
            "completion_ratio": completion_ratio,
        }

    @staticmethod
    def vehicle_efficiency(db: Session, vehicle: Vehicle, days: int = 14) -> VehicleEfficiencyResponse:
        logs = AnalyticsService._recent_logs(db, vehicle.id, days=days)
        scored = score_vehicle_efficiency(vehicle.type, AnalyticsService._vehicle_metrics(logs))
        return VehicleEfficiencyResponse(
            vehicle_id=vehicle.id,
            vehicle_label=f"{vehicle.plate_number} / {vehicle.brand_model}",
            score=float(scored["score"]),
            breakdown=scored["breakdown"],
            period_days=days,
        )

    @staticmethod
    def vehicle_anomalies(db: Session, vehicle: Vehicle, days: int = 14) -> VehicleAnomalyResponse:
        logs = AnalyticsService._recent_logs(db, vehicle.id, days=days)
        items = []
        for log in logs:
            result = detect_daily_anomaly(
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
            if result:
                items.append(result)
        latest_score = max((float(item["anomaly_score"]) for item in items), default=0.0)
        return VehicleAnomalyResponse(
            vehicle_id=vehicle.id,
            vehicle_label=f"{vehicle.plate_number} / {vehicle.brand_model}",
            flagged_days=len(items),
            latest_score=round(latest_score, 2),
            items=items,
        )

    @staticmethod
    def maintenance_risk(db: Session, vehicle: Vehicle, days: int = 30) -> MaintenanceRiskResponse:
        anomalies = AnalyticsService.vehicle_anomalies(db, vehicle, days=days)
        scored = score_maintenance_risk(
            vehicle.last_service_date,
            float(vehicle.next_service_due_km or vehicle.odometer),
            float(vehicle.odometer),
            vehicle.year,
            anomalies.flagged_days,
            date.today(),
        )
        return MaintenanceRiskResponse(vehicle_id=vehicle.id, vehicle_label=f"{vehicle.plate_number} / {vehicle.brand_model}", **scored)

    @staticmethod
    def dashboard_summary(db: Session) -> DashboardSummaryResponse:
        vehicles = list(db.scalars(select(Vehicle)).all())
        tasks = list(db.scalars(select(Task)).all())
        alert_count = db.scalar(select(func.count(Alert.id)).where(Alert.status == AlertStatus.OPEN)) or 0
        efficiency_scores = [AnalyticsService.vehicle_efficiency(db, vehicle).score for vehicle in vehicles]
        anomaly_count = sum(AnalyticsService.vehicle_anomalies(db, vehicle).flagged_days for vehicle in vehicles)
        high_risk = sum(1 for vehicle in vehicles if AnalyticsService.maintenance_risk(db, vehicle).risk_level == "high")

        by_department = Counter(vehicle.department.value for vehicle in vehicles)
        by_type = Counter(vehicle.type.value for vehicle in vehicles)
        task_summary = Counter(task.status.value if hasattr(task.status, "value") else str(task.status) for task in tasks)

        return DashboardSummaryResponse(
            total_vehicles=len(vehicles),
            active_vehicles=sum(1 for vehicle in vehicles if vehicle.status == VehicleStatus.ACTIVE),
            idle_vehicles=sum(1 for vehicle in vehicles if vehicle.status == VehicleStatus.IDLE),
            vehicles_in_service=sum(1 for vehicle in vehicles if vehicle.status == VehicleStatus.IN_SERVICE),
            average_efficiency=average_scores(efficiency_scores),
            anomaly_count=anomaly_count,
            high_risk_maintenance_vehicles=high_risk,
            task_completion_summary=dict(task_summary),
            vehicles_by_department=dict(by_department),
            vehicles_by_type=dict(by_type),
            open_alerts=int(alert_count),
        )
