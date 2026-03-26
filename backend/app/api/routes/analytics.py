from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.services.analytics_service import AnalyticsService
from app.services.fleet_service import FleetService


router = APIRouter()


@router.get("/dashboard")
def dashboard_summary(db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))):
    return AnalyticsService.dashboard_summary(db)


@router.get("/vehicles/{vehicle_id}/efficiency")
def vehicle_efficiency(vehicle_id: int, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))):
    vehicle = FleetService.get_vehicle(db, vehicle_id)
    return AnalyticsService.vehicle_efficiency(db, vehicle)


@router.get("/vehicles/{vehicle_id}/anomalies")
def vehicle_anomalies(vehicle_id: int, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))):
    vehicle = FleetService.get_vehicle(db, vehicle_id)
    return AnalyticsService.vehicle_anomalies(db, vehicle)


@router.get("/vehicles/{vehicle_id}/maintenance-risk")
def maintenance_risk(vehicle_id: int, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))):
    vehicle = FleetService.get_vehicle(db, vehicle_id)
    return AnalyticsService.maintenance_risk(db, vehicle)
