'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Truck, Route, MapPinned,
  Search, Save, Loader2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { getVehicleTypeLabel } from '@/data/mockData';
import { api, ApiVehicle, ApiRoute, ApiZone } from '@/lib/api';
import { loadVehicles } from '@/lib/loaders';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { ssr: false });
import type { Vehicle } from '@/types';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';

type Tab = 'vehicles' | 'routes' | 'zones';

// Backend enum maps
const vehicleTypeToBackend: Record<string, string> = {
  traktor: 'tractor', yuk_mashinasi: 'utility_truck', xizmat_avtomobili: 'service_car',
  avtobus: 'municipal_vehicle', ekskovator: 'loader', "sug'orish_mashinasi": 'water_tanker',
};
const vehicleTypeFromBackend: Record<string, string> = Object.fromEntries(
  Object.entries(vehicleTypeToBackend).map(([k, v]) => [v, k])
);
const deptToBackend: Record<string, string> = {
  "Qishloq xo'jaligi bo'limi": 'agriculture', "Kommunal xo'jalik bo'limi": 'municipal',
  "Yo'l-transport bo'limi": 'transport', "Ekologiya bo'limi": 'sanitation', "Qurilish bo'limi": 'maintenance',
};
const deptFromBackend: Record<string, string> = Object.fromEntries(
  Object.entries(deptToBackend).map(([k, v]) => [v, k])
);
const statusToBackend: Record<string, string> = {
  faol: 'active', kutish: 'idle', "ta'mirda": 'in_service', "yo'lda": 'active',
};
const statusFromBackend: Record<string, string> = {
  active: 'faol', idle: 'kutish', in_service: "ta'mirda", offline: 'kutish', unavailable: "ta'mirda",
};

const typeOptions: { value: string; label: string; prefix: string }[] = [
  { value: 'traktor', label: 'Traktor', prefix: 'TR' },
  { value: 'yuk_mashinasi', label: 'Yuk mashinasi', prefix: 'YM' },
  { value: 'xizmat_avtomobili', label: 'Xizmat avtomobili', prefix: 'XA' },
  { value: 'avtobus', label: 'Avtobus', prefix: 'AV' },
  { value: 'ekskovator', label: 'Ekskovator', prefix: 'EK' },
  { value: "sug'orish_mashinasi", label: "Sug'orish mashinasi", prefix: 'SM' },
];

const statusOptions = [
  { value: 'faol', label: 'Faol' },
  { value: 'kutish', label: 'Kutish' },
  { value: "ta'mirda", label: "Ta'mirda" },
  { value: "yo'lda", label: "Yo'lda" },
];

const departments = [
  "Qishloq xo'jaligi bo'limi", "Kommunal xo'jalik bo'limi",
  "Yo'l-transport bo'limi", "Ekologiya bo'limi", "Qurilish bo'limi",
];

