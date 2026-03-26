'use client';

import { User, Bell, Shield, Globe, Palette, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Sozlamalar</h1>
        <p className="text-sm text-slate-500 mt-0.5">Tizim sozlamalari va foydalanuvchi profili</p>
      </div>

      {/* Profile section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-indigo-500" />
          <h2 className="text-base font-semibold text-slate-800">Profil ma&apos;lumotlari</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ism</label>
            <input type="text" defaultValue="Admin Foydalanuvchi" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Elektron pochta</label>
            <input type="email" defaultValue="admin@hokimiyat.uz" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lavozim</label>
            <input type="text" defaultValue="Dispetcher" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bo&apos;lim</label>
            <input type="text" defaultValue="Transport bo'limi" className="input-field" />
          </div>
        </div>
        <div className="mt-4">
          <button className="btn btn-primary btn-sm">Saqlash</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-amber-500" />
          <h2 className="text-base font-semibold text-slate-800">Bildirishnomalar</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Anomaliya aniqlanganda', desc: 'Yoqilg\'i, tezlik va marshrut buzilishlari', checked: true },
            { label: 'Texnik xizmat muddati yaqinlashganda', desc: '3 kun oldin eslatma', checked: true },
            { label: 'Yangi vazifa tayinlanganda', desc: 'Dispetcherga bildirishnoma', checked: false },
            { label: 'Haftalik hisobot', desc: 'Har dushanbada', checked: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <p className="text-[13px] font-medium text-slate-700">{item.label}</p>
                <p className="text-[12px] text-slate-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* System info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Database size={18} className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-800">Tizim ma&apos;lumotlari</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
          <div>
            <span className="text-slate-400">Versiya</span>
            <p className="font-semibold text-slate-700 mt-0.5">v1.0.0-beta</p>
          </div>
          <div>
            <span className="text-slate-400">API holati</span>
            <p className="font-semibold text-emerald-600 mt-0.5">● Faol</p>
          </div>
          <div>
            <span className="text-slate-400">Til</span>
            <p className="font-semibold text-slate-700 mt-0.5">O&apos;zbek</p>
          </div>
          <div>
            <span className="text-slate-400">Oxirgi sinxronizatsiya</span>
            <p className="font-semibold text-slate-700 mt-0.5">17:38</p>
          </div>
        </div>
      </div>
    </div>
  );
}
