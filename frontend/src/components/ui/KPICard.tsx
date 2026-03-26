import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}

const colorMap: Record<string, { iconBg: string; iconShadow: string }> = {
  indigo: { iconBg: 'linear-gradient(135deg, #6366f1, #4f46e5)', iconShadow: 'rgba(79,70,229,0.3)' },
  emerald: { iconBg: 'linear-gradient(135deg, #34d399, #059669)', iconShadow: 'rgba(5,150,105,0.3)' },
  amber: { iconBg: 'linear-gradient(135deg, #fbbf24, #d97706)', iconShadow: 'rgba(217,119,6,0.3)' },
  rose: { iconBg: 'linear-gradient(135deg, #fb7185, #e11d48)', iconShadow: 'rgba(225,29,72,0.3)' },
  sky: { iconBg: 'linear-gradient(135deg, #38bdf8, #0284c7)', iconShadow: 'rgba(2,132,199,0.3)' },
  violet: { iconBg: 'linear-gradient(135deg, #a78bfa, #7c3aed)', iconShadow: 'rgba(124,58,237,0.3)' },
};

export default function KPICard({ title, value, icon: Icon, trend, color }: KPICardProps) {
  const c = colorMap[color];
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      padding: '20px 20px 18px',
      transition: 'box-shadow 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1 }}>
            {value}
          </p>
          {trend && (
            <p style={{
              fontSize: 12, marginTop: 8, fontWeight: 500,
              color: trend.value >= 0 ? '#059669' : '#e11d48',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% <span style={{ color: '#94a3b8', marginLeft: 2 }}>{trend.label}</span>
            </p>
          )}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: c.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${c.iconShadow}`,
          flexShrink: 0,
        }}>
          <Icon size={20} color="#ffffff" />
        </div>
      </div>
    </div>
  );
}
