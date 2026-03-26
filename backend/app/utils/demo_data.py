from app.models.enums import DepartmentType, FuelType, TaskType, VehicleType


UZBEKISTAN_LOCATIONS = [
    {"region": "Tashkent", "district": "Yangihayot", "location_name": "Sergeli irrigation line", "lat": 41.2265, "lng": 69.1901},
    {"region": "Tashkent", "district": "Bektemir", "location_name": "Bektemir service depot", "lat": 41.2091, "lng": 69.3358},
    {"region": "Samarkand", "district": "Pastdargom", "location_name": "Pastdargom cotton cluster", "lat": 39.6729, "lng": 66.7560},
    {"region": "Bukhara", "district": "Gijduvon", "location_name": "Gijduvon water pumping station", "lat": 40.1000, "lng": 64.6833},
    {"region": "Fergana", "district": "Qo'qon", "location_name": "Qo'qon municipal equipment yard", "lat": 40.5286, "lng": 70.9425},
    {"region": "Andijan", "district": "Asaka", "location_name": "Asaka road maintenance point", "lat": 40.6415, "lng": 72.2387},
    {"region": "Namangan", "district": "Chortoq", "location_name": "Chortoq field service sector", "lat": 41.0692, "lng": 71.8237},
    {"region": "Jizzakh", "district": "Zomin", "location_name": "Zomin district machinery yard", "lat": 39.9606, "lng": 68.3950},
    {"region": "Surkhandarya", "district": "Termiz", "location_name": "Termiz logistics base", "lat": 37.2242, "lng": 67.2783},
    {"region": "Khorezm", "district": "Urganch", "location_name": "Urganch utility response center", "lat": 41.5534, "lng": 60.6310},
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

TASK_TEMPLATES = {
    TaskType.FIELD_WORK: ["Canal-side soil prep", "Cotton field support", "Spring tillage support"],
    TaskType.EQUIPMENT_DELIVERY: ["Pump delivery", "Spare part transport", "Seed drill relocation"],
    TaskType.MUNICIPAL_SERVICE: ["Street cleaning support", "Drain clearing", "District utility patrol"],
    TaskType.ROAD_SERVICE: ["Road shoulder grading", "Pothole supply run", "Winter service standby"],
    TaskType.TRANSPORT_SUPPORT: ["Inter-department transport", "Fuel delivery escort", "Material transfer"],
    TaskType.INSPECTION: ["Fleet inspection", "Field inspection route", "District audit visit"],
    TaskType.EMERGENCY: ["Flood response", "Water tanker dispatch", "Breakdown support"],
}
