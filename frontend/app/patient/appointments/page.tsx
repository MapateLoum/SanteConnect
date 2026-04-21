'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, Brain, FileText, MessageSquare, User, LayoutDashboard, Stethoscope, Clock, ChevronRight, X } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

const NAV = [
  { href: '/patient/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/patient/triage', label: 'Triage IA', icon: <Brain className="w-4 h-4" /> },
  { href: '/patient/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/patient/appointments', label: 'Mes rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/patient/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/patient/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/patient/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

const STATUS_BADGE: Record<string,string> = { pending:'badge-pending', confirmed:'badge-confirmed', completed:'badge-completed', cancelled:'badge-cancelled', ongoing:'badge-ongoing' };
const STATUS_LABEL: Record<string,string> = { pending:'En attente', confirmed:'Confirmé', completed:'Terminé', cancelled:'Annulé', ongoing:'En cours' };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/appointments').then(r => setAppointments(r.data.appointments || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const cancel = async (id: string) => {
    if (!confirm('Annuler ce rendez-vous ?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`, { reason: 'Annulé par le patient' });
      toast.success('Rendez-vous annulé');
      load();
    } catch { toast.error('Erreur'); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <DashboardLayout navItems={NAV} title="Mes rendez-vous">
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {[['all','Tous'],['pending','En attente'],['confirmed','Confirmés'],['completed','Terminés'],['cancelled','Annulés']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter===v ? 'gradient-bg text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300'}`}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucun rendez-vous</p>
            <Link href="/patient/doctors" className="text-sky-600 text-sm mt-2 inline-block hover:underline">Prendre un rendez-vous →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a: any) => (
              <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {a.doctor?.user?.firstName?.[0]}{a.doctor?.user?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}</h4>
                  <p className="text-sky-600 text-sm">{a.doctor?.specialty}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" />{format(new Date(a.date), 'dd MMMM yyyy', {locale:fr})}
                    <Clock className="w-3.5 h-3.5 ml-2" />{a.timeSlot?.start} — {a.timeSlot?.end}
                  </p>
                  {a.symptoms && <p className="text-gray-400 text-xs mt-1 truncate">Symptômes : {a.symptoms}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status]}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${a.paymentStatus==='paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {a.paymentStatus==='paid' ? '✓ Payé' : `${a.amount?.toLocaleString()} FCFA`}
                  </span>
                  {a.status === 'ongoing' && (
                    <Link href={`/consultation/${a._id}`} className="gradient-bg text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1">
                      Rejoindre <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                  {['pending','confirmed'].includes(a.status) && (
                    <button onClick={() => cancel(a._id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
