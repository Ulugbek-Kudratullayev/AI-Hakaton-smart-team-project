'use client';

import { useState } from 'react';
import { Search, Bell, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { alerts } from '@/data/mockData';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const newAlerts = alerts.filter(a => a.status === 'yangi');

  return (
    <header style={{
      height: 64,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' }}
        >
          <Menu size={20} />
        </button>
        <div className="max-sm:hidden" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '8px 14px', width: '100%', maxWidth: 400,
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Qidirish... (transport, vazifa, haydovchi)"
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: '#334155', width: '100%', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            style={{
              padding: 8, borderRadius: 8, background: 'transparent',
              border: 'none', cursor: 'pointer', color: '#475569', position: 'relative',
            }}
          >
            <Bell size={19} />
            {newAlerts.length > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 16, height: 16, background: '#ef4444', borderRadius: '50%',
                fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700,
              }}>
                {newAlerts.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="animate-fade-in" style={{
              position: 'absolute', right: 0, top: 48, width: 320,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              zIndex: 50,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Bildirishnomalar</span>
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {newAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} style={{
                    padding: '10px 16px', borderBottom: '1px solid #f8fafc',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <p style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{alert.message}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      {alert.vehicle_code} · {new Date(alert.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 16px', borderTop: '1px solid #f1f5f9' }}>
                <a href="/alerts" style={{ fontSize: 12, color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>
                  Barcha ogohlantirishlarni ko&#39;rish →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px',
              borderRadius: 10, background: 'transparent', border: 'none',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 34, height: 34, background: '#eef2ff', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={16} color="#4f46e5" />
            </div>
            <div className="max-md:hidden" style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>Admin</p>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Dispetcher</p>
            </div>
            <ChevronDown size={14} color="#94a3b8" className="max-md:hidden" />
          </button>
          {showProfile && (
            <div className="animate-fade-in" style={{
              position: 'absolute', right: 0, top: 48, width: 200,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 50,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Admin Foydalanuvchi</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>admin@hokimiyat.uz</p>
              </div>
              <div style={{ padding: 4 }}>
                <a href="/settings" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  fontSize: 13, color: '#475569', textDecoration: 'none', borderRadius: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <User size={15} /> Profil
                </a>
                <a href="/login" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  fontSize: 13, color: '#ef4444', textDecoration: 'none', borderRadius: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={15} /> Chiqish
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {(showProfile || showNotifications) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => { setShowProfile(false); setShowNotifications(false); }}
        />
      )}
    </header>
  );
}
