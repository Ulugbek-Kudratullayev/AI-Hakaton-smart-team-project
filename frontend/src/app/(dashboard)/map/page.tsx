'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Layers, Navigation, Play, Pause, FastForward, RotateCcw, Radio } from 'lucide-react';
import {
  getVehicleTypeLabel,
  getStatusLabel,
} from '@/data/mockData';
import { wasteRoutes, serviceZones } from '@/data/mapData';
import { loadVehicles, loadTasks } from '@/lib/loaders';
import { api } from '@/lib/api';
import type { Vehicle, Task } from '@/types';

const FullMapView = dynamic(() => import('@/components/ui/FullMapView'), { ssr: false });

const vehicleTypeOptions = [
  { value: 'all', label: 'Barcha turlar' },
  { value: 'traktor', label: 'Traktor' },
  { value: 'yuk_mashinasi', label: 'Yuk mashinasi' },
  { value: 'xizmat_avtomobili', label: 'Xizmat avtomobili' },
  { value: 'avtobus', label: 'Avtobus' },
  { value: 'ekskovator', label: 'Ekskovator' },
  { value: "sug'orish_mashinasi", label: "Sug'orish mashinasi" },
];

const statusOptions = [
  { value: 'all', label: 'Barcha holatlar' },
  { value: 'faol', label: 'Faol' },
  { value: "yo'lda", label: "Yo'lda" },
  { value: 'kutish', label: 'Kutish' },
  { value: "ta'mirda", label: "Ta'mirda" },
];

// Map backend status to frontend
const statusMap: Record<string, string> = {
  active: 'faol', idle: 'kutish', in_service: "ta'mirda", offline: 'kutish', unavailable: "ta'mirda",
};

