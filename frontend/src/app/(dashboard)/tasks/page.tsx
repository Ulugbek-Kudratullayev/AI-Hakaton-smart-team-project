'use client';

import { useState, useEffect } from 'react';
import { Plus, ClipboardList, Star, ChevronRight, Truck, Calendar, MapPin } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { tasks as mockTasks, getStatusLabel, formatDateTime } from '@/data/mockData';
import { loadTasks } from '@/lib/loaders';
import type { Task } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeTab, setActiveTab] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(mockTasks[0]);

  useEffect(() => {
    loadTasks().then(res => {
      setTasks(res.data);
      if (res.data.length > 0) setSelectedTask(res.data[0]);
    });
  }, []);

  const statusTabs = [
    { value: '', label: 'Barchasi', count: tasks.length },
    { value: 'rejalashtirilgan', label: 'Rejalashtirilgan', count: tasks.filter(t => t.status === 'rejalashtirilgan').length },
    { value: 'jarayonda', label: 'Jarayonda', count: tasks.filter(t => t.status === 'jarayonda').length },
    { value: 'bajarildi', label: 'Bajarildi', count: tasks.filter(t => t.status === 'bajarildi').length },
  ];

  const filtered = activeTab ? tasks.filter(t => t.status === activeTab) : tasks;

  const getPriorityIcon = (priority: string) => {
    if (priority === 'yuqori') return <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />;
    if (priority === "o'rta") return <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />;
    return <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Vazifalar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Transport uchun topshiriqlar va tayinlovlar</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} />
          Yangi vazifa
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1.5 overflow-x-auto">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${
              activeTab === tab.value
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-[11px] ${activeTab === tab.value ? 'text-indigo-200' : 'text-slate-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.map(task => (
          <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityIcon(task.priority)}
                  <h3 className="text-[15px] font-semibold text-slate-800">{task.title}</h3>
                  <StatusBadge status={task.status} size="sm" />
                  <StatusBadge status={task.priority} size="sm" />
                </div>
                <p className="text-[13px] text-slate-500 mt-1">{task.description}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-[12px] text-slate-400">
                  <span className="flex items-center gap-1"><ClipboardList size={13} /> {task.type}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} /> {task.district}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} /> {formatDateTime(task.scheduled_start)}</span>
                  {task.assigned_vehicle_code && (
                    <span className="flex items-center gap-1"><Truck size={13} /> {task.assigned_vehicle_code}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {!task.assigned_vehicle && (
                  <button
                    onClick={() => { setSelectedTask(task); setShowRecommendModal(true); }}
                    className="btn btn-primary btn-sm"
                  >
                    <Star size={14} />
                    AI tayinlash
                  </button>
                )}
                <button className="btn btn-secondary btn-sm">
                  Batafsil
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Yangi vazifa yaratish">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vazifa nomi</label>
            <input type="text" placeholder="Vazifa nomini kiriting" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tur</label>
              <select className="input-field">
                <option>Qishloq xo&apos;jalik</option>
                <option>Kommunal</option>
                <option>Qurilish</option>
                <option>Transport</option>
                <option>Ekologiya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Muhimlik</label>
              <select className="input-field">
                <option>Yuqori</option>
                <option>O&apos;rta</option>
                <option>Past</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tuman</label>
            <input type="text" placeholder="Tumanni kiriting" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Boshlanish</label>
              <input type="datetime-local" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tugash</label>
              <input type="datetime-local" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tavsif</label>
            <textarea rows={3} placeholder="Vazifa haqida qisqacha ma'lumot" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary flex-1">Bekor qilish</button>
            <button type="submit" className="btn btn-primary flex-1">Yaratish</button>
          </div>
        </form>
      </Modal>

      {/* AI Recommend Modal */}
      <Modal
        isOpen={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        title="AI — Transport tavsiyasi"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <p className="text-sm text-indigo-800 font-medium">{selectedTask?.title}</p>
            <p className="text-xs text-indigo-600 mt-1">{selectedTask?.district} · {selectedTask?.type}</p>
          </div>

          <p className="text-sm text-slate-600">
            AI tizimi quyidagi transportlarni tavsiya qilmoqda:
          </p>

          <div className="space-y-3">
            {selectedTask?.recommended_vehicles.map((rv, i) => (
              <div key={rv.vehicle_id} className={`border rounded-xl p-4 transition-all ${i === 0 ? 'border-indigo-300 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">TAVSIYA</span>}
                    <span className="text-[15px] font-bold text-slate-800">{rv.vehicle_code}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`text-lg font-bold ${rv.score >= 90 ? 'text-emerald-600' : rv.score >= 80 ? 'text-indigo-600' : 'text-amber-600'}`}>
                      {rv.score}
                    </div>
                    <span className="text-[11px] text-slate-400">/100</span>
                  </div>
                </div>
                <p className="text-[13px] text-slate-600">{rv.reason}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1">Tayinlash</button>
                  <button className="btn btn-secondary btn-sm">Batafsil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
