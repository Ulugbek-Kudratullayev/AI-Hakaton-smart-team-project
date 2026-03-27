'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Vehicle, Task } from '@/types';
import type { VehicleRoute, ServiceZone } from '@/data/mapData';
import { getVehicleTypeLabel, getStatusLabel } from '@/data/mockData';
import { serviceZones as allServiceZones } from '@/data/mapData';

const vehicleStyle: Record<string, { emoji: string; color: string }> = {
  traktor: { emoji: '\u{1F69C}', color: '#4f46e5' },
  yuk_mashinasi: { emoji: '\u{1F69B}', color: '#0ea5e9' },
  xizmat_avtomobili: { emoji: '\u{1F697}', color: '#10b981' },
  avtobus: { emoji: '\u{1F68C}', color: '#f59e0b' },
  ekskovator: { emoji: '\u26CF\uFE0F', color: '#8b5cf6' },
  "sug'orish_mashinasi": { emoji: '\u{1F4A7}', color: '#06b6d4' },
};

const statusColors: Record<string, string> = {
  faol: '#10b981', kutish: '#f59e0b', "ta'mirda": '#ef4444', "yo'lda": '#4f46e5', nomalum: '#94a3b8',
};

const priorityColors: Record<string, string> = {
  yuqori: '#ef4444', "o'rta": '#f59e0b', past: '#3b82f6',
};

function createVehicleIcon(type: string, status: string, isSelected: boolean) {
  const style = vehicleStyle[type] || { emoji: '\u{1F690}', color: '#64748b' };
  const borderColor = isSelected ? '#4f46e5' : (statusColors[status] || '#94a3b8');
  const size = isSelected ? 44 : 38;
  const fontSize = isSelected ? 22 : 19;
  const shadow = isSelected
    ? 'box-shadow:0 0 0 4px rgba(79,70,229,0.3),0 4px 12px rgba(0,0,0,0.3);'
    : 'box-shadow:0 2px 8px rgba(0,0,0,0.2);';
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#fff;border:3px solid ${borderColor};display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;${shadow}cursor:pointer;transition:all 0.2s;">${style.emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createTaskIcon(priority: string) {
  const color = priorityColors[priority] || '#3b82f6';
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:6px;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.25);color:#fff;font-weight:700;">\u{1F4CD}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  });
}

function buildVehiclePopup(vehicle: Vehicle, assignedTask: Task | undefined) {
  const vehicleZone = allServiceZones.find(z => z.vehicleId === vehicle.id);
  const zoneInfo = vehicleZone
    ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0"><div style="font-size:11px;color:#64748b;margin-bottom:2px">Xizmat hududi</div><div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:${vehicleZone.color}33;border:2px solid ${vehicleZone.color};display:inline-block"></span><span style="font-size:13px;font-weight:600;color:#1e293b">${vehicleZone.zoneName}</span></div></div>` : '';
  const taskInfo = assignedTask
    ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0"><div style="font-size:11px;color:#64748b;margin-bottom:2px">Joriy vazifa</div><div style="font-size:13px;font-weight:600;color:#1e293b">${assignedTask.title}</div><div style="font-size:11px;color:#64748b;margin-top:2px">${assignedTask.region} · ${assignedTask.district}</div></div>` : '';
  return `<div style="min-width:220px;font-family:system-ui,-apple-system,sans-serif"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:24px">${(vehicleStyle[vehicle.type] || { emoji: '\u{1F690}' }).emoji}</span><div><div style="font-size:15px;font-weight:700;color:#1e293b">${vehicle.internal_code}</div><div style="font-size:11px;color:#64748b">${getVehicleTypeLabel(vehicle.type)} · ${vehicle.model}</div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px"><div><div style="color:#94a3b8;font-size:10px">Holat</div><div style="font-weight:600;color:${statusColors[vehicle.status] || '#64748b'}">${getStatusLabel(vehicle.status)}</div></div><div><div style="color:#94a3b8;font-size:10px">Yoqilg'i</div><div style="font-weight:600;color:#1e293b">${vehicle.fuel_level}%</div></div><div><div style="color:#94a3b8;font-size:10px">Haydovchi</div><div style="font-weight:600;color:#1e293b">${vehicle.assigned_driver}</div></div><div><div style="color:#94a3b8;font-size:10px">Samaradorlik</div><div style="font-weight:600;color:#1e293b">${vehicle.efficiency_score}%</div></div><div><div style="color:#94a3b8;font-size:10px">Odometr</div><div style="font-weight:600;color:#1e293b">${vehicle.odometer.toLocaleString()} km</div></div><div><div style="color:#94a3b8;font-size:10px">Raqam</div><div style="font-weight:600;color:#1e293b">${vehicle.plate_number}</div></div></div>${taskInfo}${zoneInfo}</div>`;
}

