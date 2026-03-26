from statistics import mean

from app.ml.config import EfficiencyScoringConfig, FUEL_L_PER_KM_BASELINE, TARGET_KM_BY_TYPE
from app.models.enums import VehicleType


def clamp(value: float, lower: float = 0.0, upper: float = 100.0) -> float:
    return max(lower, min(upper, value))


def score_vehicle_efficiency(vehicle_type: VehicleType, metrics: dict[str, float], config: EfficiencyScoringConfig | None = None) -> dict[str, float | dict[str, float]]:
    config = config or EfficiencyScoringConfig()
    active_hours = float(metrics.get("active_hours", 0.0))
    idle_hours = float(metrics.get("idle_hours", 0.0))
    task_count = float(metrics.get("task_count", 0.0))
    total_km = float(metrics.get("total_km", 0.0))
    fuel_used = float(metrics.get("fuel_used", 0.0))
    completion_ratio = float(metrics.get("completion_ratio", 0.0))

    total_hours = active_hours + idle_hours
    active_ratio = active_hours / total_hours if total_hours else 0.0
    idle_ratio = idle_hours / total_hours if total_hours else 1.0
    km_target = TARGET_KM_BY_TYPE.get(vehicle_type, 60)
    liters_per_km = fuel_used / total_km if total_km > 0 else FUEL_L_PER_KM_BASELINE[vehicle_type] * 1.5
    fuel_baseline = FUEL_L_PER_KM_BASELINE[vehicle_type]

    # The score combines utilization, idling discipline, output, and fuel use into a single 0-100 value.
    # Each component is normalized independently so a dispatcher can explain why a vehicle scored high or low.
    breakdown = {
        "active_utilization": clamp(active_ratio * 100),
        "idle_penalty": clamp(100 - idle_ratio * 100),
        "task_productivity": clamp((task_count / max(active_hours, 1.0)) * 22),
        "distance_utilization": clamp((total_km / km_target) * 100),
        "fuel_efficiency": clamp(100 - max(0.0, (liters_per_km - fuel_baseline) / fuel_baseline) * 120),
        "completion_ratio": clamp(completion_ratio * 100),
    }

    score = (
        breakdown["active_utilization"] * config.active_weight
        + breakdown["idle_penalty"] * config.idle_weight
        + breakdown["task_productivity"] * config.task_weight
        + breakdown["distance_utilization"] * config.distance_weight
        + breakdown["fuel_efficiency"] * config.fuel_weight
        + breakdown["completion_ratio"] * config.completion_weight
    )
    return {"score": round(clamp(score), 2), "breakdown": {k: round(v, 2) for k, v in breakdown.items()}}


def average_scores(scores: list[float]) -> float:
    return round(mean(scores), 2) if scores else 0.0
