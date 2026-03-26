interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, action, className = '' }: ChartCardProps) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }} className={className}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
      }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ padding: 20 }}>
        {children}
      </div>
    </div>
  );
}
