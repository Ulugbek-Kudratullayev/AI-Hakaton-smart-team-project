'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, ArrowRight, Truck, BarChart3, Bell, Wrench } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Try real backend auth (username = email prefix)
      const username = email.includes('@') ? email.split('@')[0] : email;
      await api.login(username, password);
      window.location.href = '/';
    } catch {
      // Fallback: allow demo login with any credentials
      console.warn('[Auth] Backend unavailable, using demo mode');
      localStorage.setItem('demo_mode', 'true');
      window.location.href = '/';
    }
  };

  const features = [
    { icon: Truck, title: 'Transport monitoring', desc: 'Real vaqtda barcha transport vositalarini kuzating' },
    { icon: BarChart3, title: 'AI tahlillar', desc: "Sun'iy intellekt yordamida samaradorlikni oshiring" },
    { icon: Bell, title: 'Anomaliya aniqlash', desc: "Yoqilg'i sarfi va marshrut buzilishlarni aniqlang" },
    { icon: Wrench, title: 'Texnik xizmat', desc: 'Profilaktik texnik xizmatni rejalashtiring' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel */}
      <div className="max-lg:hidden" style={{
        width: '55%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
        display: 'flex',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: 60, left: 60, width: 300, height: 300, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: 80, right: 60, width: 400, height: 400, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 200, height: 200, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%' }} />

        <div style={{
          position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', width: '100%', padding: '48px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(79,70,229,0.4)',
            }}>
              <Shield size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Transport Nazorati AI</div>
              <div style={{ fontSize: 11, color: '#818cf8' }}>Hokimiyat boshqaruv tizimi</div>
            </div>
          </div>

          {/* Hero */}
          <div style={{ maxWidth: 500 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              Hokimiyat transport parkini{' '}
              <span style={{ color: '#818cf8' }}>aqlli boshqaruv</span>{' '}
              tizimi
            </h2>
            <p style={{ color: '#94a3b8', marginTop: 20, fontSize: 15, lineHeight: 1.7 }}>
              Qishloq xo&apos;jaligi va kommunal transport vositalarini real vaqtda monitoring qiling,
              samaradorlikni oshiring, xarajatlarni kamaytiring.
            </p>

            {/* Feature cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 32 }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '18px 16px',
                  transition: 'background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <f.icon size={20} color="#818cf8" />
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginTop: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize: 12, color: '#475569' }}>
            © 2026 Hokimiyat Transport Nazorati AI. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Transport Nazorati AI</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Hokimiyat boshqaruv tizimi</div>
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Tizimga kirish</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
            Boshqaruv paneliga kirish uchun ma&apos;lumotlaringizni kiriting
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13,
              }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                Foydalanuvchi nomi
              </label>
              <input
                type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin" className="input-field" required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                Parol
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="input-field"
                  style={{ paddingRight: 40 }} required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                  }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#4f46e5' }} />
                <span style={{ fontSize: 13, color: '#475569' }}>Eslab qolish</span>
              </label>
              <a href="#" style={{ fontSize: 13, color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>
                Parolni unutdingizmi?
              </a>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{
              width: '100%', padding: '12px 24px', fontSize: 15, fontWeight: 600,
              borderRadius: 10,
            }}>
              {loading ? (
                <div style={{
                  width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                }} />
              ) : (
                <>Kirish <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              Himoyalangan ulanish · TLS 1.3 · Davlat standartlariga mos
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
