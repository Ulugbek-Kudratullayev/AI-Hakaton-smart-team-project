from dataclasses import dataclass

from app.models.enums import VehicleType


@dataclass(frozen=True)
class EfficiencyScoringConfig:
    active_weight: float = 0.25
    idle_weight: float = 0.15
    task_weight: float = 0.20
    distance_weight: float = 0.10
    fuel_weight: float = 0.15
    completion_weight: float = 0.15


TARGET_KM_BY_TYPE = {
    VehicleType.TRACTOR: 45,
    VehicleType.UTILITY_TRUCK: 90,
    VehicleType.SERVICE_CAR: 120,
    VehicleType.MUNICIPAL_VEHICLE: 70,
    VehicleType.WATER_TANKER: 65,
    VehicleType.LOADER: 40,
    VehicleType.OTHER: 60,
}

FUEL_L_PER_KM_BASELINE = {
    VehicleType.TRACTOR: 0.34,
    VehicleType.UTILITY_TRUCK: 0.18,
    VehicleType.SERVICE_CAR: 0.10,
    VehicleType.MUNICIPAL_VEHICLE: 0.24,
    VehicleType.WATER_TANKER: 0.32,
    VehicleType.LOADER: 0.40,
    VehicleType.OTHER: 0.20,
}
