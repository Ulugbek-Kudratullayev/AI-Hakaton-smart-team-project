from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "admin"
    DISPATCHER = "dispatcher"
    MECHANIC = "mechanic"
    VIEWER = "viewer"


class VehicleType(StrEnum):
    TRACTOR = "tractor"
    UTILITY_TRUCK = "utility_truck"
    SERVICE_CAR = "service_car"
    MUNICIPAL_VEHICLE = "municipal_vehicle"
    WATER_TANKER = "water_tanker"
    LOADER = "loader"
    OTHER = "other"


class DepartmentType(StrEnum):
    AGRICULTURE = "agriculture"
    MUNICIPAL = "municipal"
    SANITATION = "sanitation"
    TRANSPORT = "transport"
    MAINTENANCE = "maintenance"
    OTHER = "other"


class VehicleStatus(StrEnum):
    ACTIVE = "active"
    IDLE = "idle"
    IN_SERVICE = "in_service"
    OFFLINE = "offline"
    UNAVAILABLE = "unavailable"


class FuelType(StrEnum):
    DIESEL = "diesel"
    PETROL = "petrol"
    CNG = "cng"
    ELECTRIC = "electric"
    HYBRID = "hybrid"


class DriverStatus(StrEnum):
    ACTIVE = "active"
    RESTING = "resting"
    OFF_DUTY = "off_duty"
    UNAVAILABLE = "unavailable"


class TaskType(StrEnum):
    FIELD_WORK = "field_work"
    EQUIPMENT_DELIVERY = "equipment_delivery"
    MUNICIPAL_SERVICE = "municipal_service"
    ROAD_SERVICE = "road_service"
    TRANSPORT_SUPPORT = "transport_support"
    INSPECTION = "inspection"
    EMERGENCY = "emergency"
    OTHER = "other"


class TaskPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(StrEnum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AlertType(StrEnum):
    FUEL_ANOMALY = "fuel_anomaly"
    EXCESSIVE_IDLE = "excessive_idle"
    OVERDUE_SERVICE = "overdue_service"
    UNUSUAL_MOVEMENT = "unusual_movement"
    LOW_EFFICIENCY = "low_efficiency"


class AlertSeverity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(StrEnum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
