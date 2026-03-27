'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Vehicle, Task } from '@/types';
import { getVehicleTypeLabel, getStatusLabel } from '@/data/mockData';

// Vehicle type → emoji + color
const vehicleStyle: Record<string, { emoji: string; color: string }> = {
  traktor: { emoji: '🚜', color: '#4f46e5' },
  yuk_mashinasi: { emoji: '🚛', color: '#0ea5e9' },
  xizmat_avtomobili: { emoji: '🚗', color: '#10b981' },
  avtobus: { emoji: '🚌', color: '#f59e0b' },
  ekskovator: { emoji: '⛏️', color: '#8b5cf6' },
  "sug'orish_mashinasi": { emoji: '💧', color: '#06b6d4' },
};

// Status → Uzbek color
const statusColors: Record<string, string> = {
  faol: '#10b981',
  kutish: '#f59e0b',
  "ta'mirda": '#ef4444',
  "yo'lda": '#4f46e5',
  nomalum: '#94a3b8',
};

// Task priority → color
const priorityColors: Record<string, string> = {
  yuqori: '#ef4444',
  "o'rta": '#f59e0b',
  past: '#3b82f6',
};

function createVehicleIcon(type: string, status: string) {
  const style = vehicleStyle[type] || { emoji: '🚐', color: '#64748b' };
  const borderColor = statusColors[status] || '#94a3b8';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:#fff;border:3px solid ${borderColor};
      display:flex;align-items:center;justify-content:center;
      font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.2);
      cursor:pointer;transition:transform 0.2s;
    ">${style.emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createTaskIcon(priority: string) {
  const color = priorityColors[priority] || '#3b82f6';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:6px;
      background:${color};border:2px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.25);
      color:#fff;font-weight:700;
    ">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

interface FleetMapProps {
  vehicles: Vehicle[];
  tasks: Task[];
  height?: number;
}

