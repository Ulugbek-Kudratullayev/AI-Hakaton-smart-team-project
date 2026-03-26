from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.recommendation import rank_vehicle_for_task
from app.models.daily_log import DailyLog
from app.models.task import Task
from app.models.vehicle import Vehicle
from app.schemas.analytics import RecommendationItem
from app.services.analytics_service import AnalyticsService


class RecommendationService:
    @staticmethod
    def recommend_vehicles(db: Session, task: Task, limit: int = 3) -> list[RecommendationItem]:
        vehicles = list(db.scalars(select(Vehicle)).all())
        cutoff = date.today() - timedelta(days=7)
        recommendations = []
        for vehicle in vehicles:
            workload_logs = list(
                db.scalars(
                    select(DailyLog).where(DailyLog.vehicle_id == vehicle.id, DailyLog.date >= cutoff)
                ).all()
            )
            workload_km = sum(float(log.total_km) for log in workload_logs)
            maintenance_risk = AnalyticsService.maintenance_risk(db, vehicle).risk_score
            efficiency = AnalyticsService.vehicle_efficiency(db, vehicle).breakdown.fuel_efficiency
            ranked = rank_vehicle_for_task(
                task.required_vehicle_type,
                task.lat,
                task.lng,
                {
                    "id": vehicle.id,
                    "plate_number": vehicle.plate_number,
                    "type": vehicle.type,
                    "status": vehicle.status,
                    "current_lat": vehicle.current_lat,
                    "current_lng": vehicle.current_lng,
                },
                maintenance_risk_score=maintenance_risk,
                workload_km_7d=workload_km,
                fuel_efficiency_score=efficiency,
            )
            recommendations.append(RecommendationItem(**ranked))
        recommendations.sort(key=lambda item: item.score, reverse=True)
        return recommendations[:limit]
