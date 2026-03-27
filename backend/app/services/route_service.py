import json

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.route import ServiceZone, VehicleRoute
from app.schemas.route import RouteCreate, RouteUpdate, ZoneCreate, ZoneUpdate


class RouteService:
    # ── Vehicle Routes ──────────────────────────────────────────────

    @staticmethod
    def list_routes(db: Session) -> list[dict]:
        routes = list(db.scalars(select(VehicleRoute).order_by(VehicleRoute.vehicle_id)).all())
        return [RouteService._route_to_dict(r) for r in routes]

    @staticmethod
    def get_route(db: Session, route_id: int) -> dict:
        route = db.get(VehicleRoute, route_id)
        if not route:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
        return RouteService._route_to_dict(route)

    @staticmethod
    def create_route(db: Session, payload: RouteCreate) -> dict:
        route = VehicleRoute(
            vehicle_id=payload.vehicle_id,
            route_name=payload.route_name,
            color=payload.color,
            waypoints_json=json.dumps(payload.waypoints),
        )
        db.add(route)
        db.commit()
        db.refresh(route)
        return RouteService._route_to_dict(route)

    @staticmethod
    def update_route(db: Session, route_id: int, payload: RouteUpdate) -> dict:
        route = db.get(VehicleRoute, route_id)
        if not route:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
        if payload.route_name is not None:
            route.route_name = payload.route_name
        if payload.color is not None:
            route.color = payload.color
        if payload.waypoints is not None:
            route.waypoints_json = json.dumps(payload.waypoints)
        db.commit()
        db.refresh(route)
        return RouteService._route_to_dict(route)

    @staticmethod
    def delete_route(db: Session, route_id: int) -> None:
        route = db.get(VehicleRoute, route_id)
        if not route:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
        db.delete(route)
        db.commit()

    @staticmethod
    def _route_to_dict(route: VehicleRoute) -> dict:
        return {
            "id": route.id,
            "vehicle_id": route.vehicle_id,
            "route_name": route.route_name,
            "color": route.color,
            "waypoints": json.loads(route.waypoints_json),
            "created_at": route.created_at.isoformat() if route.created_at else None,
            "updated_at": route.updated_at.isoformat() if route.updated_at else None,
        }

    # ── Service Zones ───────────────────────────────────────────────

    @staticmethod
    def list_zones(db: Session) -> list[dict]:
        zones = list(db.scalars(select(ServiceZone).order_by(ServiceZone.vehicle_id)).all())
        return [RouteService._zone_to_dict(z) for z in zones]

    @staticmethod
    def get_zone(db: Session, zone_id: int) -> dict:
        zone = db.get(ServiceZone, zone_id)
        if not zone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
        return RouteService._zone_to_dict(zone)

    @staticmethod
    def create_zone(db: Session, payload: ZoneCreate) -> dict:
        zone = ServiceZone(
            vehicle_id=payload.vehicle_id,
            zone_name=payload.zone_name,
            color=payload.color,
            polygon_json=json.dumps(payload.polygon),
        )
        db.add(zone)
        db.commit()
        db.refresh(zone)
        return RouteService._zone_to_dict(zone)

    @staticmethod
    def update_zone(db: Session, zone_id: int, payload: ZoneUpdate) -> dict:
        zone = db.get(ServiceZone, zone_id)
        if not zone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
        if payload.zone_name is not None:
            zone.zone_name = payload.zone_name
        if payload.color is not None:
            zone.color = payload.color
        if payload.polygon is not None:
            zone.polygon_json = json.dumps(payload.polygon)
        db.commit()
        db.refresh(zone)
        return RouteService._zone_to_dict(zone)

    @staticmethod
    def delete_zone(db: Session, zone_id: int) -> None:
        zone = db.get(ServiceZone, zone_id)
        if not zone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
        db.delete(zone)
        db.commit()

    @staticmethod
    def _zone_to_dict(zone: ServiceZone) -> dict:
        return {
            "id": zone.id,
            "vehicle_id": zone.vehicle_id,
            "zone_name": zone.zone_name,
            "color": zone.color,
            "polygon": json.loads(zone.polygon_json),
            "created_at": zone.created_at.isoformat() if zone.created_at else None,
            "updated_at": zone.updated_at.isoformat() if zone.updated_at else None,
        }
