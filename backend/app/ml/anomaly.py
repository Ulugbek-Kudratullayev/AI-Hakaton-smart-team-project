from app.ml.config import FUEL_L_PER_KM_BASELINE
from app.ml.scoring import clamp
from app.models.enums import AlertSeverity, AlertType, VehicleType


def detect_daily_anomaly(vehicle_type: VehicleType, metrics: dict[str, float | str]) -> dict[str, float | str | AlertType | AlertSeverity] | None:
    total_km = float(metrics.get("total_km", 0.0))
    fuel_used = float(metrics.get("fuel_used", 0.0))
    idle_hours = float(metrics.get("idle_hours", 0.0))
    active_hours = float(metrics.get("active_hours", 0.0))
    task_count = float(metrics.get("task_count", 0.0))
    completed_task_count = float(metrics.get("completed_task_count", 0.0))
    date_label = str(metrics.get("date"))

    total_hours = max(active_hours + idle_hours, 0.1)
    idle_ratio = idle_hours / total_hours
    liters_per_km = fuel_used / total_km if total_km > 0 else fuel_used
    baseline = FUEL_L_PER_KM_BASELINE[vehicle_type]
    completion_ratio = completed_task_count / max(task_count, 1.0)

    candidates: list[dict[str, float | str | AlertType | AlertSeverity]] = []

    if total_km > 10 and liters_per_km > baseline * 1.35:
        candidates.append(
            {
                "date": date_label,
                "anomaly_score": clamp(55 + ((liters_per_km - baseline) / baseline) * 35),
                "anomaly_type": AlertType.FUEL_ANOMALY,
                "confidence": clamp(65 + ((liters_per_km - baseline) / baseline) * 25),
                "explanation": f"Fuel use {liters_per_km:.2f} L/km exceeded the {vehicle_type.value} baseline of {baseline:.2f} L/km.",
            }
        )

    if idle_ratio > 0.52 and idle_hours > 2.5:
        candidates.append(
            {
                "date": date_label,
                "anomaly_score": clamp(50 + idle_ratio * 60),
                "anomaly_type": AlertType.EXCESSIVE_IDLE,
                "confidence": clamp(60 + idle_ratio * 40),
                "explanation": f"Idle time reached {idle_hours:.1f}h, or {idle_ratio:.0%} of engine-on time.",
            }
        )

    if fuel_used > 0 and task_count <= 1 and total_km < 20 and idle_hours > active_hours:
        candidates.append(
            {
                "date": date_label,
                "anomaly_score": 72.0,
                "anomaly_type": AlertType.LOW_EFFICIENCY,
                "confidence": 75.0,
                "explanation": "Low operational output was recorded relative to daily fuel consumption and engine hours.",
            }
        )

    if total_km > 140 and completion_ratio < 0.5:
        candidates.append(
            {
                "date": date_label,
                "anomaly_score": 68.0,
                "anomaly_type": AlertType.UNUSUAL_MOVEMENT,
                "confidence": 70.0,
                "explanation": "Travel distance was high but completed task output stayed low, indicating a route mismatch signal.",
            }
        )

    if not candidates:
        return None

    item = max(candidates, key=lambda candidate: float(candidate["anomaly_score"]))
    severity = AlertSeverity.HIGH if float(item["anomaly_score"]) >= 75 else AlertSeverity.MEDIUM
    item["severity"] = severity
    item["anomaly_score"] = round(float(item["anomaly_score"]), 2)
    item["confidence"] = round(float(item["confidence"]), 2)
    return item