interface FullMapViewProps {
  vehicles: Vehicle[];
  tasks: Task[];
  routes: VehicleRoute[];
  zones: ServiceZone[];
  selectedVehicleId: string | null;
  onVehicleSelect: (id: string | null) => void;
}

export default function FullMapView({
  vehicles, tasks, routes, zones, selectedVehicleId, onVehicleSelect,
}: FullMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const initDoneRef = useRef(false);
  const onVehicleSelectRef = useRef(onVehicleSelect);
  onVehicleSelectRef.current = onVehicleSelect;

  // === 1. Create map ONCE ===
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [40.384, 71.789],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { attribution: '&copy; Google', maxZoom: 20 });
    const googleRoads = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { attribution: '&copy; Google', maxZoom: 20 });
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM', maxZoom: 18 });

    googleHybrid.addTo(map);
    L.control.layers({
      'Google Gibrid': googleHybrid,
      'Google Xarita': googleRoads,
      'OpenStreetMap': osm,
    }, {}, { position: 'topright' }).addTo(map);

    overlayGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      vehicleMarkersRef.current.clear();
      initDoneRef.current = false;
    };
  }, []);

  // === 2. Draw static overlays (routes, zones, tasks) — only when they change ===
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = overlayGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Service zones
    for (const zone of zones) {
      const poly = L.polygon(zone.polygon, {
        color: zone.color, weight: 2, opacity: 0.7,
        fillColor: zone.color, fillOpacity: 0.12, dashArray: '6, 4',
      });
      poly.bindTooltip(`<b>${zone.zoneName}</b><br/><span style="color:${zone.color}">${zone.vehicleCode}</span>`, { sticky: true, direction: 'top' });
      group.addLayer(poly);
    }

    // Waste routes
    for (const route of routes) {
      group.addLayer(L.polyline(route.waypoints, { color: route.color, weight: 5, opacity: 0.5, lineJoin: 'round', lineCap: 'round' }));
      const dashed = L.polyline(route.waypoints, { color: route.color, weight: 3, opacity: 0.9, dashArray: '10, 8', lineJoin: 'round', lineCap: 'round' });
      dashed.bindTooltip(`<b>${route.routeName}</b><br/><span style="color:${route.color};font-weight:600">${route.vehicleCode}</span> <span style="color:#64748b">Chiqindi marshruti</span>`, { sticky: true, direction: 'top' });
      group.addLayer(dashed);
      for (let i = 0; i < route.waypoints.length; i++) {
        const isEnd = i === 0 || i === route.waypoints.length - 1;
        group.addLayer(L.circleMarker(route.waypoints[i], { radius: isEnd ? 5 : 3, color: route.color, fillColor: isEnd ? route.color : '#fff', fillOpacity: 1, weight: 2 }));
      }
    }

    // Task markers
    for (const task of tasks) {
      if (!task.lat || !task.lng || task.status === 'bajarildi' || task.status === 'bekor_qilindi') continue;
      const icon = createTaskIcon(task.priority);
      const marker = L.marker([task.lat, task.lng], { icon });
      const pColor = priorityColors[task.priority] || '#3b82f6';
      const pLabel = task.priority === 'yuqori' ? 'Yuqori' : task.priority === "o'rta" ? "O'rta" : 'Past';
      marker.bindPopup(`<div style="min-width:200px;font-family:system-ui"><div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:4px">${task.title}</div><div style="font-size:12px;color:#64748b;margin-bottom:6px">${task.region} · ${task.district}</div><div style="display:flex;gap:6px;margin-bottom:6px"><span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${pColor}22;color:${pColor};font-weight:600">${pLabel}</span><span style="font-size:10px;padding:2px 8px;border-radius:10px;background:#f1f5f9;color:#475569;font-weight:600">${getStatusLabel(task.status)}</span></div>${task.assigned_vehicle_code ? `<div style="font-size:12px;color:#64748b">Transport: <b style="color:#4f46e5">${task.assigned_vehicle_code}</b></div>` : '<div style="font-size:12px;color:#f59e0b;font-weight:500">Transport biriktirilmagan</div>'}<div style="font-size:11px;color:#94a3b8;margin-top:4px">${task.description}</div></div>`, { maxWidth: 280 });
      group.addLayer(marker);
    }
  }, [tasks, routes, zones]);

  // === 3. Update vehicle markers in-place (no map recreation) ===
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const existingMarkers = vehicleMarkersRef.current;
    const vehicleTaskMap = new Map<string, Task>();
    for (const task of tasks) {
      if (task.assigned_vehicle && task.lat && task.lng) {
        vehicleTaskMap.set(task.assigned_vehicle, task);
      }
    }

    const currentIds = new Set(vehicles.map(v => v.id));

    // Remove markers for vehicles no longer in the list
    for (const [id, marker] of existingMarkers) {
      if (!currentIds.has(id)) {
        map.removeLayer(marker);
        existingMarkers.delete(id);
      }
    }

    // Fit bounds only on first load
    if (!initDoneRef.current && vehicles.length > 0) {
      const points: [number, number][] = vehicles.map(v => [v.current_location.lat, v.current_location.lng]);
      if (points.length > 0) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
      }
      initDoneRef.current = true;
    }

    for (const vehicle of vehicles) {
      const { lat, lng } = vehicle.current_location;
      const isSelected = vehicle.id === selectedVehicleId;
      const existing = existingMarkers.get(vehicle.id);

      if (existing) {
        // Smoothly move existing marker
        existing.setLatLng([lat, lng]);
        existing.setIcon(createVehicleIcon(vehicle.type, vehicle.status, isSelected));
        existing.setZIndexOffset(isSelected ? 1000 : 0);
        // Update popup content
        const assignedTask = vehicleTaskMap.get(vehicle.id);
        existing.setPopupContent(buildVehiclePopup(vehicle, assignedTask));
      } else {
        // Create new marker
        const icon = createVehicleIcon(vehicle.type, vehicle.status, isSelected);
        const marker = L.marker([lat, lng], { icon, zIndexOffset: isSelected ? 1000 : 0 }).addTo(map);
        const assignedTask = vehicleTaskMap.get(vehicle.id);
        marker.bindPopup(buildVehiclePopup(vehicle, assignedTask), { maxWidth: 300 });
        marker.on('click', () => onVehicleSelectRef.current(vehicle.id));
        existingMarkers.set(vehicle.id, marker);
      }
    }
  }, [vehicles, selectedVehicleId, tasks]);

  // === 4. Pan to selected vehicle ===
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVehicleId) return;

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) return;

    map.setView([vehicle.current_location.lat, vehicle.current_location.lng], map.getZoom(), { animate: true });

    const marker = vehicleMarkersRef.current.get(selectedVehicleId);
    if (marker) {
      setTimeout(() => marker.openPopup(), 300);
    }

    // Highlight selected vehicle's zone
    const selectedZone = allServiceZones.find(z => z.vehicleId === selectedVehicleId);
    if (selectedZone) {
      const poly = L.polygon(selectedZone.polygon, {
        color: selectedZone.color, weight: 3, opacity: 1,
        fillColor: selectedZone.color, fillOpacity: 0.25,
      }).addTo(map);
      // Remove highlight after 5 seconds
      setTimeout(() => map.removeLayer(poly), 5000);
    }
  }, [selectedVehicleId]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
        background: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: 11,
      }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: '#1e293b', marginBottom: 6 }}>Belgilar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%', display: 'inline-block', border: '2px solid #fff', boxShadow: '0 0 0 1px #10b981' }} />
            <span style={{ color: '#475569' }}>Faol transport</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, background: '#f59e0b', borderRadius: '50%', display: 'inline-block', border: '2px solid #fff', boxShadow: '0 0 0 1px #f59e0b' }} />
            <span style={{ color: '#475569' }}>Kutish</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 20, height: 0, borderTop: '3px solid #ef4444', display: 'inline-block', borderRadius: 2 }} />
            <span style={{ color: '#475569' }}>Chiqindi marshruti</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, background: '#4f46e522', border: '2px dashed #4f46e5', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ color: '#475569' }}>Xizmat hududi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12 }}>{'\u{1F4CD}'}</span>
            <span style={{ color: '#475569' }}>Vazifa manzili</span>
          </div>
        </div>
      </div>

      {selectedVehicleId && (
        <div style={{
          position: 'absolute', top: 16, right: 60, zIndex: 1000,
          background: '#fff', borderRadius: 12, padding: '6px 12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 8, color: '#4f46e5', fontWeight: 600,
        }}>
          Tanlangan transport
          <button onClick={() => onVehicleSelect(null)} style={{
            background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '2px 6px',
            cursor: 'pointer', color: '#64748b', fontSize: 11,
          }}>
            Bekor qilish
          </button>
        </div>
      )}
    </div>
  );
}
