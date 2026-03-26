from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.alert import AlertResponse
from app.services.fleet_service import FleetService


router = APIRouter()


@router.get("", response_model=list[AlertResponse])
def list_alerts(db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))) -> list[AlertResponse]:
    return FleetService.list_alerts(db)
