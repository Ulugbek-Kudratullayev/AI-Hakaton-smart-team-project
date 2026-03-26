'use client';

import { useEffect, useState } from 'react';
import {
  Truck, Activity, PauseCircle, Wrench, Gauge, AlertTriangle,
  Plus, ArrowRightLeft, ClipboardPlus, Bell, ArrowRight,
  MapPin, Zap, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import KPICard from '@/components/ui/KPICard';
import ChartCard from '@/components/ui/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  kpiData as mockKpi, efficiencyTrend, taskCompletionTrend,
  maintenanceRiskDistribution, vehiclesByType, vehiclesByDepartment,
  alerts as mockAlerts, activityLogs, vehicles as mockVehicles,
} from '@/data/mockData';
import { loadDashboard, loadVehicles, loadAlerts, loadActivityLogs } from '@/lib/loaders';
import type { Vehicle, Alert, KPIData, ActivityLog } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<KPIData>(mockKpi);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [allAlerts, setAllAlerts] = useState<Alert[]>(mockAlerts);
  const [logs, setLogs] = useState<ActivityLog[]>(activityLogs);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');

  useEffect(() => {
    async function load() {
      const [dashRes, vRes, aRes, logRes] = await Promise.all([
        loadDashboard(),
        loadVehicles(),
        loadAlerts(),
        loadActivityLogs(),
      ]);
      setKpiData(dashRes.kpi);
      setVehicles(vRes.data);
      setAllAlerts(aRes.data);
      setLogs(logRes);
      setDataSource(dashRes.source === 'api' || vRes.source === 'api' ? 'api' : 'mock');
    }
    load();
  }, []);

  const urgentAlerts = allAlerts.filter(a => a.status === 'yangi').slice(0, 4);
  const activeOnRoad = vehicles.filter(v => v.status === "yo'lda" || v.status === 'faol').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Boshqaruv paneli</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Transport parkingiz holati haqida umumiy ko&apos;rinish</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
          background: dataSource === 'api' ? '#ecfdf5' : '#fefce8',
          color: dataSource === 'api' ? '#065f46' : '#854d0e',
          border: `1px solid ${dataSource === 'api' ? '#a7f3d0' : '#fde68a'}`,
        }}>
          {dataSource === 'api' ? '● API ulangan' : '● Demo rejim'}
        </span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <KPICard title="Jami transport" value={kpiData.total_vehicles} icon={Truck} color="indigo" />
        <KPICard title="Faol" value={kpiData.active_vehicles} icon={Activity} trend={{ value: 8, label: "haftaga" }} color="emerald" />
        <KPICard title="Kutish" value={kpiData.idle_vehicles} icon={PauseCircle} trend={{ value: -12, label: "haftaga" }} color="amber" />
        <KPICard title="Ta'mirda" value={kpiData.in_service} icon={Wrench} color="sky" />
        <KPICard title="Samaradorlik" value={`${kpiData.average_efficiency}%`} icon={Gauge} trend={{ value: 3, label: "oyga" }} color="violet" />
        <KPICard title="Anomaliyalar" value={kpiData.anomaly_alerts} icon={AlertTriangle} trend={{ value: -5, label: "haftaga" }} color="rose" />
      </div>

      {/* Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <ChartCard title="Samaradorlik tendensiyasi" subtitle="So'nggi 6 oy">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={efficiencyTrend}>
              <defs>
                <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fill="url(#effGrad)" name="Samaradorlik %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vazifalar bajarilishi" subtitle="Jami va bajarilgan">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskCompletionTrend} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="total" fill="#e2e8f0" radius={[5, 5, 0, 0]} name="Jami" barSize={18} />
              <Bar dataKey="completed" fill="#4f46e5" radius={[5, 5, 0, 0]} name="Bajarildi" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Texnik xizmat xavfi" subtitle="Transport bo'yicha taqsimot">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={maintenanceRiskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {maintenanceRiskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Fleet Status + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }} className="max-lg:!grid-cols-1">
        {/* By Type */}
        <ChartCard title="Tur bo'yicha transport" subtitle="Parkning tarkibi">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {vehiclesByType.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.fill, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>{v.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginRight: 8 }}>{v.value}</span>
                <div style={{ width: 80, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: v.fill, width: `${(v.value / 25) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* By Department */}
        <ChartCard title="Bo'lim bo'yicha transport">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={vehiclesByDepartment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="value" fill="#4f46e5" radius={[0, 5, 5, 0]} barSize={16} name="Soni" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Alerts */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#ef4444" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Faol ogohlantirishlar</span>
            </div>
            <Link href="/alerts" style={{ fontSize: 12, color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>
              Barchasi →
            </Link>
          </div>
          <div style={{ flex: 1 }}>
            {urgentAlerts.map((alert) => (
              <div key={alert.id} style={{
                padding: '12px 20px', borderBottom: '1px solid #f8fafc',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <StatusBadge status={alert.severity} size="sm" />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{alert.vehicle_code}</span>
                </div>
                <p style={{ fontSize: 13, color: '#334155' }}>{alert.message}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  {new Date(alert.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map + Activity + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr 3fr', gap: 14 }} className="max-lg:!grid-cols-1">
        {/* Map */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} color="#4f46e5" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Transport joylashuvi</span>
            </div>
            <span className="badge badge-info">{activeOnRoad} faol</span>
          </div>
          <div style={{ position: 'relative', height: 280, background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfdf5 100%)' }}>
            {vehicles.filter(v => v.status === "yo'lda" || v.status === 'faol').slice(0, 12).map((v) => {
              const x = 10 + ((v.current_location.lng - 69.05) / 0.4) * 75;
              const y = 10 + ((41.45 - v.current_location.lat) / 0.3) * 75;
              const clampX = Math.min(88, Math.max(8, x));
              const clampY = Math.min(88, Math.max(8, y));
              const isActive = v.status === 'faol';
              return (
                <div key={v.id} style={{ position: 'absolute', left: `${clampX}%`, top: `${clampY}%` }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: isActive ? '#10b981' : '#4f46e5',
                    boxShadow: `0 0 0 4px ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(79,70,229,0.2)'}`,
                    cursor: 'pointer', transition: 'transform 0.2s',
                  }}
                  title={`${v.internal_code} · ${v.assigned_driver}`}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                </div>
              );
            })}
            <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>
              Toshkent viloyati
            </div>
            <div style={{ position: 'absolute', bottom: 12, right: 16, display: 'flex', gap: 12, fontSize: 10, color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} /> Faol
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, background: '#4f46e5', borderRadius: '50%', display: 'inline-block' }} /> Yo&apos;lda
              </span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <Clock size={16} color="#64748b" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>So&apos;nggi faoliyat</span>
          </div>
          <div style={{ flex: 1, maxHeight: 280, overflowY: 'auto' }}>
            {logs.map((log) => {
              const iconColor = log.type === 'alert' ? '#ef4444' : log.type === 'task' ? '#4f46e5' : log.type === 'maintenance' ? '#f59e0b' : '#64748b';
              const Icon = log.type === 'alert' ? AlertTriangle : log.type === 'task' ? ClipboardPlus : log.type === 'maintenance' ? Wrench : Truck;
              return (
                <div key={log.id} style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f8fafc' }}>
                  <Icon size={15} color={iconColor} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{log.message}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {log.vehicle_code && <span style={{ fontSize: 11, color: '#4f46e5', fontWeight: 600 }}>{log.vehicle_code}</span>}
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {new Date(log.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <Zap size={16} color="#f59e0b" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Tezkor amallar</span>
          </div>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { href: '/tasks', icon: Plus, label: 'Vazifa yaratish', desc: "Yangi topshiriq qo'shish", bg: '#eef2ff', iconBg: '#4f46e5', border: '#c7d2fe' },
              { href: '/vehicles', icon: ArrowRightLeft, label: 'Transport biriktirish', desc: 'Avtomobilni tayinlash', bg: '#ecfdf5', iconBg: '#059669', border: '#a7f3d0' },
              { href: '/maintenance', icon: Wrench, label: 'Texnik xizmat', desc: 'Xizmatni qayd etish', bg: '#fffbeb', iconBg: '#d97706', border: '#fde68a' },
              { href: '/alerts', icon: Bell, label: 'Ogohlantirishlar', desc: 'Barcha xabarnomalar', bg: '#fef2f2', iconBg: '#e11d48', border: '#fecaca' },
            ].map((item, i) => (
              <Link key={i} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: item.bg, border: `1px solid ${item.border}`,
                textDecoration: 'none', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <item.icon size={16} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: '#64748b' }}>{item.desc}</p>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
