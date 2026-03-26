'use client';

import { Download, TrendingUp, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartCard from '@/components/ui/ChartCard';
import {
  efficiencyTrend, fuelUsageByDepartment, vehicleUtilization,
  anomalyDistribution, maintenanceRiskDistribution, vehiclesByDepartment
} from '@/data/mockData';

const monthlyEfficiency = [
  { month: 'Sen', dept1: 72, dept2: 68, dept3: 75 },
  { month: 'Okt', dept1: 75, dept2: 70, dept3: 73 },
  { month: 'Noy', dept1: 78, dept2: 72, dept3: 76 },
  { month: 'Dek', dept1: 74, dept2: 74, dept3: 78 },
  { month: 'Yan', dept1: 76, dept2: 75, dept3: 80 },
  { month: 'Fev', dept1: 80, dept2: 77, dept3: 82 },
  { month: 'Mar', dept1: 78, dept2: 79, dept3: 81 },
];

const maintenanceTrend = [
  { month: 'Sen', risk: 45 },
  { month: 'Okt', risk: 52 },
  { month: 'Noy', risk: 48 },
  { month: 'Dek', risk: 55 },
  { month: 'Yan', risk: 42 },
  { month: 'Fev', risk: 38 },
  { month: 'Mar', risk: 35 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tahlillar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Transport parki samaradorligi va ko&apos;rsatkichlari</p>
        </div>
        <div className="flex gap-2">
          <select className="input-field w-auto text-sm">
            <option>So&apos;nggi 7 kun</option>
            <option>So&apos;nggi 30 kun</option>
            <option>So&apos;nggi 3 oy</option>
            <option>So&apos;nggi 6 oy</option>
          </select>
          <button className="btn btn-secondary btn-sm">
            <Download size={15} />
            Hisobot
          </button>
        </div>
      </div>

      {/* Row 1: Efficiency comparison + Fuel usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Bo'limlar bo'yicha samaradorlik"
          subtitle="So'nggi 7 oy taqqoslash"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[60, 90]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="dept1" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} name="Qishloq xo'jaligi" />
              <Line type="monotone" dataKey="dept2" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Kommunal" />
              <Line type="monotone" dataKey="dept3" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} name="Yo'l-transport" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Yoqilg'i sarfi"
          subtitle="Bo'limlar bo'yicha (litr)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fuelUsageByDepartment} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="usage" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Sarflangan" barSize={24} />
              <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Byudjet" barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Utilization + Anomaly distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Transport foydalanish darajasi"
          subtitle="Hafta kunlari bo'yicha (%)"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vehicleUtilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]} name="Foydalanish %" barSize={32}>
                {vehicleUtilization.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rate >= 80 ? '#10b981' : entry.rate >= 50 ? '#f59e0b' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Anomaliya taqsimoti"
          subtitle="Tur bo'yicha"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={anomalyDistribution}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {anomalyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Maintenance risk trend + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Texnik xizmat xavfi tendensiyasi"
            subtitle="O'rtacha xavf ko'rsatkichi (%)"
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={maintenanceTrend}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[20, 60]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Area type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2.5} fill="url(#riskGrad)" name="Xavf %" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Summary card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800">Oylik xulosa</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-500">Umumiy samaradorlik</span>
              <span className="text-[14px] font-bold text-emerald-600">78% ↑</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-500">Yoqilg&apos;i tejash</span>
              <span className="text-[14px] font-bold text-emerald-600">12%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-500">Vazifa bajarilishi</span>
              <span className="text-[14px] font-bold text-indigo-600">88%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-500">TX xavfi</span>
              <span className="text-[14px] font-bold text-amber-600">35% ↓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-500">Anomaliyalar</span>
              <span className="text-[14px] font-bold text-rose-600">50 ta</span>
            </div>
            <hr className="border-slate-100" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-500 font-medium">Umumiy baho</span>
              <span className="text-[15px] font-bold text-emerald-600">Yaxshi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
