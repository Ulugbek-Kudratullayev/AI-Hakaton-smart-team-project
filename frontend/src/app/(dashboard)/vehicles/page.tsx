'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Eye, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { vehicles as mockVehicles, getVehicleTypeLabel, formatNumber } from '@/data/mockData';
import { loadVehicles } from '@/lib/loaders';
import type { Vehicle } from '@/types';

const typeFilters = [
  { value: '', label: 'Barcha turlar' },
  { value: 'traktor', label: 'Traktor' },
  { value: 'yuk_mashinasi', label: 'Yuk mashinasi' },
  { value: 'xizmat_avtomobili', label: 'Xizmat avtomobili' },
  { value: 'avtobus', label: 'Avtobus' },
  { value: 'ekskovator', label: 'Ekskovator' },
  { value: "sug'orish_mashinasi", label: "Sug'orish mashinasi" },
];

const statusFilters = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'faol', label: 'Faol' },
  { value: 'kutish', label: 'Kutish' },
  { value: "ta'mirda", label: "Ta'mirda" },
  { value: "yo'lda", label: "Yo'lda" },
];

const departmentFilters = [
  { value: '', label: 'Barcha bo\'limlar' },
  { value: "Qishloq xo'jaligi bo'limi", label: "Qishloq xo'jaligi" },
  { value: "Kommunal xo'jalik bo'limi", label: "Kommunal xo'jalik" },
  { value: "Yo'l-transport bo'limi", label: "Yo'l-transport" },
  { value: "Ekologiya bo'limi", label: "Ekologiya" },
  { value: "Qurilish bo'limi", label: "Qurilish" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadVehicles().then(res => setVehicles(res.data));
  }, []);

  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch =
        v.internal_code.toLowerCase().includes(search.toLowerCase()) ||
        v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
        v.assigned_driver.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || v.type === typeFilter;
      const matchStatus = !statusFilter || v.status === statusFilter;
      const matchDept = !deptFilter || v.department === deptFilter;
      return matchSearch && matchType && matchStatus && matchDept;
    });
  }, [vehicles, search, typeFilter, statusFilter, deptFilter]);

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'text-rose-600 bg-rose-50';
    if (risk >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Avtotransport</h1>
          <p className="text-sm text-slate-500 mt-0.5">Jami {vehicles.length} ta transport vositasi</p>
        </div>
        <button className="btn btn-secondary btn-sm">
          <Download size={15} />
          Eksport
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Kod, raqam yoki haydovchi bo'yicha qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm"
          >
            <Filter size={15} />
            Filterlar
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 animate-fade-in">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field text-sm">
              {typeFilters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm">
              {statusFilters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field text-sm">
              {departmentFilters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Raqam</th>
                <th>Tur</th>
                <th>Bo&apos;lim</th>
                <th>Holat</th>
                <th>Haydovchi</th>
                <th>Odometr</th>
                <th>Samaradorlik</th>
                <th>Xavf</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="group">
                  <td>
                    <span className="font-semibold text-indigo-600">{v.internal_code}</span>
                  </td>
                  <td className="font-mono text-[13px]">{v.plate_number}</td>
                  <td className="text-slate-600">{getVehicleTypeLabel(v.type)}</td>
                  <td className="text-slate-600 max-w-[140px] truncate">{v.department}</td>
                  <td><StatusBadge status={v.status} size="sm" /></td>
                  <td className="text-slate-700">{v.assigned_driver}</td>
                  <td className="font-mono text-[13px] text-slate-600">{formatNumber(v.odometer)} km</td>
                  <td>
                    <span className={`font-semibold ${getEfficiencyColor(v.efficiency_score)}`}>
                      {v.efficiency_score}%
                    </span>
                  </td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getRiskColor(v.maintenance_risk)}`}>
                      {v.maintenance_risk}%
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/vehicles/${v.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-sm"
                    >
                      <Eye size={15} />
                      Ko&apos;rish
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">Hech qanday transport topilmadi</p>
          </div>
        )}

        {/* Table footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[13px] text-slate-500">{filtered.length} ta natija</span>
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-sm" disabled>Oldingi</button>
            <button className="btn btn-ghost btn-sm bg-indigo-50 text-indigo-600">1</button>
            <button className="btn btn-ghost btn-sm" disabled>Keyingi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
