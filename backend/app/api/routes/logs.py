from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.daily_log import DailyLogCreate, DailyLogResponse
from app.services.fleet_service import FleetService


router = APIRouter()


@router.get("/daily", response_model=list[DailyLogResponse])
def list_daily_logs(
    vehicle_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER)),
) -> list[DailyLogResponse]:
    return FleetService.list_daily_logs(db, vehicle_id=vehicle_id)


@router.post("/daily", response_model=DailyLogResponse)
def create_daily_log(payload: DailyLogCreate, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER))) -> DailyLogResponse:
    return FleetService.create_daily_log(db, payload)
