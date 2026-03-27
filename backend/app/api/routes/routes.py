from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.route import (
    RouteCreate, RouteResponse, RouteUpdate,
    ZoneCreate, ZoneResponse, ZoneUpdate,
)
from app.services.route_service import RouteService


router = APIRouter()


# ── Vehicle Routes ────────────────────────────────────────────────────────

@router.get("/routes", response_model=list[RouteResponse])
def list_routes(db: Session = Depends(get_db)):
    return RouteService.list_routes(db)


@router.get("/routes/{route_id}", response_model=RouteResponse)
def get_route(route_id: int, db: Session = Depends(get_db)):
    return RouteService.get_route(db, route_id)


@router.post("/routes", response_model=RouteResponse)
def create_route(payload: RouteCreate, db: Session = Depends(get_db)):
    return RouteService.create_route(db, payload)


@router.patch("/routes/{route_id}", response_model=RouteResponse)
def update_route(route_id: int, payload: RouteUpdate, db: Session = Depends(get_db)):
    return RouteService.update_route(db, route_id, payload)


@router.delete("/routes/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):
    RouteService.delete_route(db, route_id)
    return {"ok": True}


# ── Service Zones ─────────────────────────────────────────────────────────

@router.get("/zones", response_model=list[ZoneResponse])
def list_zones(db: Session = Depends(get_db)):
    return RouteService.list_zones(db)


@router.get("/zones/{zone_id}", response_model=ZoneResponse)
def get_zone(zone_id: int, db: Session = Depends(get_db)):
    return RouteService.get_zone(db, zone_id)


@router.post("/zones", response_model=ZoneResponse)
def create_zone(payload: ZoneCreate, db: Session = Depends(get_db)):
    return RouteService.create_zone(db, payload)


@router.patch("/zones/{zone_id}", response_model=ZoneResponse)
def update_zone(zone_id: int, payload: ZoneUpdate, db: Session = Depends(get_db)):
    return RouteService.update_zone(db, zone_id, payload)


@router.delete("/zones/{zone_id}")
def delete_zone(zone_id: int, db: Session = Depends(get_db)):
    RouteService.delete_zone(db, zone_id)
    return {"ok": True}
