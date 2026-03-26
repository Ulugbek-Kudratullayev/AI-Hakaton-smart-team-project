'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Truck, ClipboardList, Wrench,
  AlertTriangle, BarChart3, Settings, X, ChevronLeft, Shield,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { href: '/vehicles', label: 'Avtotransport', icon: Truck },
  { href: '/tasks', label: 'Vazifalar', icon: ClipboardList },
  { href: '/maintenance', label: 'Texnik xizmat', icon: Wrench },
  { href: '/alerts', label: 'Ogohlantirishlar', icon: AlertTriangle },
  { href: '/analytics', label: 'Tahlillar', icon: BarChart3 },
  { href: '/settings', label: 'Sozlamalar', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        style={{
          width: collapsed ? 72 : 256,
          minWidth: collapsed ? 72 : 256,
          background: '#1e293b',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: isOpen ? 'fixed' : undefined,
          top: 0,
          left: 0,
          zIndex: isOpen ? 50 : undefined,
          transition: 'width 0.2s ease, min-width 0.2s ease',
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
        className={`${!isOpen ? 'max-lg:hidden' : ''}`}
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 64,
          padding: collapsed ? '0 16px' : '0 20px',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
          }}>
            <Shield size={18} color="#fff" />
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Transport Nazorati</div>
              <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.2, marginTop: 2 }}>Hokimiyat AI tizimi</div>
            </div>
          )}
          {isOpen && (
            <button onClick={onClose} className="lg:hidden" style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : '#94a3b8',
                  background: active ? '#4f46e5' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  boxShadow: active ? '0 4px 12px rgba(79,70,229,0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="max-lg:hidden" style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onToggleCollapse}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: collapsed ? '8px 0' : '8px 14px',
              borderRadius: 8, fontSize: 12, color: '#64748b',
              background: 'transparent', border: 'none', cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
          >
            <ChevronLeft size={16} style={{ transition: 'transform 0.2s', transform: collapsed ? 'rotate(180deg)' : 'none' }} />
            {!collapsed && <span>Yig&#39;ish</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
