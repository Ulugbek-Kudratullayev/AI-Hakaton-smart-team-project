'use client';

import { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Clock, Calendar, ChevronDown } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import KPICard from '@/components/ui/KPICard';
import { maintenanceRecords as mockMaintenance, formatDate, formatNumber } from '@/data/mockData';
import { loadMaintenance } from '@/lib/loaders';
import type { Maintenance } from '@/types';

export default function MaintenancePage() {
  const [records, setRecords] = useState<Maintenance[]>(mockMaintenance);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadMaintenance().then(res => setRecords(res.data));
  }, []);

  const overdue = records.filter(m => m.status === "muddati_o'tgan");
  const scheduled = records.filter(m => m.status === 'rejalashtirilgan' || m.status === 'kutilmoqda');
  const completed = records.filter(m => m.status === 'bajarildi');

  const filtered = statusFilter
    ? records.filter(m => m.status === statusFilter)
    : records;

  const getRiskBar = (risk: number) => {
    const color = risk >= 80 ? 'bg-rose-500' : risk >= 50 ? 'bg-amber-500' : 'bg-emerald-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${risk}%` }} />
        </div>
        <span className="text-[12px] font-medium text-slate-600">{risk}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Texnik xizmat</h1>
        <p className="text-sm text-slate-500 mt-0.5">Transport vositalariga xizmat ko&apos;rsatish va rejalashtirilgan ta&apos;mirlar</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Muddati o'tgan" value={overdue.length} icon={AlertTriangle} color="rose" />
        <KPICard title="Rejalashtirilgan" value={scheduled.length} icon={Calendar} color="amber" />
        <KPICard title="Bajarilgan" value={completed.length} icon={CheckCircle} color="emerald" />
        <KPICard
          title="Umumiy xarajat"
          value={`${formatNumber(completed.reduce((sum, m) => sum + (m.cost || 0), 0))} so'm`}
          icon={Wrench}
          color="indigo"
        />
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-rose-600" />
            <h3 className="text-sm font-semibold text-rose-800">Muddati o&apos;tgan xizmatlar</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {overdue.map(m => (
              <div key={m.id} className="bg-white border border-rose-100 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{m.vehicle_code}</p>
                  <p className="text-[12px] text-slate-500">{m.service_type} · Muddati: {formatDate(m.due_date)}</p>
                </div>
                <button className="btn btn-primary btn-sm">Xizmat ko&apos;rsatish</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter + Status */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input-field w-auto max-w-xs"
        >
          <option value="">Barcha holatlar</option>
          <option value="muddati_o'tgan">Muddati o&apos;tgan</option>
          <option value="kutilmoqda">Kutilmoqda</option>
          <option value="rejalashtirilgan">Rejalashtirilgan</option>
          <option value="bajarildi">Bajarildi</option>
        </select>
        <span className="text-sm text-slate-400">{filtered.length} ta yozuv</span>
      </div>

      {/* Maintenance records */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transport</th>
                <th>Raqam</th>
                <th>Xizmat turi</th>
                <th>Muddati</th>
                <th>Xavf darajasi</th>
                <th>Holat</th>
                <th>Mexanik</th>
                <th>Xarajat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td><span className="font-semibold text-indigo-600">{m.vehicle_code}</span></td>
                  <td className="font-mono text-[13px] text-slate-600">{m.plate_number}</td>
                  <td className="text-slate-700">{m.service_type}</td>
                  <td className="text-slate-600 text-[13px]">{formatDate(m.due_date)}</td>
                  <td>{getRiskBar(m.risk_score)}</td>
                  <td><StatusBadge status={m.status} size="sm" /></td>
                  <td className="text-slate-600">{m.mechanic}</td>
                  <td className="text-slate-700 font-mono text-[13px]">{m.cost ? `${formatNumber(m.cost)}` : '—'}</td>
                  <td>
                    {m.status !== 'bajarildi' && (
                      <button className="btn btn-ghost btn-sm text-emerald-600 hover:bg-emerald-50">
                        <CheckCircle size={14} />
                        Bajarildi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