const colorPresets = [
  { value: '#ef4444', label: 'Qizil' }, { value: '#f97316', label: "To'q sariq" },
  { value: '#f59e0b', label: 'Sariq' }, { value: '#10b981', label: 'Yashil' },
  { value: '#0ea5e9', label: "Ko'k" }, { value: '#4f46e5', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Binafsha' }, { value: '#ec4899', label: 'Pushti' },
];

// Route/Zone with API id
interface ManagedRoute {
  apiId: number | null;
  vehicleId: number;
  vehicleCode: string;
  routeName: string;
  color: string;
  waypoints: [number, number][];
}

interface ManagedZone {
  apiId: number | null;
  vehicleId: number;
  vehicleCode: string;
  zoneName: string;
  color: string;
  polygon: [number, number][];
}

export default function ManagePage() {
  const [tab, setTab] = useState<Tab>('vehicles');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [apiVehicles, setApiVehicles] = useState<ApiVehicle[]>([]);
  const [routeList, setRouteList] = useState<ManagedRoute[]>([]);
  const [zoneList, setZoneList] = useState<ManagedZone[]>([]);
  const [source, setSource] = useState<'api' | 'mock'>('mock');

  // Modals
  const [vehicleModal, setVehicleModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState<{ vehicle: Vehicle; apiId: number | null } | null>(null);
  const [routeModal, setRouteModal] = useState(false);
  const [editRoute, setEditRoute] = useState<ManagedRoute | null>(null);
  const [zoneModal, setZoneModal] = useState(false);
  const [editZone, setEditZone] = useState<ManagedZone | null>(null);

  // Load data
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      // Vehicles
      const vRes = await loadVehicles();
      setVehicleList(vRes.data);
      setSource(vRes.source);

      // Also load raw API vehicles for id mapping
      try {
        const rawV = await api.getVehicles(() => []);
        setApiVehicles(rawV.data);
      } catch { /* ignore */ }

      // Routes
      try {
        const rRes = await api.getRoutes();
        if (rRes.data.length > 0) {
          setRouteList(rRes.data.map(r => ({
            apiId: r.id,
            vehicleId: r.vehicle_id,
            vehicleCode: apiVehicles.find(v => v.id === r.vehicle_id)?.internal_code || `V-${r.vehicle_id}`,
            routeName: r.route_name,
            color: r.color,
            waypoints: r.waypoints as [number, number][],
          })));
        }
      } catch { /* ignore */ }

      // Zones
      try {
        const zRes = await api.getZones();
        if (zRes.data.length > 0) {
          setZoneList(zRes.data.map(z => ({
            apiId: z.id,
            vehicleId: z.vehicle_id,
            vehicleCode: apiVehicles.find(v => v.id === z.vehicle_id)?.internal_code || `V-${z.vehicle_id}`,
            zoneName: z.zone_name,
            color: z.color,
            polygon: z.polygon as [number, number][],
          })));
        }
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Find apiId for a frontend vehicle
  const getApiId = (frontendId: string): number | null => {
    // frontendId is like "v-001" → numeric id 1
    const num = parseInt(frontendId.replace('v-', ''), 10);
    const found = apiVehicles.find(v => v.id === num);
    return found?.id ?? null;
  };

  // ── Vehicle CRUD ──
  const handleSaveVehicle = async (v: Vehicle, apiId: number | null) => {
    setSaving(true);
    try {
      const backendType = vehicleTypeToBackend[v.type] || 'service_car';
      const backendDept = deptToBackend[v.department] || 'other';
      const backendStatus = statusToBackend[v.status] || 'active';

      if (apiId) {
        await api.updateVehicle(apiId, {
          plate_number: v.plate_number,
          internal_code: v.internal_code,
          type: backendType,
          department: backendDept,
          brand_model: v.model,
          year: v.year,
          status: backendStatus,
          current_lat: v.current_location.lat,
          current_lng: v.current_location.lng,
          odometer: v.odometer,
        });
      } else {
        await api.createVehicle({
          plate_number: v.plate_number,
          internal_code: v.internal_code,
          type: backendType,
          department: backendDept,
          brand_model: v.model,
          year: v.year,
          fuel_type: 'diesel',
          fuel_capacity: 60,
          status: backendStatus,
          current_lat: v.current_location.lat,
          current_lng: v.current_location.lng,
          odometer: v.odometer,
        });
      }
      await reload();
    } catch (e) {
      console.error('Vehicle save error:', e);
      // Fallback: update local state
      setVehicleList(prev => {
        const idx = prev.findIndex(x => x.id === v.id);
        if (idx >= 0) { const copy = [...prev]; copy[idx] = v; return copy; }
        return [...prev, v];
      });
    } finally {
      setSaving(false);
      setVehicleModal(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    const apiId = getApiId(id);
    if (apiId) {
      try { await api.deleteVehicle(apiId); } catch { /* ignore */ }
    }
    setVehicleList(prev => prev.filter(v => v.id !== id));
    await reload();
  };

  // ── Route CRUD ──
  const handleSaveRoute = async (r: ManagedRoute) => {
    setSaving(true);
    try {
      if (r.apiId) {
        await api.updateRoute(r.apiId, {
          route_name: r.routeName,
          color: r.color,
          waypoints: r.waypoints,
        });
      } else {
        await api.createRoute({
          vehicle_id: r.vehicleId,
          route_name: r.routeName,
          color: r.color,
          waypoints: r.waypoints,
        });
      }
      await reload();
    } catch (e) {
      console.error('Route save error:', e);
      setRouteList(prev => {
        const idx = prev.findIndex(x => x.vehicleId === r.vehicleId);
        if (idx >= 0) { const copy = [...prev]; copy[idx] = r; return copy; }
        return [...prev, r];
      });
    } finally {
      setSaving(false);
      setRouteModal(false);
    }
  };

  const handleDeleteRoute = async (r: ManagedRoute) => {
    if (r.apiId) {
      try { await api.deleteRoute(r.apiId); } catch { /* ignore */ }
    }
    setRouteList(prev => prev.filter(x => x.apiId !== r.apiId));
    await reload();
  };

  // ── Zone CRUD ──
  const handleSaveZone = async (z: ManagedZone) => {
    setSaving(true);
    try {
      if (z.apiId) {
        await api.updateZone(z.apiId, {
          zone_name: z.zoneName,
          color: z.color,
          polygon: z.polygon,
        });
      } else {
        await api.createZone({
          vehicle_id: z.vehicleId,
          zone_name: z.zoneName,
          color: z.color,
          polygon: z.polygon,
        });
      }
      await reload();
    } catch (e) {
      console.error('Zone save error:', e);
      setZoneList(prev => {
        const idx = prev.findIndex(x => x.vehicleId === z.vehicleId);
        if (idx >= 0) { const copy = [...prev]; copy[idx] = z; return copy; }
        return [...prev, z];
      });
    } finally {
      setSaving(false);
      setZoneModal(false);
    }
  };

  const handleDeleteZone = async (z: ManagedZone) => {
    if (z.apiId) {
      try { await api.deleteZone(z.apiId); } catch { /* ignore */ }
    }
    setZoneList(prev => prev.filter(x => x.apiId !== z.apiId));
    await reload();
  };

  const tabs: { key: Tab; label: string; icon: typeof Truck; count: number }[] = [
    { key: 'vehicles', label: 'Transportlar', icon: Truck, count: vehicleList.length },
    { key: 'routes', label: 'Marshrutlar', icon: Route, count: routeList.length },
    { key: 'zones', label: 'Hududlar', icon: MapPinned, count: zoneList.length },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Boshqarish</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Transport, marshrut va hududlarni boshqarish
            {source === 'api' && <span className="ml-2 text-xs text-emerald-600 font-medium">LIVE</span>}
            {source === 'mock' && <span className="ml-2 text-xs text-amber-600 font-medium">DEMO</span>}
          </p>
        </div>
        <button
          onClick={() => {
            if (tab === 'vehicles') { setEditVehicle(null); setVehicleModal(true); }
            else if (tab === 'routes') { setEditRoute(null); setRouteModal(true); }
            else { setEditZone(null); setZoneModal(true); }
          }}
          className="btn btn-primary btn-sm"
        >
          <Plus size={15} />
          {tab === 'vehicles' ? 'Transport qo\'shish' : tab === 'routes' ? 'Marshrut qo\'shish' : 'Hudud qo\'shish'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? '#4f46e5' : '#64748b',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${tab === t.key ? '#4f46e5' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
            }}
          >
            <t.icon size={15} />
            {t.label}
            <span style={{
              fontSize: 11, padding: '1px 8px', borderRadius: 10,
              background: tab === t.key ? '#eef2ff' : '#f1f5f9',
              color: tab === t.key ? '#4f46e5' : '#94a3b8', fontWeight: 600,
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Qidirish..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Yuklanmoqda...
        </div>
      ) : (
        <>
          {tab === 'vehicles' && (
            <VehiclesTab vehicles={vehicleList} search={search}
              onEdit={v => { setEditVehicle({ vehicle: v, apiId: getApiId(v.id) }); setVehicleModal(true); }}
              onDelete={handleDeleteVehicle} />
          )}
          {tab === 'routes' && (
            <RoutesTab routes={routeList} search={search}
              onEdit={r => { setEditRoute(r); setRouteModal(true); }}
              onDelete={handleDeleteRoute} />
          )}
          {tab === 'zones' && (
            <ZonesTab zones={zoneList} search={search}
              onEdit={z => { setEditZone(z); setZoneModal(true); }}
              onDelete={handleDeleteZone} />
          )}
        </>
      )}

      {/* Vehicle Modal */}
      <VehicleFormModal isOpen={vehicleModal}
        onClose={() => setVehicleModal(false)}
        vehicle={editVehicle?.vehicle ?? null}
        saving={saving}
        onSave={v => handleSaveVehicle(v, editVehicle?.apiId ?? null)} />

      {/* Route Modal */}
      <RouteFormModal isOpen={routeModal}
        onClose={() => setRouteModal(false)}
        route={editRoute}
        apiVehicles={apiVehicles}
        vehicles={vehicleList}
        saving={saving}
        onSave={handleSaveRoute} />

      {/* Zone Modal */}
      <ZoneFormModal isOpen={zoneModal}
        onClose={() => setZoneModal(false)}
        zone={editZone}
        apiVehicles={apiVehicles}
        vehicles={vehicleList}
        saving={saving}
        onSave={handleSaveZone} />
    </div>
  );
}

/* ─── Vehicles Tab ─── */
function VehiclesTab({ vehicles, search, onEdit, onDelete }: {
  vehicles: Vehicle[]; search: string;
  onEdit: (v: Vehicle) => void; onDelete: (id: string) => void;
}) {
  const filtered = useMemo(() => vehicles.filter(v =>
    v.internal_code.toLowerCase().includes(search.toLowerCase()) ||
    v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
    v.assigned_driver.toLowerCase().includes(search.toLowerCase()) ||
    v.department.toLowerCase().includes(search.toLowerCase())
  ), [vehicles, search]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kod</th><th>Raqam</th><th>Tur</th><th>Bo&apos;lim</th>
              <th>Holat</th><th>Haydovchi</th><th>Model</th><th>Yil</th>
              <th style={{ width: 100 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="group">
                <td><span className="font-semibold text-indigo-600">{v.internal_code}</span></td>
                <td className="font-mono text-[13px]">{v.plate_number}</td>
                <td className="text-slate-600">{getVehicleTypeLabel(v.type)}</td>
                <td className="text-slate-600 max-w-[140px] truncate">{v.department}</td>
                <td><StatusBadge status={v.status} size="sm" /></td>
                <td className="text-slate-700">{v.assigned_driver}</td>
                <td className="text-slate-600">{v.model}</td>
                <td className="text-slate-600">{v.year}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(v)} className="btn btn-ghost btn-sm" title="Tahrirlash"><Pencil size={14} /></button>
                    <button onClick={() => onDelete(v.id)} className="btn btn-ghost btn-sm text-rose-500" title="O'chirish"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-400">Hech qanday transport topilmadi</div>}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[13px] text-slate-500">{filtered.length} ta natija</div>
    </div>
  );
}

/* ─── Routes Tab ─── */
function RoutesTab({ routes, search, onEdit, onDelete }: {
  routes: ManagedRoute[]; search: string;
  onEdit: (r: ManagedRoute) => void; onDelete: (r: ManagedRoute) => void;
}) {
  const filtered = useMemo(() => routes.filter(r =>
    r.routeName.toLowerCase().includes(search.toLowerCase()) ||
    r.vehicleCode.toLowerCase().includes(search.toLowerCase())
  ), [routes, search]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map(r => (
        <div key={r.apiId ?? r.vehicleId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Route size={20} style={{ color: r.color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{r.routeName}</div>
                <div className="text-xs text-slate-500">{r.vehicleCode}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEdit(r)} className="btn btn-ghost btn-sm"><Pencil size={14} /></button>
              <button onClick={() => onDelete(r)} className="btn btn-ghost btn-sm text-rose-500"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span style={{ width: 20, height: 3, background: r.color, borderRadius: 2, display: 'inline-block' }} />
            <span>{r.waypoints.length} nuqta</span>
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div className="col-span-full py-12 text-center text-sm text-slate-400">Marshrut topilmadi</div>}
    </div>
  );
}

/* ─── Zones Tab ─── */
function ZonesTab({ zones, search, onEdit, onDelete }: {
  zones: ManagedZone[]; search: string;
  onEdit: (z: ManagedZone) => void; onDelete: (z: ManagedZone) => void;
}) {
  const filtered = useMemo(() => zones.filter(z =>
    z.zoneName.toLowerCase().includes(search.toLowerCase()) ||
    z.vehicleCode.toLowerCase().includes(search.toLowerCase())
  ), [zones, search]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map(z => (
        <div key={z.apiId ?? z.vehicleId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${z.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPinned size={20} style={{ color: z.color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{z.zoneName}</div>
                <div className="text-xs text-slate-500">{z.vehicleCode}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEdit(z)} className="btn btn-ghost btn-sm"><Pencil size={14} /></button>
              <button onClick={() => onDelete(z)} className="btn btn-ghost btn-sm text-rose-500"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span style={{ width: 14, height: 14, borderRadius: 3, background: `${z.color}22`, border: `2px solid ${z.color}`, display: 'inline-block' }} />
            <span>{z.polygon.length} nuqta</span>
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div className="col-span-full py-12 text-center text-sm text-slate-400">Hudud topilmadi</div>}
    </div>
  );
}

/* ─── Vehicle Form Modal ─── */
function VehicleFormModal({ isOpen, onClose, vehicle, saving, onSave }: {
  isOpen: boolean; onClose: () => void; saving: boolean;
  vehicle: Vehicle | null; onSave: (v: Vehicle) => void;
}) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<Partial<Vehicle>>({});

  const v = vehicle || {} as Partial<Vehicle>;
  const val = (key: keyof Vehicle) => (form[key] ?? v[key] ?? '') as string;
  const numVal = (key: keyof Vehicle) => (form[key] ?? v[key] ?? 0) as number;

  const handleSave = () => {
    const type = (form.type ?? v.type ?? 'traktor') as Vehicle['type'];
    const prefix = typeOptions.find(t => t.value === type)?.prefix ?? 'XX';
    const id = v.id || `v-${String(Date.now()).slice(-6)}`;
    const code = v.internal_code || `${prefix}-${id.replace('v-', '').padStart(3, '0')}`;

    const result: Vehicle = {
      id, internal_code: code,
      plate_number: val('plate_number') || '01 000 AAA',
      type: type as Vehicle['type'],
      department: val('department') || departments[0],
      status: (form.status ?? v.status ?? 'faol') as Vehicle['status'],
      assigned_driver: val('assigned_driver') || 'Tayinlanmagan',
      current_location: (form as any).current_location ?? v.current_location ?? { lat: 40.384, lng: 71.789 },
      odometer: numVal('odometer'),
      efficiency_score: numVal('efficiency_score') || 70,
      maintenance_risk: numVal('maintenance_risk'),
      anomaly_count: numVal('anomaly_count'),
      fuel_level: numVal('fuel_level') || 100,
      last_service: val('last_service') || '2026-03-01',
      next_service: val('next_service') || '2026-06-01',
      year: numVal('year') || 2024,
      model: val('model') || '',
    };
    onSave(result);
    setForm({});
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setForm({}); }}
      title={isEdit ? 'Transportni tahrirlash' : 'Yangi transport qo\'shish'} size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Transport turi">
          <select value={(form.type ?? v.type ?? 'traktor') as string}
            onChange={e => setForm(p => ({ ...p, type: e.target.value as Vehicle['type'] }))}
            className="input-field text-sm">
            {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Davlat raqami">
          <input type="text" value={val('plate_number')}
            onChange={e => setForm(p => ({ ...p, plate_number: e.target.value }))}
            placeholder="01 123 ABC" className="input-field text-sm" />
        </Field>
        <Field label="Model">
          <input type="text" value={val('model')}
            onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
            placeholder="Masalan: Chevrolet Cobalt" className="input-field text-sm" />
        </Field>
        <Field label="Yil">
          <input type="number" value={numVal('year') || ''}
            onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) || 0 }))}
            placeholder="2024" className="input-field text-sm" />
        </Field>
        <Field label="Bo'lim">
          <select value={val('department') || departments[0]}
            onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
            className="input-field text-sm">
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Holat">
          <select value={(form.status ?? v.status ?? 'faol') as string}
            onChange={e => setForm(p => ({ ...p, status: e.target.value as Vehicle['status'] }))}
            className="input-field text-sm">
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Haydovchi">
          <input type="text" value={val('assigned_driver')}
            onChange={e => setForm(p => ({ ...p, assigned_driver: e.target.value }))}
            placeholder="Ism Familiya" className="input-field text-sm" />
        </Field>
        <Field label="Yoqilg'i (%)">
          <input type="number" min={0} max={100} value={numVal('fuel_level') || ''}
            onChange={e => setForm(p => ({ ...p, fuel_level: parseInt(e.target.value) || 0 }))}
            placeholder="100" className="input-field text-sm" />
        </Field>
        <Field label="Odometr (km)">
          <input type="number" value={numVal('odometer') || ''}
            onChange={e => setForm(p => ({ ...p, odometer: parseInt(e.target.value) || 0 }))}
            placeholder="0" className="input-field text-sm" />
        </Field>
        <Field label="Joylashuv (lat, lng)">
          <input type="text"
            value={((form as any).current_location ?? v.current_location) ? `${((form as any).current_location ?? v.current_location)?.lat ?? 40.384}, ${((form as any).current_location ?? v.current_location)?.lng ?? 71.789}` : '40.384, 71.789'}
            onChange={e => {
              const parts = e.target.value.split(',').map(s => parseFloat(s.trim()));
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                setForm(p => ({ ...p, current_location: { lat: parts[0], lng: parts[1] } } as any));
              }
            }}
            placeholder="40.384, 71.789" className="input-field text-sm" />
        </Field>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button onClick={() => { onClose(); setForm({}); }} className="btn btn-secondary btn-sm">Bekor qilish</button>
        <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isEdit ? 'Saqlash' : 'Qo\'shish'}
        </button>
      </div>
    </Modal>
  );
}

/* ─── Route Form Modal ─── */
function RouteFormModal({ isOpen, onClose, route, apiVehicles, vehicles, saving, onSave }: {
  isOpen: boolean; onClose: () => void;
  route: ManagedRoute | null; apiVehicles: ApiVehicle[]; vehicles: Vehicle[];
  saving: boolean; onSave: (r: ManagedRoute) => void;
}) {
  const isEdit = !!route;
  const [vehicleId, setVehicleId] = useState(route?.vehicleId ?? 0);
  const [routeName, setRouteName] = useState(route?.routeName ?? '');
  const [color, setColor] = useState(route?.color ?? '#ef4444');
  const [waypoints, setWaypoints] = useState<[number, number][]>(route?.waypoints ?? []);

  useEffect(() => {
    setVehicleId(route?.vehicleId ?? 0);
    setRouteName(route?.routeName ?? '');
    setColor(route?.color ?? '#ef4444');
    setWaypoints(route?.waypoints ?? []);
  }, [route, isOpen]);

  const handleSave = () => {
    const selectedApiV = apiVehicles.find(v => v.id === vehicleId);
    onSave({
      apiId: route?.apiId ?? null,
      vehicleId, vehicleCode: selectedApiV?.internal_code ?? `V-${vehicleId}`,
      routeName: routeName || 'Yangi marshrut', color, waypoints,
    });
  };

  const vehicleOptions = apiVehicles.length > 0
    ? apiVehicles.map(v => ({ id: v.id, label: `${v.internal_code} — ${v.brand_model}` }))
    : vehicles.map(v => ({ id: parseInt(v.id.replace('v-', ''), 10), label: `${v.internal_code} — ${getVehicleTypeLabel(v.type)}` }));

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Marshrutni tahrirlash' : 'Yangi marshrut qo\'shish'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Transport">
            <select value={vehicleId} onChange={e => setVehicleId(parseInt(e.target.value))}
              className="input-field text-sm" disabled={isEdit}>
              <option value={0}>Tanlang...</option>
              {vehicleOptions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Marshrut nomi">
            <input type="text" value={routeName} onChange={e => setRouteName(e.target.value)}
              placeholder="Masalan: Markaz — Shimoliy marshrut" className="input-field text-sm" />
          </Field>
        </div>
        <ColorPicker color={color} onChange={setColor} />
        <Field label="Xaritaga bosib marshrut yo'nalishini belgilang">
          <MapPicker points={waypoints} onChange={setWaypoints} color={color} mode="polyline" height={380} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button onClick={onClose} className="btn btn-secondary btn-sm">Bekor qilish</button>
        <button onClick={() => setWaypoints([])} className="btn btn-secondary btn-sm text-rose-500">Tozalash</button>
        <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={!vehicleId || waypoints.length < 2 || saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isEdit ? 'Saqlash' : 'Qo\'shish'}
        </button>
      </div>
    </Modal>
  );
}

/* ─── Zone Form Modal ─── */
function ZoneFormModal({ isOpen, onClose, zone, apiVehicles, vehicles, saving, onSave }: {
  isOpen: boolean; onClose: () => void;
  zone: ManagedZone | null; apiVehicles: ApiVehicle[]; vehicles: Vehicle[];
  saving: boolean; onSave: (z: ManagedZone) => void;
}) {
  const isEdit = !!zone;
  const [vehicleId, setVehicleId] = useState(zone?.vehicleId ?? 0);
  const [zoneName, setZoneName] = useState(zone?.zoneName ?? '');
  const [color, setColor] = useState(zone?.color ?? '#10b981');
  const [polygon, setPolygon] = useState<[number, number][]>(zone?.polygon ?? []);

  useEffect(() => {
    setVehicleId(zone?.vehicleId ?? 0);
    setZoneName(zone?.zoneName ?? '');
    setColor(zone?.color ?? '#10b981');
    setPolygon(zone?.polygon ?? []);
  }, [zone, isOpen]);

  const handleSave = () => {
    const selectedApiV = apiVehicles.find(v => v.id === vehicleId);
    onSave({
      apiId: zone?.apiId ?? null,
      vehicleId, vehicleCode: selectedApiV?.internal_code ?? `V-${vehicleId}`,
      zoneName: zoneName || 'Yangi hudud', color, polygon,
    });
  };

  const vehicleOptions = apiVehicles.length > 0
    ? apiVehicles.map(v => ({ id: v.id, label: `${v.internal_code} — ${v.brand_model}` }))
    : vehicles.map(v => ({ id: parseInt(v.id.replace('v-', ''), 10), label: `${v.internal_code} — ${getVehicleTypeLabel(v.type)}` }));

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Hududni tahrirlash' : 'Yangi hudud qo\'shish'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Transport">
            <select value={vehicleId} onChange={e => setVehicleId(parseInt(e.target.value))}
              className="input-field text-sm" disabled={isEdit}>
              <option value={0}>Tanlang...</option>
              {vehicleOptions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Hudud nomi">
            <input type="text" value={zoneName} onChange={e => setZoneName(e.target.value)}
              placeholder="Masalan: Markaz tumani" className="input-field text-sm" />
          </Field>
        </div>
        <ColorPicker color={color} onChange={setColor} />
        <Field label="Xaritaga bosib hudud chegarasini belgilang">
          <MapPicker points={polygon} onChange={setPolygon} color={color} mode="polygon" height={380} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button onClick={onClose} className="btn btn-secondary btn-sm">Bekor qilish</button>
        <button onClick={() => setPolygon([])} className="btn btn-secondary btn-sm text-rose-500">Tozalash</button>
        <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={!vehicleId || polygon.length < 3 || saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isEdit ? 'Saqlash' : 'Qo\'shish'}
        </button>
      </div>
    </Modal>
  );
}

/* ─── Shared UI ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  return (
    <Field label="Rang">
      <div className="flex gap-2 flex-wrap">
        {colorPresets.map(c => (
          <button key={c.value} onClick={() => onChange(c.value)} title={c.label}
            style={{
              width: 32, height: 32, borderRadius: 8, background: c.value,
              border: color === c.value ? '3px solid #1e293b' : '2px solid #e2e8f0',
              cursor: 'pointer', transition: 'all 0.15s',
            }} />
        ))}
      </div>
    </Field>
  );
}
