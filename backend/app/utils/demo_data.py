import json
from pathlib import Path

from app.models.enums import DepartmentType, FuelType, TaskType, VehicleType


# All locations within Farg'ona shahri (Fergana city)
UZBEKISTAN_LOCATIONS = [
    {"region": "Farg'ona", "district": "Markaz", "location_name": "Farg'ona shahar markazi", "lat": 40.3842, "lng": 71.7891},
    {"region": "Farg'ona", "district": "Shimoliy tuman", "location_name": "Shimoliy turar-joy massivi", "lat": 40.3960, "lng": 71.7850},
    {"region": "Farg'ona", "district": "Janubiy tuman", "location_name": "Janubiy sanoat hududi", "lat": 40.3680, "lng": 71.7780},
    {"region": "Farg'ona", "district": "Sharqiy tuman", "location_name": "Sharqiy turar-joy massivi", "lat": 40.3820, "lng": 71.8100},
    {"region": "Farg'ona", "district": "G'arbiy tuman", "location_name": "G'arbiy bozor atrofi", "lat": 40.3840, "lng": 71.7600},
    {"region": "Farg'ona", "district": "Markaz", "location_name": "Ahmad al-Farg'oniy bog'i", "lat": 40.3850, "lng": 71.7880},
    {"region": "Farg'ona", "district": "Shimoliy-sharq", "location_name": "Tibbiyot instituti hududi", "lat": 40.3920, "lng": 71.8080},
    {"region": "Farg'ona", "district": "Janubiy-g'arb", "location_name": "Xizmat ko'rsatish bazasi", "lat": 40.3700, "lng": 71.7620},
    {"region": "Farg'ona", "district": "Markaz", "location_name": "Markaziy bozor", "lat": 40.3835, "lng": 71.7840},
    {"region": "Farg'ona", "district": "Shimoliy", "location_name": "Shimoliy bog' massivi", "lat": 40.3980, "lng": 71.7900},
]

DRIVER_NAMES = [
    "Bekzod Karimov", "Shahzod Ergashev", "Jasur Rakhmonov", "Dilshod Tursunov", "Ulugbek Mamatov",
    "Oybek Xudoyberdiyev", "Azizbek Ismoilov", "Sardor Fayziyev", "Alisher Sattorov", "Murodjon Yusupov",
    "Sarvar Kadirov", "Rustam Ruziev", "Doston Normatov", "Komil Abdullayev", "Jamshid Xasanov",
    "Shukhrat Qobilov", "Asilbek Rafiqov", "Bobur Shomurodov",
]

VEHICLE_TEMPLATES = [
    (VehicleType.TRACTOR, DepartmentType.AGRICULTURE, FuelType.DIESEL, "Belarus 82.1", 130),
    (VehicleType.TRACTOR, DepartmentType.AGRICULTURE, FuelType.DIESEL, "CASE Farmall 95", 140),
    (VehicleType.UTILITY_TRUCK, DepartmentType.TRANSPORT, FuelType.DIESEL, "Isuzu NQR 71", 100),
    (VehicleType.SERVICE_CAR, DepartmentType.MAINTENANCE, FuelType.PETROL, "Chevrolet Cobalt Service", 45),
    (VehicleType.MUNICIPAL_VEHICLE, DepartmentType.MUNICIPAL, FuelType.CNG, "MAN StreetCare", 160),
    (VehicleType.WATER_TANKER, DepartmentType.MUNICIPAL, FuelType.DIESEL, "KamAZ Water Tanker", 210),
    (VehicleType.LOADER, DepartmentType.SANITATION, FuelType.DIESEL, "XCMG Loader LW300", 190),
    (VehicleType.UTILITY_TRUCK, DepartmentType.MUNICIPAL, FuelType.DIESEL, "GAZ Next Utility", 90),
]

# Simulation routes — loaded from OSM-extracted real road data
_ROUTES_FILE = Path(__file__).parent / "fergana_routes.json"

_TYPE_MAP = {
    "utility_truck": VehicleType.UTILITY_TRUCK,
    "municipal_vehicle": VehicleType.MUNICIPAL_VEHICLE,
    "service_car": VehicleType.SERVICE_CAR,
    "tractor": VehicleType.TRACTOR,
    "water_tanker": VehicleType.WATER_TANKER,
    "loader": VehicleType.LOADER,
}


def _load_routes():
    if _ROUTES_FILE.exists():
        with open(_ROUTES_FILE, encoding="utf-8") as f:
            raw = json.load(f)
        routes = []
        for r in raw:
            routes.append({
                "name": r["name"],
                "vehicle_types": [_TYPE_MAP.get(t, VehicleType.UTILITY_TRUCK) for t in r["vehicle_types"]],
                "waypoints": [tuple(wp) for wp in r["waypoints"]],
            })
        return routes
    # Fallback if JSON not found
    return [
        {"name": "Default", "vehicle_types": [VehicleType.UTILITY_TRUCK],
         "waypoints": [(40.384, 71.789), (40.390, 71.795), (40.396, 71.800)]},
    ]


VEHICLE_ROUTES = _load_routes()


TASK_TEMPLATES = {
    TaskType.FIELD_WORK: ["Canal-side soil prep", "Cotton field support", "Spring tillage support"],
    TaskType.EQUIPMENT_DELIVERY: ["Pump delivery", "Spare part transport", "Seed drill relocation"],
    TaskType.MUNICIPAL_SERVICE: ["Street cleaning support", "Drain clearing", "District utility patrol"],
    TaskType.ROAD_SERVICE: ["Road shoulder grading", "Pothole supply run", "Winter service standby"],
    TaskType.TRANSPORT_SUPPORT: ["Inter-department transport", "Fuel delivery escort", "Material transfer"],
    TaskType.INSPECTION: ["Fleet inspection", "Field inspection route", "District audit visit"],
    TaskType.EMERGENCY: ["Flood response", "Water tanker dispatch", "Breakdown support"],
}
