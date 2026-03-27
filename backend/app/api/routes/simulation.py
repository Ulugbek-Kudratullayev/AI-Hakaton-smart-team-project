"""Simulation control and live position endpoints."""

from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter()


class ControlRequest(BaseModel):
    action: str  # start, pause, resume, speed_up, slow_down, reset


class RegisterMobileRequest(BaseModel):
    internal_code: str
    vehicle_type: str = "service_car"
    driver_name: str = "Haydovchi"
    lat: float = 41.3
    lng: float = 69.25


class GPSUpdateRequest(BaseModel):
    vehicle_id: int
    lat: float
    lng: float
    speed_kmh: float | None = None
    heading: float | None = None
    fuel_level: float | None = None


class DisconnectRequest(BaseModel):
    vehicle_id: int


@router.get("/positions")
def get_positions(request: Request):
    sim = request.app.state.simulation
    return sim.get_positions()


@router.get("/status")
def get_status(request: Request):
    sim = request.app.state.simulation
    return sim.get_status()


@router.post("/control")
def control_simulation(body: ControlRequest, request: Request):
    sim = request.app.state.simulation
    return sim.control(body.action)


@router.get("/activity-log")
def get_activity_log(request: Request):
    sim = request.app.state.simulation
    return sim.get_activity_log()


# --- Mobile GPS endpoints ---


@router.post("/register-mobile")
def register_mobile(body: RegisterMobileRequest, request: Request):
    """Register a mobile device as a real GPS-tracked vehicle."""
    sim = request.app.state.simulation
    return sim.register_mobile(
        internal_code=body.internal_code,
        vehicle_type=body.vehicle_type,
        driver_name=body.driver_name,
        lat=body.lat,
        lng=body.lng,
    )


@router.post("/mobile-gps")
def update_mobile_gps(body: GPSUpdateRequest, request: Request):
    """Receive GPS position update from a mobile device."""
    sim = request.app.state.simulation
    return sim.update_mobile_gps(
        vehicle_id=body.vehicle_id,
        lat=body.lat,
        lng=body.lng,
        speed_kmh=body.speed_kmh,
        heading=body.heading,
        fuel_level=body.fuel_level,
    )


@router.post("/disconnect-mobile")
def disconnect_mobile(body: DisconnectRequest, request: Request):
    """Mark a mobile vehicle as disconnected."""
    sim = request.app.state.simulation
    return sim.disconnect_mobile(body.vehicle_id)