export default function FleetMap({ vehicles, tasks, height = 420 }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [40.384, 71.789],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // Google hybrid (satellite + roads — accurate coordinates)
    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google',
      maxZoom: 20,
    }).addTo(map);

    // Build task lookup: vehicle_id → task
    const vehicleTaskMap = new Map<string, Task>();
    for (const task of tasks) {
      if (task.assigned_vehicle && task.lat && task.lng) {
        vehicleTaskMap.set(task.assigned_vehicle, task);
      }
    }

    // Route lines layer
    const routeLines: L.Polyline[] = [];

    // Add vehicle markers
    const activeVehicles = vehicles.filter(
      v => v.status === 'faol' || v.status === "yo'lda"
    );

    for (const vehicle of activeVehicles) {
      const { lat, lng } = vehicle.current_location;
      const icon = createVehicleIcon(vehicle.type, vehicle.status);

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Find assigned task
      const assignedTask = vehicleTaskMap.get(vehicle.id);

      // Popup content
      const taskInfo = assignedTask
        ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0">
            <div style="font-size:11px;color:#64748b;margin-bottom:2px">Vazifa</div>
            <div style="font-size:13px;font-weight:600;color:#1e293b">${assignedTask.title}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px">${assignedTask.region} · ${assignedTask.district}</div>
           </div>`
        : '<div style="margin-top:8px;font-size:11px;color:#94a3b8">Vazifa biriktirilmagan</div>';

      marker.bindPopup(`
        <div style="min-width:200px;font-family:system-ui,-apple-system,sans-serif">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="font-size:20px">${(vehicleStyle[vehicle.type] || { emoji: '🚐' }).emoji}</span>
            <div>
              <div style="font-size:14px;font-weight:700;color:#1e293b">${vehicle.internal_code}</div>
              <div style="font-size:11px;color:#64748b">${getVehicleTypeLabel(vehicle.type)}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
            <div>
              <span style="color:#94a3b8">Holat:</span>
              <span style="margin-left:4px;font-weight:600;color:${statusColors[vehicle.status] || '#64748b'}">${getStatusLabel(vehicle.status)}</span>
            </div>
            <div>
              <span style="color:#94a3b8">Yoqilg'i:</span>
              <span style="margin-left:4px;font-weight:600;color:#1e293b">${vehicle.fuel_level}%</span>
            </div>
            <div style="grid-column:1/-1">
              <span style="color:#94a3b8">Haydovchi:</span>
              <span style="margin-left:4px;font-weight:600;color:#1e293b">${vehicle.assigned_driver}</span>
            </div>
            <div>
              <span style="color:#94a3b8">Samaradorlik:</span>
              <span style="margin-left:4px;font-weight:600;color:#1e293b">${vehicle.efficiency_score}%</span>
            </div>
            <div>
              <span style="color:#94a3b8">Odometr:</span>
              <span style="margin-left:4px;font-weight:600;color:#1e293b">${vehicle.odometer.toLocaleString()} km</span>
            </div>
          </div>
          ${taskInfo}
        </div>
      `, { maxWidth: 280 });

      // Draw route line to assigned task
      if (assignedTask && assignedTask.lat && assignedTask.lng) {
        const routeColor = (vehicleStyle[vehicle.type] || { color: '#64748b' }).color;
        const line = L.polyline(
          [[lat, lng], [assignedTask.lat, assignedTask.lng]],
          {
            color: routeColor,
            weight: 2.5,
            opacity: 0.6,
            dashArray: '8, 6',
          }
        ).addTo(map);
        routeLines.push(line);
      }
    }

    // Add task destination markers
    for (const task of tasks) {
      if (!task.lat || !task.lng) continue;
      if (task.status === 'bajarildi' || task.status === 'bekor_qilindi') continue;

      const icon = createTaskIcon(task.priority);
      const marker = L.marker([task.lat, task.lng], { icon }).addTo(map);

      const priorityLabel = task.priority === 'yuqori' ? 'Yuqori' : task.priority === "o'rta" ? "O'rta" : 'Past';
      const priorityColor = priorityColors[task.priority] || '#3b82f6';
      const statusLabel = getStatusLabel(task.status);

      marker.bindPopup(`
        <div style="min-width:180px;font-family:system-ui,-apple-system,sans-serif">
          <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:4px">${task.title}</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:8px">${task.region} · ${task.district}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${priorityColor}22;color:${priorityColor};font-weight:600">${priorityLabel}</span>
            <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:#f1f5f9;color:#475569;font-weight:600">${statusLabel}</span>
          </div>
          ${task.assigned_vehicle_code
            ? `<div style="font-size:12px;color:#64748b">Transport: <span style="font-weight:600;color:#4f46e5">${task.assigned_vehicle_code}</span></div>`
            : '<div style="font-size:12px;color:#f59e0b;font-weight:500">Transport biriktirilmagan</div>'
          }
          <div style="font-size:11px;color:#94a3b8;margin-top:4px">${task.description}</div>
        </div>
      `, { maxWidth: 260 });
    }

    // Fit bounds to show all markers
    const allPoints: [number, number][] = [];
    for (const v of activeVehicles) {
      allPoints.push([v.current_location.lat, v.current_location.lng]);
    }
    for (const t of tasks) {
      if (t.lat && t.lng) allPoints.push([t.lat, t.lng]);
    }
    if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [30, 30] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [vehicles, tasks]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ height, width: '100%', borderRadius: 0 }} />
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: 11, display: 'flex', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%', display: 'inline-block', border: '2px solid #fff', boxShadow: '0 0 0 1px #10b981' }} /> Faol
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, background: '#4f46e5', borderRadius: '50%', display: 'inline-block', border: '2px solid #fff', boxShadow: '0 0 0 1px #4f46e5' }} /> Yo&apos;lda
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12 }}>📍</span> Vazifa
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 0, borderTop: '2px dashed #4f46e5', display: 'inline-block' }} /> Marshrut
        </div>
      </div>
    </div>
  );
}
