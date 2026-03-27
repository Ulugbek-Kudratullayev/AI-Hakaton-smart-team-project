from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.services.fleet_service import FleetService


router = APIRouter()


@router.get("", response_model=list[VehicleResponse])
def list_vehicles(db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))) -> list[VehicleResponse]:
    return FleetService.list_vehicles(db)


@router.post("", response_model=VehicleResponse)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER))) -> VehicleResponse:
    return FleetService.create_vehicle(db, payload)


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))) -> VehicleResponse:
    return FleetService.get_vehicle(db, vehicle_id)


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC))) -> VehicleResponse:
    return FleetService.update_vehicle(db, vehicle_id, payload)


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN))) -> dict:
    return FleetService.delete_vehicle(db, vehicle_id)
