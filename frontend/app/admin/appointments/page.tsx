'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Users, Stethoscope, Calendar, Clock } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NAV = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/admin/patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/appointments', label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" /> },
];

const STATUS_BADGE: Record<string, string> = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled', ongoing: 'badge-ongoing' };
const STATUS_LABEL: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé', ongoing: 'En cours' };

export default function AdminAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.replace('/auth/login');
      else if (user.role !== 'admin') router.replace(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/admin/appointments').then(r => setAppointments(r.data.appointments || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user || user.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <DashboardLayout navItems={NAV} title="Tous les rendez-vous">
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {[['all', 'Tous'], ['pending', 'En attente'], ['confirmed', 'Confirmés'], ['ongoing', 'En cours'], ['completed', 'Terminés'], ['cancelled', 'Annulés']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === v ? 'gradient-bg text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300'}`}>{l}</button>
          ))}
        </div>
        {loading
          ? <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
          : filtered.length === 0
            ? <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" /><p className="text-gray-500">Aucun rendez-vous</p></div>
            : filtered.map((a: any) => (
              <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                  {a.patient?.firstName?.[0]}{a.patient?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{a.patient?.firstName} {a.patient?.lastName}</p>
                  <p className="text-sm text-sky-600">Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />{format(new Date(a.date), 'dd MMMM yyyy', { locale: fr })}
                    <Clock className="w-3.5 h-3.5 ml-1" />{a.timeSlot?.start}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status]}</span>
                  <span className="text-sm font-medium text-gray-600">{a.amount?.toLocaleString()} FCFA</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${a.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {a.paymentStatus === 'paid' ? 'Payé' : 'Non payé'}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </DashboardLayout>
  );
}