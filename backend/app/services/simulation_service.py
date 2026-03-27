"""
Real-time fleet simulation engine.

Moves vehicles along routes, generates events, updates DB periodically.
Runs as an asyncio background task inside the FastAPI lifespan.
"""

from __future__ import annotations

import asyncio
import math
import random
import time
from collections import deque
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.vehicle import Vehicle
from app.models.enums import VehicleStatus, VehicleType
from app.utils.demo_data import VEHICLE_ROUTES
from app.utils.geo import haversine_km


class VehicleState:
    __slots__ = (
        "vehicle_id", "internal_code", "vehicle_type",
        "lat", "lng", "speed_kmh", "heading", "status",
        "fuel_level", "fuel_capacity", "odometer",
        "route_idx", "route_waypoints", "route_direction",
        "day_km", "day_fuel", "day_idle_hours", "day_active_hours",
        "day_tasks", "day_completed",
        "is_real_gps",
    )

    def __init__(self, v: Vehicle, route_waypoints: list[tuple[float, float]]):
        self.vehicle_id: int = v.id
        self.internal_code: str = v.internal_code
        self.vehicle_type: str = v.type.value if hasattr(v.type, "value") else str(v.type)
        self.lat: float = float(v.current_lat or 41.3)
        self.lng: float = float(v.current_lng or 69.25)
        self.speed_kmh: float = 0.0
        self.heading: float = 0.0
        self.status: str = v.status.value if hasattr(v.status, "value") else str(v.status)
        self.fuel_level: float = random.uniform(40, 95)
        self.fuel_capacity: float = float(v.fuel_capacity or 100)
        self.odometer: float = float(v.odometer or 0)
        self.route_idx: int = 0
        self.route_waypoints = route_waypoints
        self.route_direction: int = 1  # 1 = forward, -1 = reverse
        # Daily accumulators
        self.day_km = 0.0
        self.day_fuel = 0.0
        self.day_idle_hours = 0.0
        self.day_active_hours = 0.0
        self.day_tasks = 0
        self.day_completed = 0
        self.is_real_gps: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "vehicle_id": self.vehicle_id,
            "internal_code": self.internal_code,
            "vehicle_type": self.vehicle_type,
            "lat": round(self.lat, 6),
            "lng": round(self.lng, 6),
            "speed_kmh": round(self.speed_kmh, 1),
            "heading": round(self.heading, 1),
            "status": self.status,
            "fuel_level": round(self.fuel_level, 1),
            "odometer": round(self.odometer, 1),
            "is_real_gps": self.is_real_gps,
        }

    def reset_daily(self):
        self.day_km = 0.0
        self.day_fuel = 0.0
        self.day_idle_hours = 0.0
        self.day_active_hours = 0.0
        self.day_tasks = 0
        self.day_completed = 0


def _pick_route(vehicle_type: str) -> list[tuple[float, float]]:
    """Pick a suitable route for a vehicle type."""
    candidates = [
        r for r in VEHICLE_ROUTES
        if any(vt.value == vehicle_type for vt in r["vehicle_types"])
    ]
    if not candidates:
        candidates = VEHICLE_ROUTES
    route = random.choice(candidates)
    return list(route["waypoints"])