export default function MapPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRoutes, setShowRoutes] = useState(true);
  const [showZones, setShowZones] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial data load
  useEffect(() => {
    loadVehicles().then(res => setVehicles(res.data));
    loadTasks().then(res => setTasks(res.data));
  }, []);

  // Live position polling
  useEffect(() => {
    async function poll() {
      try {
        const positions = await api.getLivePositions();
        setIsLive(true);
        setVehicles(prev => {
          const updated = prev.map(v => {
            const pos = positions.find(p => p.internal_code === v.internal_code);
            if (pos) {
              return {
                ...v,
                current_location: { lat: pos.lat, lng: pos.lng },
                status: (statusMap[pos.status] || v.status) as Vehicle['status'],
                fuel_level: Math.round(pos.fuel_level),
                odometer: Math.round(pos.odometer),
              };
            }
            return v;
          });
          // Add mobile vehicles (MOB-xxx) not in the existing list
          const existingCodes = new Set(updated.map(v => v.internal_code));
          for (const pos of positions) {
            if (!existingCodes.has(pos.internal_code)) {
              updated.push({
                id: `mob-${pos.vehicle_id}`,
                internal_code: pos.internal_code,
                plate_number: pos.internal_code,
                type: (pos.vehicle_type === 'service_car' ? 'xizmat_avtomobili' : pos.vehicle_type === 'tractor' ? 'traktor' : pos.vehicle_type === 'utility_truck' ? 'yuk_mashinasi' : pos.vehicle_type === 'municipal_vehicle' ? 'avtobus' : pos.vehicle_type === 'water_tanker' ? "sug'orish_mashinasi" : pos.vehicle_type === 'loader' ? 'ekskovator' : 'xizmat_avtomobili') as Vehicle['type'],
                department: 'GPS',
                status: (statusMap[pos.status] || 'faol') as Vehicle['status'],
                assigned_driver: 'Mobil haydovchi',
                current_location: { lat: pos.lat, lng: pos.lng },
                odometer: Math.round(pos.odometer),
                efficiency_score: 0,
                maintenance_risk: 0,
                anomaly_count: 0,
                fuel_level: Math.round(pos.fuel_level),
                last_service: '',
                next_service: '',
                year: 2024,
                model: 'GPS Tracker',
              });
            }
          }
          return updated;
        });
      } catch {
        setIsLive(false);
      }
    }

    poll(); // immediate
    pollRef.current = setInterval(poll, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleSimControl = async (action: string) => {
    try {
      const result = await api.controlSimulation(action);
      if (action === 'speed_up') setSimSpeed(s => Math.min(10, s * 2));
      if (action === 'slow_down') setSimSpeed(s => Math.max(1, s / 2));
    } catch {}
  };

  const filtered = vehicles.filter(v => {
    if (typeFilter !== 'all' && v.type !== typeFilter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const activeCount = filtered.filter(v => v.status === 'faol' || v.status === "yo'lda").length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', gap: 0 }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={20} color="#4f46e5" />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Transport xaritasi</h1>
          {/* LIVE indicator */}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
            background: isLive ? '#ecfdf5' : '#fef2f2',
            color: isLive ? '#059669' : '#dc2626',
            border: `1px solid ${isLive ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Radio size={10} style={isLive ? { animation: 'pulse 1.5s infinite' } : {}} />
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: '#eef2ff', color: '#4f46e5' }}>
            {activeCount} faol / {filtered.length} jami
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Simulation controls */}
          <div style={{ display: 'flex', gap: 2, marginRight: 8 }}>
            <button onClick={() => handleSimControl('pause')} title="Pauza" style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Pause size={12} />
            </button>
            <button onClick={() => handleSimControl('resume')} title="Davom" style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Play size={12} />
            </button>
            <button onClick={() => handleSimControl('speed_up')} title="Tezlashtirish" style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <FastForward size={12} />
            </button>
            <button onClick={() => handleSimControl('reset')} title="Qayta boshlash" style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Filters */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
            fontSize: 12, padding: '6px 28px 6px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#fff', color: '#334155', cursor: 'pointer', appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
          }}>
            {vehicleTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
            fontSize: 12, padding: '6px 28px 6px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#fff', color: '#334155', cursor: 'pointer', appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
          }}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Layer toggles */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
            {([
              { key: 'routes', show: showRoutes, set: setShowRoutes, icon: Navigation, label: 'Marshrutlar' },
              { key: 'zones', show: showZones, set: setShowZones, icon: Layers, label: 'Hududlar' },
              { key: 'tasks', show: showTasks, set: setShowTasks, icon: MapPin, label: 'Vazifalar' },
            ] as const).map(btn => (
              <button key={btn.key} onClick={() => btn.set((v: boolean) => !v)} style={{
                fontSize: 11, padding: '6px 12px', borderRadius: 8, border: '1px solid',
                borderColor: btn.show ? '#4f46e5' : '#e2e8f0',
                background: btn.show ? '#eef2ff' : '#fff',
                color: btn.show ? '#4f46e5' : '#64748b',
                cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <btn.icon size={12} /> {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map + sidebar */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Vehicle list sidebar */}
        <div style={{ width: 280, minWidth: 280, background: '#fff', borderRight: '1px solid #e2e8f0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="max-md:hidden">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
            Transportlar ({filtered.length})
          </div>
          {filtered.map(v => {
            const isSelected = selectedVehicleId === v.id;
            const statusColor = v.status === 'faol' ? '#10b981' : v.status === "yo'lda" ? '#4f46e5' : v.status === 'kutish' ? '#f59e0b' : '#ef4444';
            const typeEmoji: Record<string, string> = {
              traktor: '\u{1F69C}', yuk_mashinasi: '\u{1F69B}', xizmat_avtomobili: '\u{1F697}',
              avtobus: '\u{1F68C}', ekskovator: '\u26CF\uFE0F', "sug'orish_mashinasi": '\u{1F4A7}',
            };
            return (
              <div key={v.id} onClick={() => setSelectedVehicleId(isSelected ? null : v.id)} style={{
                padding: '10px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                background: isSelected ? '#eef2ff' : 'transparent',
                borderLeft: isSelected ? '3px solid #4f46e5' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{typeEmoji[v.type] || '\u{1F690}'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{v.internal_code}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{v.assigned_driver}</div>
                  </div>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: `0 0 0 2px ${statusColor}33` }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 10, color: '#94a3b8' }}>
                  <span>{getVehicleTypeLabel(v.type)}</span>
                  <span>·</span>
                  <span style={{ color: statusColor, fontWeight: 600 }}>{getStatusLabel(v.status)}</span>
                  <span>·</span>
                  <span>{v.fuel_level}% yoqilg&apos;i</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <FullMapView
            vehicles={filtered}
            tasks={showTasks ? tasks : []}
            routes={showRoutes ? wasteRoutes : []}
            zones={showZones ? serviceZones : []}
            selectedVehicleId={selectedVehicleId}
            onVehicleSelect={setSelectedVehicleId}
          />
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
    </div>
  );
}
