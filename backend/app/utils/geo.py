import math


def haversine_km(lat1: float | None, lng1: float | None, lat2: float | None, lng2: float | None) -> float:
    if None in (lat1, lng1, lat2, lng2):
        return 999.0
    radius = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius * c
