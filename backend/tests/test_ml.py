import pytest

from app.ml.anomaly import detect_daily_anomaly
from app.ml.maintenance import score_maintenance_risk
from app.ml.recommendation import rank_vehicle_for_task
from app.ml.scoring import score_vehicle_efficiency
from app.models.enums import VehicleStatus, VehicleType


def test_efficiency_score_rewards_productive_usage() -> None:
    strong = score_vehicle_efficiency(
        VehicleType.UTILITY_TRUCK,
        {
            "active_hours": 45,
            "idle_hours": 8,
            "task_count": 22,
            "total_km": 720,
            "fuel_used": 118,
            "completion_ratio": 0.91,
        },
    )
    weak = score_vehicle_efficiency(
        VehicleType.UTILITY_TRUCK,
        {
            "active_hours": 15,
            "idle_hours": 24,
            "task_count": 5,
            "total_km": 180,
            "fuel_used": 62,
            "completion_ratio": 0.4,
        },
    )
    assert strong["score"] > weak["score"]
    assert 0 <= strong["score"] <= 100


def test_anomaly_detector_flags_idle_abuse() -> None:
    anomaly = detect_daily_anomaly(
        VehicleType.TRACTOR,
        {
            "date": "2026-03-25",
            "total_km": 18,
            "fuel_used": 24,
            "idle_hours": 5.2,
            "active_hours": 2.3,
            "task_count": 1,
            "completed_task_count": 0,
        },
    )
    assert anomaly is not None
    assert anomaly["anomaly_type"] in {"excessive_idle", "fuel_anomaly", "low_efficiency"}


def test_maintenance_risk_becomes_high_for_overdue_vehicle() -> None:
    result = score_maintenance_risk(
        last_service_date=None,
        next_service_due_km=50000,
        current_odometer=59000,
        vehicle_year=2013,
        recent_anomaly_count=4,
        reference_date=__import__("datetime").date(2026, 3, 26),
    )
    assert result["risk_level"] == "high"
    assert result["risk_score"] >= 75


def test_recommendation_prefers_compatible_idle_vehicle() -> None:
    best = rank_vehicle_for_task(
        VehicleType.WATER_TANKER,
        41.30,
        69.24,
        {
            "id": 1,
            "plate_number": "01 A123 BC",
            "type": VehicleType.WATER_TANKER,
            "status": VehicleStatus.IDLE,
            "current_lat": 41.31,
            "current_lng": 69.25,
        },
        maintenance_risk_score=28,
        workload_km_7d=120,
        fuel_efficiency_score=78,
    )
    weak = rank_vehicle_for_task(
        VehicleType.WATER_TANKER,
        41.30,
        69.24,
        {
            "id": 2,
            "plate_number": "01 A555 DD",
            "type": VehicleType.SERVICE_CAR,
            "status": VehicleStatus.OFFLINE,
            "current_lat": 39.6,
            "current_lng": 66.9,
        },
        maintenance_risk_score=85,
        workload_km_7d=320,
        fuel_efficiency_score=42,
    )
    assert best["score"] > weak["score"]
