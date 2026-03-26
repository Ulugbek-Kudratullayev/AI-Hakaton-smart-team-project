'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Truck, User, Gauge, Wrench, AlertTriangle,
  MapPin, Calendar, Fuel, Activity, Clock, FileText, Zap, TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import ChartCard from '@/components/ui/ChartCard';
import { vehicles, getVehicleTypeLabel, formatNumber, formatDate, alerts, maintenanceRecords } from '@/data/mockData';

const usageHistory = [
  { day: '20 Mar', hours: 6 },
  { day: '21 Mar', hours: 8 },
  { day: '22 Mar', hours: 7 },
  { day: '23 Mar', hours: 5 },
  { day: '24 Mar', hours: 9 },
  { day: '25 Mar', hours: 4 },
  { day: '26 Mar', hours: 7 },
];

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const vehicle = vehicles.find(v => v.id === id);

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-lg font-semibold text-slate-600">Transport topilmadi</h2>
        <Link href="/vehicles" className="btn btn-primary mt-4">
          <ArrowLeft size={16} /> Ortga qaytish
        </Link>
      </div>
    );
  }

  const vehicleAlerts = alerts.filter(a => a.vehicle_id === vehicle.id);
  const vehicleMaintenance = maintenanceRecords.filter(m => m.vehicle_id === vehicle.id);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getRiskLevel = (risk: number) => {
    if (risk >= 80) return { label: 'Yuqori xavf', color: 'bg-rose-500' };
    if (risk >= 50) return { label: "O'rta xavf", color: 'bg-amber-500' };
    return { label: 'Past xavf', color: 'bg-emerald-500' };
  };

  const riskInfo = getRiskLevel(vehicle.maintenance_risk);

  const timelineEvents = [
    { date: '2026-03-26 15:30', event: 'Yoqilg\'i to\'ldirildi — 45 litr', type: 'fuel' },
    { date: '2026-03-26 08:00', event: 'Smena boshlandi', type: 'shift' },
    { date: '2026-03-25 17:00', event: 'Smena yakunlandi — 142 km', type: 'shift' },
    { date: '2026-03-25 12:30', event: 'Texnik ko\'rik — yaxshi holat', type: 'maintenance' },
    { date: '2026-03-24 09:15', event: 'Vazifa tayinlandi: Dala ishlari', type: 'task' },
    { date: '2026-03-23 16:00', event: 'Moy almashtirish bajarildi', type: 'maintenance' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/vehicles" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} />
          Avtotransport
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-medium">{vehicle.internal_code}</span>
      </div>

      {/* Vehicle header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <Truck size={32} className="text-indigo-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-800">{vehicle.internal_code}</h1>
              <StatusBadge status={vehicle.status} />
            </div>
            <p className="text-sm text-slate-500">{vehicle.model} · {vehicle.year} · {vehicle.plate_number}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-[13px] text-slate-500">
              <span className="flex items-center gap-1"><Truck size={14} /> {getVehicleTypeLabel(vehicle.type)}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {vehicle.department}</span>
              <span className="flex items-center gap-1"><User size={14} /> {vehicle.assigned_driver}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary btn-sm">Tahrirlash</button>
            <button className="btn btn-primary btn-sm">Vazifa biriktirish</button>
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge size={16} className="text-indigo-500" />
            <span className="text-xs text-slate-500">Samaradorlik</span>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(vehicle.efficiency_score)}`}>{vehicle.efficiency_score}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-xs text-slate-500">Odometr</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatNumber(vehicle.odometer)} <span className="text-sm font-normal text-slate-400">km</span></p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Fuel size={16} className="text-amber-500" />
            <span className="text-xs text-slate-500">Yoqilg&apos;i</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{vehicle.fuel_level}%</p>
          <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${vehicle.fuel_level > 50 ? 'bg-emerald-500' : vehicle.fuel_level > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${vehicle.fuel_level}%` }}
            />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={16} className="text-rose-500" />
            <span className="text-xs text-slate-500">TX xavfi</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{vehicle.maintenance_risk}%</p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${riskInfo.color}`} />
            <span className="text-xs text-slate-500">{riskInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Usage chart + Driver info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Foydalanish tarixi" subtitle="So'nggi 7 kun (soat)">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={usageHistory}>
                <defs>
                  <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={2} fill="url(#usageGrad)" name="Soat" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Driver & service info */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-800">Haydovchi</h3>
            </div>
            <p className="text-base font-semibold text-slate-800">{vehicle.assigned_driver}</p>
            <div className="mt-3 space-y-2 text-[13px] text-slate-500">
              <div className="flex justify-between">
                <span>Tajriba</span>
                <span className="font-medium text-slate-700">5 yil</span>
              </div>
              <div className="flex justify-between">
                <span>Reyting</span>
                <span className="font-medium text-emerald-600">4.7/5</span>
              </div>
              <div className="flex justify-between">
                <span>Bugungi km</span>
                <span className="font-medium text-slate-700">67 km</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Texnik xizmat</h3>
            </div>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Oxirgi xizmat</span>
                <span className="font-medium text-slate-700">{formatDate(vehicle.last_service)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Keyingi xizmat</span>
                <span className="font-medium text-indigo-600">{formatDate(vehicle.next_service)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-indigo-600" />
          <h3 className="text-base font-semibold text-indigo-900">AI tavsiyalari</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-lg p-4 border border-indigo-100">
            <p className="text-xs text-indigo-600 font-medium mb-1">Samaradorlik</p>
            <p className="text-[13px] text-slate-700">Yoqilg&apos;i sarfini 12% kamaytirish uchun marshrut optimallashtirish tavsiya etiladi.</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4 border border-indigo-100">
            <p className="text-xs text-indigo-600 font-medium mb-1">Texnik xizmat</p>
            <p className="text-[13px] text-slate-700">Dvigatel filtri almashtirilishi kerak — keyingi 500 km ichida xizmat ko&apos;rsatish tavsiya etiladi.</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4 border border-indigo-100">
            <p className="text-xs text-indigo-600 font-medium mb-1">Foydalanish</p>
            <p className="text-[13px] text-slate-700">O&apos;rtacha kunlik foydalanish 6.5 soat — optimal diapazonda.</p>
          </div>
        </div>
      </div>

      {/* Alerts + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Anomaly history */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-800">Anomaliya tarixi</h3>
            </div>
            <span className="badge badge-neutral">{vehicleAlerts.length} ta</span>
          </div>
          {vehicleAlerts.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {vehicleAlerts.map(alert => (
                <div key={alert.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={alert.severity} size="sm" />
                    <StatusBadge status={alert.status} size="sm" />
                  </div>
                  <p className="text-[13px] text-slate-700">{alert.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{formatDate(alert.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">Anomaliya qayd etilmagan</div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">Hodisalar tarixi</h3>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
              {timelineEvents.map((event, i) => {
                const dotColor = event.type === 'maintenance' ? 'bg-amber-500' : event.type === 'fuel' ? 'bg-emerald-500' : event.type === 'task' ? 'bg-indigo-500' : 'bg-slate-400';
                return (
                  <div key={i} className="flex gap-4 mb-4 last:mb-0 relative">
                    <div className={`w-[15px] h-[15px] rounded-full ${dotColor} ring-4 ring-white z-10 flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-[13px] text-slate-700">{event.event}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{event.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