def _bearing(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate bearing between two points in degrees."""
    dLng = math.radians(lng2 - lng1)
    lat1r, lat2r = math.radians(lat1), math.radians(lat2)
    x = math.sin(dLng) * math.cos(lat2r)
    y = math.cos(lat1r) * math.sin(lat2r) - math.sin(lat1r) * math.cos(lat2r) * math.cos(dLng)
    return (math.degrees(math.atan2(x, y)) + 360) % 360


def _move_towards(
    lat: float, lng: float, target_lat: float, target_lng: float, distance_km: float
) -> tuple[float, float]:
    """Move point towards target by distance_km. Returns new (lat, lng)."""
    R = 6371.0
    d = distance_km / R
    brng = math.radians(_bearing(lat, lng, target_lat, target_lng))
    lat1 = math.radians(lat)
    lng1 = math.radians(lng)
    new_lat = math.asin(
        math.sin(lat1) * math.cos(d) + math.cos(lat1) * math.sin(d) * math.cos(brng)
    )
    new_lng = lng1 + math.atan2(
        math.sin(brng) * math.sin(d) * math.cos(lat1),
        math.cos(d) - math.sin(lat1) * math.sin(new_lat),
    )
    return math.degrees(new_lat), math.degrees(new_lng)


# Fuel consumption rate L/km by type
_FUEL_RATES: dict[str, float] = {
    "tractor": 0.34, "utility_truck": 0.18, "service_car": 0.10,
    "municipal_vehicle": 0.24, "water_tanker": 0.32, "loader": 0.40, "other": 0.20,
}

# Speed ranges by type (min, max) km/h
_SPEED_RANGES: dict[str, tuple[float, float]] = {
    "tractor": (15, 35), "utility_truck": (30, 65), "service_car": (35, 80),
    "municipal_vehicle": (20, 45), "water_tanker": (20, 40), "loader": (10, 25), "other": (25, 50),
}


class SimulationEngine:
    def __init__(self):
        self.states: dict[int, VehicleState] = {}
        self.running = False
        self.speed_multiplier = 1.0
        self.tick_count = 0
        self.sim_time = datetime.now(timezone.utc)
        self.activity_log: deque[dict[str, Any]] = deque(maxlen=100)
        self._task: asyncio.Task | None = None
        self._log_counter = 0
        self._db_flush_interval = 10  # seconds between DB writes
        self._last_db_flush = 0.0
        self._day_start_tick = 0

    async def start(self, tick_interval: float = 2.0, day_minutes: int = 2):
        """Initialize state from DB and start the background loop."""
        self._tick_interval = tick_interval
        self._ticks_per_day = (day_minutes * 60) / tick_interval
        db = SessionLocal()
        try:
            vehicles = db.query(Vehicle).all()
            for v in vehicles:
                vtype = v.type.value if hasattr(v.type, "value") else str(v.type)
                route = _pick_route(vtype)
                state = VehicleState(v, route)
                # Place vehicle on its route (random waypoint)
                if route:
                    start_idx = random.randint(0, len(route) - 1)
                    state.lat, state.lng = route[start_idx]
                    state.route_idx = start_idx
                # Set initial speed based on status
                if state.status in ("active", "idle"):
                    smin, smax = _SPEED_RANGES.get(vtype, (20, 50))
                    state.speed_kmh = random.uniform(smin, smax)
                self.states[v.id] = state
        finally:
            db.close()

        self.running = True
        self._last_db_flush = time.monotonic()
        self._add_log("vehicle", "Simulyatsiya boshlandi — {} ta transport yuklandi".format(len(self.states)))
        self._task = asyncio.create_task(self._loop())

    async def stop(self):
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        # Final DB flush
        self._flush_to_db()

    async def _loop(self):
        while self.running:
            try:
                self._tick()
                self.tick_count += 1

                # DB flush every N seconds
                now = time.monotonic()
                if now - self._last_db_flush >= self._db_flush_interval:
                    self._flush_to_db()
                    self._last_db_flush = now

                # Day boundary
                if self.tick_count - self._day_start_tick >= self._ticks_per_day:
                    self._end_of_day()
                    self._day_start_tick = self.tick_count

                await asyncio.sleep(self._tick_interval / self.speed_multiplier)
            except asyncio.CancelledError:
                break
            except Exception as e:
                # Don't crash the simulation on errors
                print(f"[Simulation] Tick error: {e}")
                await asyncio.sleep(1)

    def _tick(self):
        """Advance all vehicles by one time step."""
        dt_hours = (self._tick_interval * self.speed_multiplier) / 3600  # hours per tick

        for vid, st in self.states.items():
            # Skip vehicles controlled by real GPS from mobile app
            if st.is_real_gps:
                st.day_active_hours += dt_hours
                continue

            if st.status in ("in_service", "offline", "unavailable"):
                # Small chance to come back online
                if random.random() < 0.002 * self.speed_multiplier:
                    st.status = "active"
                    smin, smax = _SPEED_RANGES.get(st.vehicle_type, (20, 50))
                    st.speed_kmh = random.uniform(smin, smax)
                    self._add_log("vehicle", f"{st.internal_code} xizmatdan qaytdi", st.internal_code)
                continue

            if st.status == "idle":
                st.day_idle_hours += dt_hours
                # Chance to start moving
                if random.random() < 0.01 * self.speed_multiplier:
                    st.status = "active"
                    smin, smax = _SPEED_RANGES.get(st.vehicle_type, (20, 50))
                    st.speed_kmh = random.uniform(smin, smax)
                    st.route_waypoints = _pick_route(st.vehicle_type)
                    st.route_idx = 0
                    st.route_direction = 1
                    self._add_log("task", f"{st.internal_code} yangi marshrut boshladi", st.internal_code)
                    st.day_tasks += 1
                continue

            # Active vehicle — move along route
            st.day_active_hours += dt_hours
            distance_km = st.speed_kmh * dt_hours

            if not st.route_waypoints:
                st.route_waypoints = _pick_route(st.vehicle_type)
                st.route_idx = 0

            target = st.route_waypoints[st.route_idx]
            dist_to_target = haversine_km(st.lat, st.lng, target[0], target[1])

            if dist_to_target <= distance_km + 0.01:
                # Reached waypoint
                st.lat, st.lng = target
                # Advance to next waypoint
                next_idx = st.route_idx + st.route_direction
                if next_idx >= len(st.route_waypoints) or next_idx < 0:
                    # Route end — reverse direction or pick new
                    if random.random() < 0.3:
                        st.route_waypoints = _pick_route(st.vehicle_type)
                        st.route_idx = 0
                        st.route_direction = 1
                        st.day_completed += 1
                        self._add_log("task", f"{st.internal_code} marshrut yakunladi", st.internal_code)
                    else:
                        st.route_direction *= -1
                        st.route_idx += st.route_direction
                else:
                    st.route_idx = next_idx
            else:
                # Move towards target
                st.lat, st.lng = _move_towards(st.lat, st.lng, target[0], target[1], distance_km)
                st.heading = _bearing(st.lat, st.lng, target[0], target[1])

            # Update odometer and fuel
            st.odometer += distance_km
            st.day_km += distance_km
            fuel_rate = _FUEL_RATES.get(st.vehicle_type, 0.2)
            fuel_used = distance_km * fuel_rate
            st.fuel_level -= (fuel_used / st.fuel_capacity) * 100
            st.day_fuel += fuel_used

            # Refuel if low
            if st.fuel_level <= 10:
                st.fuel_level = random.uniform(70, 95)
                self._add_log("maintenance", f"{st.internal_code} yoqilg'i to'ldirildi", st.internal_code)

            # Random speed variation
            smin, smax = _SPEED_RANGES.get(st.vehicle_type, (20, 50))
            st.speed_kmh = max(smin, min(smax, st.speed_kmh + random.uniform(-3, 3)))

            # Random events
            if random.random() < 0.0005 * self.speed_multiplier:
                st.status = "idle"
                st.speed_kmh = 0
                self._add_log("alert", f"{st.internal_code} kutish holatiga o'tdi", st.internal_code)

            if random.random() < 0.0002 * self.speed_multiplier:
                self._add_log("alert", f"{st.internal_code} yoqilg'i sarfi anomaliyasi aniqlandi", st.internal_code)

    def _flush_to_db(self):
        """Write current positions to database."""
        db = SessionLocal()
        try:
            for vid, st in self.states.items():
                db.execute(
                    Vehicle.__table__.update()
                    .where(Vehicle.__table__.c.id == vid)
                    .values(
                        current_lat=st.lat,
                        current_lng=st.lng,
                        odometer=st.odometer,
                        status=st.status,
                    )
                )
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[Simulation] DB flush error: {e}")
        finally:
            db.close()

    def _end_of_day(self):
        """Generate daily logs for all vehicles."""
        from app.models.daily_log import DailyLog

        db = SessionLocal()
        try:
            today = datetime.now(timezone.utc).date()
            for vid, st in self.states.items():
                if st.day_km > 0 or st.day_active_hours > 0 or st.day_idle_hours > 0:
                    # Upsert: update existing or create new
                    existing = (
                        db.query(DailyLog)
                        .filter(DailyLog.vehicle_id == vid, DailyLog.date == today)
                        .first()
                    )
                    if existing:
                        existing.trip_count += max(1, st.day_tasks)
                        existing.total_km = float(existing.total_km or 0) + round(st.day_km, 2)
                        existing.fuel_used = float(existing.fuel_used or 0) + round(st.day_fuel, 2)
                        existing.idle_hours = float(existing.idle_hours or 0) + round(st.day_idle_hours, 2)
                        existing.active_hours = float(existing.active_hours or 0) + round(st.day_active_hours, 2)
                        existing.task_count = (existing.task_count or 0) + st.day_tasks
                        existing.completed_task_count = (existing.completed_task_count or 0) + st.day_completed
                    else:
                        log = DailyLog(
                            vehicle_id=vid,
                            date=today,
                            trip_count=max(1, st.day_tasks),
                            total_km=round(st.day_km, 2),
                            fuel_used=round(st.day_fuel, 2),
                            idle_hours=round(st.day_idle_hours, 2),
                            active_hours=round(st.day_active_hours, 2),
                            task_count=st.day_tasks,
                            completed_task_count=st.day_completed,
                        )
                        db.add(log)
                st.reset_daily()
            db.commit()
            self._add_log("vehicle", f"Kunlik hisobot yaratildi — {today}")
        except Exception as e:
            db.rollback()
            print(f"[Simulation] Daily log error: {e}")
        finally:
            db.close()

    def _add_log(self, log_type: str, message: str, vehicle_code: str | None = None):
        self._log_counter += 1
        self.activity_log.appendleft({
            "id": f"sim-{self._log_counter}",
            "type": log_type,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "vehicle_code": vehicle_code,
        })

    # --- Public API ---

    def get_positions(self) -> list[dict[str, Any]]:
        return [st.to_dict() for st in self.states.values()]

    def get_status(self) -> dict[str, Any]:
        active = sum(1 for s in self.states.values() if s.status == "active")
        return {
            "running": self.running,
            "speed_multiplier": self.speed_multiplier,
            "tick_count": self.tick_count,
            "total_vehicles": len(self.states),
            "active_vehicles": active,
            "sim_time": self.sim_time.isoformat(),
        }

    def get_activity_log(self) -> list[dict[str, Any]]:
        return list(self.activity_log)

    # --- Mobile GPS API ---

    _mobile_id_counter = -1  # negative IDs for mobile-only vehicles

    def register_mobile(self, internal_code: str, vehicle_type: str, driver_name: str,
                        lat: float = 41.3, lng: float = 69.25) -> dict[str, Any]:
        """Register a mobile device as a vehicle. Returns the assigned vehicle_id."""
        # Check if a mobile vehicle with this code already exists
        for vid, st in self.states.items():
            if st.internal_code == internal_code and st.is_real_gps:
                st.lat = lat
                st.lng = lng
                st.status = "active"
                return {"vehicle_id": vid, "status": "reconnected", "internal_code": internal_code}

        # Create new mobile vehicle state
        mid = SimulationEngine._mobile_id_counter
        SimulationEngine._mobile_id_counter -= 1

        class _FakeVehicle:
            pass

        fv = _FakeVehicle()
        fv.id = mid
        fv.internal_code = internal_code
        fv.type = vehicle_type
        fv.current_lat = lat
        fv.current_lng = lng
        fv.status = "active"
        fv.fuel_capacity = 100
        fv.odometer = 0

        st = VehicleState(fv, [])
        st.is_real_gps = True
        st.status = "active"
        self.states[mid] = st
        self._add_log("vehicle", f"📱 Mobil transport ro'yxatga olindi: {internal_code} ({driver_name})", internal_code)
        return {"vehicle_id": mid, "status": "registered", "internal_code": internal_code}

    def update_mobile_gps(self, vehicle_id: int, lat: float, lng: float,
                          speed_kmh: float | None = None,
                          heading: float | None = None,
                          fuel_level: float | None = None) -> dict[str, Any]:
        """Update position of a mobile-tracked vehicle."""
        if vehicle_id not in self.states:
            return {"error": "vehicle not found"}

        st = self.states[vehicle_id]
        old_lat, old_lng = st.lat, st.lng
        st.lat = lat
        st.lng = lng
        st.is_real_gps = True
        st.status = "active"

        if speed_kmh is not None:
            st.speed_kmh = speed_kmh
        if heading is not None:
            st.heading = heading
        if fuel_level is not None:
            st.fuel_level = fuel_level

        # Calculate distance traveled
        dist = haversine_km(old_lat, old_lng, lat, lng)
        if dist < 50:  # sanity check - max 50km per update
            st.odometer += dist
            st.day_km += dist
            fuel_rate = _FUEL_RATES.get(st.vehicle_type, 0.2)
            st.day_fuel += dist * fuel_rate

        return {
            "status": "updated",
            "vehicle_id": vehicle_id,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "distance_km": round(dist, 3),
        }

    def disconnect_mobile(self, vehicle_id: int) -> dict[str, str]:
        """Mark a mobile vehicle as disconnected."""
        if vehicle_id in self.states:
            st = self.states[vehicle_id]
            st.is_real_gps = False
            st.status = "offline"
            st.speed_kmh = 0
            self._add_log("vehicle", f"📱 Mobil transport uzildi: {st.internal_code}", st.internal_code)
            return {"status": "disconnected"}
        return {"error": "vehicle not found"}

    def control(self, action: str) -> dict[str, str]:
        if action == "pause":
            self.running = False
            return {"status": "paused"}
        elif action == "resume" or action == "start":
            self.running = True
            return {"status": "running"}
        elif action == "speed_up":
            self.speed_multiplier = min(10.0, self.speed_multiplier * 2)
            return {"status": f"speed {self.speed_multiplier}x"}
        elif action == "slow_down":
            self.speed_multiplier = max(0.5, self.speed_multiplier / 2)
            return {"status": f"speed {self.speed_multiplier}x"}
        elif action == "reset":
            for st in self.states.values():
                st.reset_daily()
            self.tick_count = 0
            self._day_start_tick = 0
            return {"status": "reset"}
        return {"status": "unknown action"}
