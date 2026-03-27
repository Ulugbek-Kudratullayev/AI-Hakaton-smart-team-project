"""
Extract real road network from OpenStreetMap for Fergana city.
Generates realistic vehicle routes along actual roads.
Outputs Python code for demo_data.py VEHICLE_ROUTES and frontend mapData.ts.
"""

import json
import random
import sys
from pathlib import Path

import networkx as nx
import osmnx as ox

# Fergana city bounding box
NORTH, SOUTH = 40.405, 40.360
EAST, WEST = 71.825, 71.750

print("[1/5] Downloading Fergana road network from OpenStreetMap...")
G = ox.graph_from_bbox(
    bbox=(WEST, SOUTH, EAST, NORTH),
    network_type="drive",
    simplify=True,
)
print(f"  Nodes: {G.number_of_nodes()}, Edges: {G.number_of_edges()}")

# Convert to undirected for easier routing
Gu = G.to_undirected()

# Get all nodes with coordinates
nodes = {}
for node_id, data in G.nodes(data=True):
    nodes[node_id] = (data["y"], data["x"])  # (lat, lng)

print("[2/5] Generating routes along real roads...")


def random_route(min_length=8, max_attempts=50):
    """Generate a random route through the road network."""
    for _ in range(max_attempts):
        src = random.choice(list(Gu.nodes))
        tgt = random.choice(list(Gu.nodes))
        if src == tgt:
            continue
        try:
            path = nx.shortest_path(Gu, src, tgt, weight="length")
            if len(path) >= min_length:
                return path
        except nx.NetworkXNoPath:
            continue
    return None


def path_to_waypoints(path, simplify_every=2):
    """Convert node path to list of (lat, lng) waypoints, simplified."""
    waypoints = []
    for i, node_id in enumerate(path):
        if i % simplify_every == 0 or i == len(path) - 1:
            lat, lng = nodes[node_id]
            waypoints.append((round(lat, 6), round(lng, 6)))
    return waypoints


# Generate 8 diverse routes
route_configs = [
    {"name": "Shimol-Janub asosiy ko'cha", "types": ["utility_truck", "municipal_vehicle"]},
    {"name": "Sharq-G'arb tranzit yo'li", "types": ["utility_truck", "water_tanker"]},
    {"name": "Markaziy bozor atrofi", "types": ["service_car", "municipal_vehicle"]},
    {"name": "Shimoliy turar-joy massivi", "types": ["utility_truck", "tractor"]},
    {"name": "Janubiy sanoat hududi", "types": ["loader", "utility_truck"]},
    {"name": "Sharqiy tuman marshruti", "types": ["municipal_vehicle", "service_car"]},
    {"name": "G'arbiy halqa yo'l", "types": ["water_tanker", "utility_truck"]},
    {"name": "Markaz-Shimol diagonal", "types": ["service_car", "tractor"]},
]

generated_routes = []
for cfg in route_configs:
    path = random_route(min_length=10)
    if path:
        waypoints = path_to_waypoints(path, simplify_every=2)
        generated_routes.append({
            "name": cfg["name"],
            "vehicle_types": cfg["types"],
            "waypoints": waypoints,
        })
        print(f"  Route '{cfg['name']}': {len(waypoints)} waypoints")
    else:
        print(f"  WARNING: Could not generate route for '{cfg['name']}'")

print(f"[3/5] Generated {len(generated_routes)} routes")

# === Output for backend demo_data.py ===
print("[4/5] Writing backend route data...")

backend_output = Path(__file__).parent.parent / "app" / "utils" / "fergana_routes.json"
backend_data = []
for r in generated_routes:
    backend_data.append({
        "name": r["name"],
        "vehicle_types": r["vehicle_types"],
        "waypoints": r["waypoints"],
    })

with open(backend_output, "w", encoding="utf-8") as f:
    json.dump(backend_data, f, ensure_ascii=False, indent=2)
print(f"  Saved: {backend_output}")

# === Output for frontend mapData.ts ===
print("[5/5] Writing frontend route data...")

frontend_output = Path(__file__).parent.parent.parent / "frontend" / "src" / "data" / "ferganaRoutes.json"
vehicle_codes = ["YM-002", "YM-008", "YM-014", "YM-020", "YM-022", "XA-003", "TR-001", "AV-004"]
vehicle_ids = ["v-002", "v-008", "v-014", "v-020", "v-022", "v-003", "v-001", "v-004"]
colors = ["#ef4444", "#f97316", "#8b5cf6", "#0ea5e9", "#10b981", "#4f46e5", "#f59e0b", "#06b6d4"]

frontend_data = []
for i, r in enumerate(generated_routes):
    frontend_data.append({
        "vehicleId": vehicle_ids[i % len(vehicle_ids)],
        "vehicleCode": vehicle_codes[i % len(vehicle_codes)],
        "routeName": r["name"],
        "color": colors[i % len(colors)],
        "waypoints": r["waypoints"],
    })

with open(frontend_output, "w", encoding="utf-8") as f:
    json.dump(frontend_data, f, ensure_ascii=False, indent=2)
print(f"  Saved: {frontend_output}")

# === Print Python code for demo_data.py ===
print("\n=== Copy this to demo_data.py VEHICLE_ROUTES ===\n")
print("VEHICLE_ROUTES = [")
for r in generated_routes:
    types_str = ", ".join(f'VehicleType.{t.upper()}' for t in r["vehicle_types"])
    print(f'    {{')
    print(f'        "name": "{r["name"]}",')
    print(f'        "vehicle_types": [{types_str}],')
    print(f'        "waypoints": [')
    for wp in r["waypoints"]:
        print(f'            ({wp[0]}, {wp[1]}),')
    print(f'        ],')
    print(f'    }},')
print("]")

print(f"\nDone! {len(generated_routes)} real road routes extracted from OSM.")
