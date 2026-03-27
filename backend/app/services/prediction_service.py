"""
AI prediction service — breakdown forecast, fuel anomaly probability, fleet risk ranking.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

import numpy as np
from sqlalchemy.orm import Session

from app.ml.model_registry import registry
from app.ml.dataset import VEHICLE_TYPE_ENCODING
from app.ml.anomaly import detect_daily_anomaly
from app.ml.maintenance import score_maintenance_risk
from app.models.daily_log import DailyLog
from app.models.vehicle import Vehicle


def _get_daily_features(log, vehicle_type_encoded: int) -> list[float]:
    """Extract feature vector from a DailyLog row."""
    total_km = float(log.total_km or 0)
    fuel_used = float(log.fuel_used or 0)
    idle_hours = float(log.idle_hours or 0)
    active_hours = float(log.active_hours or 0)
    task_count = float(log.task_count or 0)
    completed = float(log.completed_task_count or 0)
    total_hours = max(active_hours + idle_hours, 0.1)
    fuel_per_km = fuel_used / total_km if total_km > 0 else fuel_used
    idle_ratio = idle_hours / total_hours
    completion_ratio = completed / max(task_count, 1.0)
    return [
        total_km, fuel_used, idle_hours, active_hours,
        task_count, completed, fuel_per_km, idle_ratio,
        completion_ratio, vehicle_type_encoded,
    ]


def forecast_breakdown(db: Session, vehicle: Vehicle) -> dict[str, Any]:
    """Predict days until next likely breakdown/high-risk maintenance event."""
    today = date.today()
    vtype_enc = VEHICLE_TYPE_ENCODING.get(vehicle.type, 6)

    # Get recent logs
    logs = (
        db.query(DailyLog)
        .filter(DailyLog.vehicle_id == vehicle.id)
        .filter(DailyLog.date >= today - timedelta(days=30))
        .order_by(DailyLog.date.desc())
        .all()
    )

    # Count recent anomalies
    anomaly_count = 0
    for log in logs:
        features = _get_daily_features(log, vtype_enc)
        result = registry.predict_anomaly(features)
        if result.get("is_anomaly"):
            anomaly_count += 1

    # Maintenance risk features
    days_since_service = (today - vehicle.last_service_date).days if vehicle.last_service_date else 365
    km_over_due = max(0.0, float(vehicle.odometer or 0) - float(vehicle.next_service_due_km or vehicle.odometer or 0))
    vehicle_age = max(0, today.year - (vehicle.year or today.year))
    avg_fuel = 0.2
    avg_idle = 0.3
    total_km_30d = 0.0

    if logs:
        fuel_rates = []
        idle_ratios = []
        for log in logs:
            tk = float(log.total_km or 0)
            total_km_30d += tk
            fu = float(log.fuel_used or 0)
            if tk > 0:
                fuel_rates.append(fu / tk)
            ih = float(log.idle_hours or 0)
            ah = float(log.active_hours or 0)
            th = max(ih + ah, 0.1)
            idle_ratios.append(ih / th)
        if fuel_rates:
            avg_fuel = float(np.mean(fuel_rates))
        if idle_ratios:
            avg_idle = float(np.mean(idle_ratios))

    maint_features = [
        days_since_service, km_over_due, vehicle_age,
        anomaly_count, avg_fuel, avg_idle, total_km_30d, vtype_enc,
    ]

    # Current risk
    risk_result = registry.predict_maintenance_risk(maint_features)
    current_risk = risk_result["risk_score"]

    # Project forward: estimate daily risk increase
    daily_km = total_km_30d / max(len(logs), 1)
    daily_risk_increase = max(0.3, (daily_km / 100) * 2 + anomaly_count * 0.5)

    # Days until risk reaches 80 (high threshold)
    if current_risk >= 80:
        predicted_days = 0
    else:
        predicted_days = max(1, int((80 - current_risk) / daily_risk_increase))

    confidence = min(95, 50 + len(logs) * 1.5 + (10 if risk_result["model"] == "ml" else 0))

    risk_factors = []
    if days_since_service > 90:
        risk_factors.append(f"Oxirgi xizmatdan {days_since_service} kun o'tgan")
    if km_over_due > 1000:
        risk_factors.append(f"Xizmat muddati {km_over_due:.0f} km oshgan")
    if anomaly_count > 2:
        risk_factors.append(f"So'nggi 30 kunda {anomaly_count} ta anomaliya")
    if vehicle_age > 5:
        risk_factors.append(f"Transport yoshi: {vehicle_age} yil")
    if avg_fuel > 0.25:
        risk_factors.append("Yoqilg'i sarfi yuqori")
    if not risk_factors:
        risk_factors.append("Hozircha jiddiy xavf omillari yo'q")

    return {
        "vehicle_id": vehicle.id,
        "internal_code": vehicle.internal_code,
        "current_risk_score": round(current_risk, 2),
        "risk_level": risk_result["risk_level"],
        "predicted_days_to_high_risk": predicted_days,
        "confidence": round(confidence, 1),
        "risk_factors": risk_factors,
        "model_type": risk_result["model"],
        "daily_risk_increase": round(daily_risk_increase, 2),
    }


def fuel_anomaly_probability(db: Session, vehicle: Vehicle) -> dict[str, Any]:
    """Predict probability of fuel anomaly in next 7 days."""
    today = date.today()
    vtype_enc = VEHICLE_TYPE_ENCODING.get(vehicle.type, 6)

    logs = (
        db.query(DailyLog)
        .filter(DailyLog.vehicle_id == vehicle.id)
        .filter(DailyLog.date >= today - timedelta(days=14))
        .order_by(DailyLog.date.desc())
        .all()
    )

    if not logs:
        return {
            "vehicle_id": vehicle.id,
            "internal_code": vehicle.internal_code,
            "probability_7d": 0.1,
            "trend": "stable",
            "explanation": "Ma'lumot yetarli emas",
            "model_type": "rule_based",
        }

    # Get probabilities for each recent day
    probabilities = []
    for log in logs:
        features = _get_daily_features(log, vtype_enc)
        result = registry.predict_fuel_anomaly(features)
        probabilities.append(result["probability"])

    avg_prob = float(np.mean(probabilities))
    # Trend: compare first half vs second half
    mid = len(probabilities) // 2
    if mid > 0:
        recent = float(np.mean(probabilities[:mid]))
        older = float(np.mean(probabilities[mid:]))
        if recent > older + 0.1:
            trend = "increasing"
        elif recent < older - 0.1:
            trend = "decreasing"
        else:
            trend = "stable"
    else:
        trend = "stable"

    # Extrapolate 7-day probability
    prob_7d = min(0.95, avg_prob * 1.5 + (0.1 if trend == "increasing" else 0))

    if prob_7d > 0.6:
        explanation = "Yoqilg'i sarfi anomaliyasi ehtimoli yuqori. Tekshiruv tavsiya etiladi."
    elif prob_7d > 0.3:
        explanation = "O'rtacha xavf darajasi. Monitoring davom ettirilsin."
    else:
        explanation = "Yoqilg'i sarfi normal chegarada."

    return {
        "vehicle_id": vehicle.id,
        "internal_code": vehicle.internal_code,
        "probability_7d": round(prob_7d, 4),
        "trend": trend,
        "explanation": explanation,
        "recent_daily_probabilities": [round(p, 4) for p in probabilities[:7]],
        "model_type": registry.fuel_lr is not None and "ml" or "rule_based",
    }


def fleet_risk_ranking(db: Session) -> list[dict[str, Any]]:
    """Rank all vehicles by combined risk (maintenance + anomaly)."""
    vehicles = db.query(Vehicle).all()
    today = date.today()
    rankings = []

    for vehicle in vehicles:
        vtype_enc = VEHICLE_TYPE_ENCODING.get(vehicle.type, 6)

        logs = (
            db.query(DailyLog)
            .filter(DailyLog.vehicle_id == vehicle.id)
            .filter(DailyLog.date >= today - timedelta(days=14))
            .all()
        )

        # Anomaly probability
        anomaly_probs = []
        anomaly_count = 0
        for log in logs:
            features = _get_daily_features(log, vtype_enc)
            result = registry.predict_anomaly(features)
            if result.get("is_anomaly"):
                anomaly_count += 1
            anomaly_probs.append(result.get("probability", 0))

        avg_anomaly_prob = float(np.mean(anomaly_probs)) if anomaly_probs else 0

        # Maintenance risk
        days_since_service = (today - vehicle.last_service_date).days if vehicle.last_service_date else 365
        km_over_due = max(0.0, float(vehicle.odometer or 0) - float(vehicle.next_service_due_km or vehicle.odometer or 0))
        vehicle_age = max(0, today.year - (vehicle.year or today.year))
        total_km = sum(float(l.total_km or 0) for l in logs)
        fuel_rates = [float(l.fuel_used or 0) / max(float(l.total_km or 0), 0.1) for l in logs]
        idle_ratios = [float(l.idle_hours or 0) / max(float(l.idle_hours or 0) + float(l.active_hours or 0), 0.1) for l in logs]

        maint_features = [
            days_since_service, km_over_due, vehicle_age, anomaly_count,
            float(np.mean(fuel_rates)) if fuel_rates else 0.2,
            float(np.mean(idle_ratios)) if idle_ratios else 0.3,
            total_km, vtype_enc,
        ]
        maint_result = registry.predict_maintenance_risk(maint_features)

        # Combined score
        combined = maint_result["risk_score"] * 0.6 + avg_anomaly_prob * 100 * 0.4

        vtype_str = vehicle.type.value if hasattr(vehicle.type, "value") else str(vehicle.type)
        status_str = vehicle.status.value if hasattr(vehicle.status, "value") else str(vehicle.status)

        rankings.append({
            "vehicle_id": vehicle.id,
            "internal_code": vehicle.internal_code,
            "plate_number": vehicle.plate_number,
            "vehicle_type": vtype_str,
            "status": status_str,
            "combined_risk": round(combined, 2),
            "maintenance_risk": round(maint_result["risk_score"], 2),
            "anomaly_probability": round(avg_anomaly_prob, 4),
            "anomaly_count_14d": anomaly_count,
            "risk_level": maint_result["risk_level"],
        })

    rankings.sort(key=lambda x: x["combined_risk"], reverse=True)
    return rankings
