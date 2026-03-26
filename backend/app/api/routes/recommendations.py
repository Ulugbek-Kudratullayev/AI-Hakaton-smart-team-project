from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.services.fleet_service import FleetService
from app.services.recommendation_service import RecommendationService


router = APIRouter()


@router.get("/tasks/{task_id}/vehicles")
def recommend_task_vehicles(task_id: int, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))):
    task = FleetService.get_task(db, task_id)
    return RecommendationService.recommend_vehicles(db, task)
