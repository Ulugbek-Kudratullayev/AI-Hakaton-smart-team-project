from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.driver import DriverResponse
from app.services.fleet_service import FleetService


router = APIRouter()


@router.get("", response_model=list[DriverResponse])
def list_drivers(db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))) -> list[DriverResponse]:
    return FleetService.list_drivers(db)
