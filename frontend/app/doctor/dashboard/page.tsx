'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, MessageSquare, FileText, User, LayoutDashboard, Clock, ChevronRight, CheckCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments').then(r => setAppointments(r.data.appointments || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = appointments.filter(a => {
    const d = new Date(a.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const pending = appointments.filter(a => a.status === 'pending');
  const completed = appointments.filter(a => a.status === 'completed');
  const revenue = completed.reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <DashboardLayout navItems={NAV} title="Tableau de bord médecin">
      <div className="space-y-6">
        <div className="gradient-bg rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
          <div className="relative">
            <p className="text-sky-100 mb-1">Bienvenue,</p>
            <h2 className="text-3xl font-bold mb-2" style={{fontFamily:'Sora,sans-serif'}}>Dr. {user?.firstName} {user?.lastName}</h2>
            <p className="text-sky-100">{today.length > 0 ? `Vous avez ${today.length} rendez-vous aujourd'hui` : "Aucun rendez-vous aujourd'hui"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Aujourd'hui", value: today.length, icon: <Calendar className="w-5 h-5" />, color: 'bg-sky-50 text-sky-600', href: '/doctor/appointments' },
            { label: 'En attente', value: pending.length, icon: <Clock className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600', href: '/doctor/appointments' },
            { label: 'Terminées', value: completed.length, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600', href: '/doctor/consultations' },
            { label: 'Revenus (FCFA)', value: revenue.toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, color: 'bg-violet-50 text-violet-600', href: '/doctor/dashboard' },
          ].map(s => (
            <Link key={s.label} href={s.href} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>{loading ? '—' : s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>Rendez-vous du jour</h3>
            <Link href="/doctor/appointments" className="text-sky-600 text-sm hover:underline flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {loading ? <div className="space-y-3">{[...Array(2)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          : today.length === 0 ? (
            <div className="text-center py-8"><Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">Aucun rendez-vous aujourd'hui</p></div>
          ) : today.map((a: any) => (
            <div key={a._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-3 hover:bg-sky-50 transition-colors">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 font-bold text-sm flex-shrink-0">
                {a.patient?.firstName?.[0]}{a.patient?.lastName?.[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{a.patient?.firstName} {a.patient?.lastName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{a.timeSlot?.start}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status]}</span>
                {a.status === 'ongoing' && (
                  <Link href={`/consultation/${a._id}`} className="gradient-bg text-white text-xs px-3 py-1.5 rounded-lg font-medium">Rejoindre</Link>
                )}
                {a.status === 'confirmed' && (
                  <button onClick={async () => {
                    await api.put(`/appointments/${a._id}/status`, { status: 'ongoing' });
                    setAppointments(prev => prev.map(x => x._id === a._id ? {...x, status:'ongoing'} : x));
                  }} className="bg-sky-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-sky-600">Démarrer</button>
                )}
                {a.status === 'pending' && (
                  <button onClick={async () => {
                    await api.put(`/appointments/${a._id}/status`, { status: 'confirmed' });
                    setAppointments(prev => prev.map(x => x._id === a._id ? {...x, status:'confirmed'} : x));
                  }} className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-600">Confirmer</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
