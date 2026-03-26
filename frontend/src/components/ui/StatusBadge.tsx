import { getStatusLabel, getStatusColor } from '@/data/mockData';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <span className={`badge ${colorClass} ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : ''}`}>
      {label}
    </span>
  );
}
