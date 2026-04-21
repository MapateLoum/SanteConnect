'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, MessageSquare, FileText, User, LayoutDashboard, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NAV = [
  { href: '/doctor/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/doctor/appointments', label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/doctor/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/doctor/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/doctor/schedule', label: 'Mon agenda', icon: <Clock className="w-4 h-4" /> },
  { href: '/doctor/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

const STATUS_BADGE: Record<string,string> = { pending:'badge-pending', confirmed:'badge-confirmed', completed:'badge-completed', cancelled:'badge-cancelled', ongoing:'badge-ongoing' };
const STATUS_LABEL: Record<string,string> = { pending:'En attente', confirmed:'Confirmé', completed:'Terminé', cancelled:'Annulé', ongoing:'En cours' };

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/appointments').then(r => setAppointments(r.data.appointments || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? {...a, status} : a));
      toast.success(`Statut mis à jour`);
    } catch { toast.error('Erreur'); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <DashboardLayout navItems={NAV} title="Rendez-vous">
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {[['all','Tous'],['pending','En attente'],['confirmed','Confirmés'],['ongoing','En cours'],['completed','Terminés']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter===v ? 'gradient-bg text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300'}`}>{l}</button>
          ))}
        </div>
        {loading ? <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" /><p className="text-gray-500">Aucun rendez-vous</p></div>
        ) : filtered.map((a: any) => (
          <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-700 font-bold flex-shrink-0">
              {a.patient?.firstName?.[0]}{a.patient?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{a.patient?.firstName} {a.patient?.lastName}</h4>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />{format(new Date(a.date), 'dd MMMM yyyy', {locale:fr})}
                <Clock className="w-3.5 h-3.5 ml-2" />{a.timeSlot?.start}
              </p>
              {a.symptoms && <p className="text-gray-400 text-xs mt-0.5 truncate">Symptômes : {a.symptoms}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status]}</span>
              {a.status === 'pending' && <button onClick={() => updateStatus(a._id, 'confirmed')} className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-600">Confirmer</button>}
              {a.status === 'confirmed' && <button onClick={() => updateStatus(a._id, 'ongoing')} className="gradient-bg text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90">Démarrer</button>}
              {a.status === 'ongoing' && <Link href={`/consultation/${a._id}`} className="gradient-bg text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">Rejoindre <ChevronRight className="w-3 h-3" /></Link>}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
