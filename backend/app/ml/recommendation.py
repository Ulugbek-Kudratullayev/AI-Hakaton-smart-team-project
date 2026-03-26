from app.models.enums import VehicleStatus, VehicleType
from app.utils.geo import haversine_km


def rank_vehicle_for_task(
    task_required_type: VehicleType | None,
    task_lat: float,
    task_lng: float,
    vehicle: dict,
    maintenance_risk_score: float,
    workload_km_7d: float,
    fuel_efficiency_score: float,
) -> dict:
    compatible = task_required_type is None or vehicle["type"] == task_required_type
    distance_km = haversine_km(vehicle.get("current_lat"), vehicle.get("current_lng"), task_lat, task_lng)
    distance_score = max(0.0, 25 - min(distance_km, 100) * 0.25)
    status_score_map = {
        VehicleStatus.ACTIVE: 18,
        VehicleStatus.IDLE: 25,
        VehicleStatus.IN_SERVICE: 4,
        VehicleStatus.OFFLINE: 1,
        VehicleStatus.UNAVAILABLE: 0,
    }
    status_score = status_score_map[vehicle["status"]]
    compatibility_score = 35 if compatible else 5
    maintenance_penalty = min(maintenance_risk_score * 0.20, 18)
    workload_penalty = min(workload_km_7d / 18, 12)
    fuel_bonus = min(fuel_efficiency_score * 0.12, 10)
    score = max(0.0, compatibility_score + distance_score + status_score + fuel_bonus - maintenance_penalty - workload_penalty)

    explanation = (
        f"{vehicle['plate_number']} matched type requirements, is {distance_km:.1f} km away, "
        f"has maintenance risk {maintenance_risk_score:.0f}, and recent workload {workload_km_7d:.0f} km."
    )
    return {
        "vehicle_id": vehicle["id"],
        "plate_number": vehicle["plate_number"],
        "vehicle_type": vehicle["type"].value,
        "score": round(score, 2),
        "distance_km": round(distance_km, 2),
        "explanation": explanation,
    }
