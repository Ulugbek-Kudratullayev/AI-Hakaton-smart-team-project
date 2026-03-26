'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Eye, CheckCircle, Bell } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { alerts as mockAlerts, getAlertTypeLabel, formatDateTime } from '@/data/mockData';
import { loadAlerts } from '@/lib/loaders';
import type { Alert } from '@/types';

const typeFilters = [
  { value: '', label: 'Barcha turlar' },
  { value: 'yoqilgi_anomaliya', label: "Yoqilg'i anomaliyasi" },
  { value: 'ortiqcha_kutish', label: 'Ortiqcha kutish' },
  { value: 'texnik_xizmat', label: 'Texnik xizmat' },
  { value: 'tezlik_buzilishi', label: 'Tezlik buzilishi' },
  { value: 'marshrut_buzilishi', label: 'Marshrut buzilishi' },
];

const severityFilters = [
  { value: '', label: 'Barcha darajalar' },
  { value: 'yuqori', label: 'Yuqori' },
  { value: "o'rta", label: "O'rta" },
  { value: 'past', label: 'Past' },
];

const statusFilters = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'yangi', label: 'Yangi' },
  { value: "ko'rildi", label: "Ko'rildi" },
  { value: "hal_qilindi", label: 'Hal qilindi' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    loadAlerts().then(res => setAlerts(res.data));
  }, []);

  const filtered = alerts.filter(a => {
    return (!typeFilter || a.type === typeFilter)
      && (!severityFilter || a.severity === severityFilter)
      && (!statusFilter || a.status === statusFilter);
  });

  const newCount = alerts.filter(a => a.status === 'yangi').length;
  const highCount = alerts.filter(a => a.severity === 'yuqori').length;

  const getSeverityIcon = (severity: string) => {
    if (severity === 'yuqori') return <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />;
    if (severity === "o'rta") return <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />;
    return <div className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-sky-500/20" />;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Ogohlantirishlar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tizim tomonidan aniqlangan barcha ogohlantirish va anomaliyalar</p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-danger">{newCount} yangi</span>
          <span className="badge badge-warning">{highCount} yuqori xavf</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field text-sm">
            {typeFilters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="input-field text-sm">
            {severityFilters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm">
            {statusFilters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.map(alert => (
          <div
            key={alert.id}
            className={`bg-white border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer ${
              alert.status === 'yangi' ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'
            }`}
            onClick={() => setSelectedAlert(alert)}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-semibold text-slate-800">{alert.message}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <StatusBadge status={alert.severity} size="sm" />
                  <StatusBadge status={alert.status} size="sm" />
                  <span className="badge badge-neutral">{getAlertTypeLabel(alert.type)}</span>
                </div>
                <div className="flex items-center gap-4 text-[12px] text-slate-400">
                  <span className="font-medium text-indigo-600">{alert.vehicle_code}</span>
                  <span>{formatDateTime(alert.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {alert.status === 'yangi' && (
                  <button className="btn btn-ghost btn-sm text-amber-600 hover:bg-amber-50" onClick={e => e.stopPropagation()}>
                    <Eye size={14} />
                    Ko&apos;rildi
                  </button>
                )}
                {alert.status !== "hal_qilindi" && (
                  <button className="btn btn-ghost btn-sm text-emerald-600 hover:bg-emerald-50" onClick={e => e.stopPropagation()}>
                    <CheckCircle size={14} />
                    Hal qilish
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
          <Bell size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-400">Ogohlantirish topilmadi</p>
        </div>
      )}

      {/* Alert detail modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Ogohlantirish tafsilotlari"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {getSeverityIcon(selectedAlert.severity)}
              <h3 className="text-base font-semibold text-slate-800">{selectedAlert.message}</h3>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={selectedAlert.severity} />
              <StatusBadge status={selectedAlert.status} />
              <span className="badge badge-neutral">{getAlertTypeLabel(selectedAlert.type)}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{selectedAlert.details}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-slate-400">Transport</span>
                <p className="font-semibold text-indigo-600">{selectedAlert.vehicle_code}</p>
              </div>
              <div>
                <span className="text-slate-400">Vaqt</span>
                <p className="font-medium text-slate-700">{formatDateTime(selectedAlert.created_at)}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn btn-secondary flex-1" onClick={() => setSelectedAlert(null)}>Yopish</button>
              {selectedAlert.status !== "hal_qilindi" && (
                <button className="btn btn-primary flex-1">
                  <CheckCircle size={15} />
                  Hal qilindi deb belgilash
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
