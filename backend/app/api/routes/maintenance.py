from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.maintenance import MaintenanceRecordCreate, MaintenanceRecordResponse
from app.services.fleet_service import FleetService


router = APIRouter()


@router.get("", response_model=list[MaintenanceRecordResponse])
def list_maintenance_records(
    vehicle_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER)),
) -> list[MaintenanceRecordResponse]:
    return FleetService.list_maintenance_records(db, vehicle_id=vehicle_id)


@router.post("", response_model=MaintenanceRecordResponse)
def create_maintenance_record(payload: MaintenanceRecordCreate, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.MECHANIC))) -> MaintenanceRecordResponse:
    return FleetService.create_maintenance_record(db, payload)
