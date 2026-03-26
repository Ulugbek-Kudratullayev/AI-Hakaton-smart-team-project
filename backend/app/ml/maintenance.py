from datetime import date

from app.ml.scoring import clamp


def score_maintenance_risk(
    last_service_date: date | None,
    next_service_due_km: float | None,
    current_odometer: float,
    vehicle_year: int,
    recent_anomaly_count: int,
    reference_date: date,
) -> dict[str, float | int | str]:
    days_since_service = (reference_date - last_service_date).days if last_service_date else 365
    km_since_due = max(0.0, current_odometer - float(next_service_due_km or current_odometer))
    vehicle_age = max(0, reference_date.year - vehicle_year)

    score = clamp(
        min(days_since_service / 180, 1.5) * 35
        + min(km_since_due / 2500, 1.5) * 30
        + min(vehicle_age / 15, 1.0) * 20
        + min(recent_anomaly_count / 5, 1.0) * 15
    )

    if score >= 75:
        level = "high"
        action = "Schedule service within 48 hours and inspect fuel, engine, and drivetrain components."
    elif score >= 45:
        level = "medium"
        action = "Book preventive service this week and monitor for repeat anomalies."
    else:
        level = "low"
        action = "Continue operations and review during the next planned maintenance cycle."

    return {
        "risk_score": round(score, 2),
        "risk_level": level,
        "recommended_action": action,
        "inputs": {
            "days_since_last_service": days_since_service,
            "km_over_due_threshold": round(km_since_due, 2),
            "vehicle_age_years": vehicle_age,
            "recent_anomaly_count": recent_anomaly_count,
        },
    }
