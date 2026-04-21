'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, MessageSquare, FileText, User, LayoutDashboard, Clock, Save, Check } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/doctor/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/doctor/appointments', label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/doctor/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/doctor/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/doctor/schedule', label: 'Mon agenda', icon: <Clock className="w-4 h-4" /> },
  { href: '/doctor/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

const DAYS: [string, string][] = [['monday','Lundi'],['tuesday','Mardi'],['wednesday','Mercredi'],['thursday','Jeudi'],['friday','Vendredi'],['saturday','Samedi'],['sunday','Dimanche']];
const defaultHours = { start:'08:00', end:'17:00', active: false };

export default function SchedulePage() {
  const [hours, setHours] = useState<Record<string,{start:string;end:string;active:boolean}>>(
    Object.fromEntries(DAYS.map(([k]) => [k, {...defaultHours, active: !['saturday','sunday'].includes(k)}]))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(r => {
      if (r.data.doctorProfile?.workingHours) setHours(r.data.doctorProfile.workingHours);
    }).catch(() => {});
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await api.put('/doctors/profile', { workingHours: hours });
      toast.success('Agenda mis à jour');
    } catch { toast.error('Erreur'); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout navItems={NAV} title="Mon agenda">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-5" style={{fontFamily:'Sora,sans-serif'}}>Horaires de consultation</h3>
          <div className="space-y-3">
            {DAYS.map(([key, label]) => (
              <div key={key} className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${hours[key]?.active ? 'bg-sky-50' : 'bg-gray-50'}`}>
                <input type="checkbox" id={key} checked={hours[key]?.active||false}
                  onChange={e => setHours(h => ({...h, [key]: {...h[key], active: e.target.checked}}))}
                  className="w-4 h-4 text-sky-500 rounded" />
                <label htmlFor={key} className="w-24 text-sm font-medium text-gray-700 cursor-pointer">{label}</label>
                {hours[key]?.active ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input type="time" value={hours[key]?.start||'08:00'}
                      onChange={e => setHours(h => ({...h, [key]: {...h[key], start: e.target.value}}))}
                      className="input-field py-2 flex-1" />
                    <span className="text-gray-400">—</span>
                    <input type="time" value={hours[key]?.end||'17:00'}
                      onChange={e => setHours(h => ({...h, [key]: {...h[key], end: e.target.value}}))}
                      className="input-field py-2 flex-1" />
                  </div>
                ) : <span className="text-gray-400 text-sm flex-1">Indisponible</span>}
              </div>
            ))}
          </div>
          <button onClick={save} disabled={loading} className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl mt-5 hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" />Sauvegarder l'agenda</>}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
