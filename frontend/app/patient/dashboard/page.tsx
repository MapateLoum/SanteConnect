'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, FileText, MessageSquare, Brain, User, LayoutDashboard, History, CreditCard, ChevronRight, Clock, Stethoscope, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NAV = [
  { href: '/patient/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/patient/triage', label: 'Triage IA', icon: <Brain className="w-4 h-4" /> },
  { href: '/patient/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/patient/appointments', label: 'Mes rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/patient/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/patient/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/patient/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  completed: 'badge-completed', cancelled: 'badge-cancelled', ongoing: 'badge-ongoing',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmé',
  completed: 'Terminé', cancelled: 'Annulé', ongoing: 'En cours',
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments?upcoming=true').catch(() => ({ data: { appointments: [] } })),
      api.get('/prescriptions/my').catch(() => ({ data: { prescriptions: [] } })),
    ]).then(([a, p]) => {
      setAppointments(a.data.appointments?.slice(0, 3) || []);
      setPrescriptions(p.data.prescriptions?.slice(0, 3) || []);
    }).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <DashboardLayout navItems={NAV} title="Mon espace patient">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="gradient-bg rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
          <div className="relative">
            <p className="text-sky-100 mb-1">{greeting} 👋</p>
            <h2 className="text-3xl font-bold mb-2" style={{fontFamily:'Sora,sans-serif'}}>{user?.firstName} {user?.lastName}</h2>
            <p className="text-sky-100 mb-6">Comment vous sentez-vous aujourd'hui ?</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/patient/triage" className="bg-white text-sky-600 font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4" /> Analyser mes symptômes
              </Link>
              <Link href="/patient/doctors" className="bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 text-sm">
                <Stethoscope className="w-4 h-4" /> Trouver un médecin
              </Link>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'RDV à venir', value: appointments.length, icon: <Calendar className="w-5 h-5" />, color: 'bg-sky-50 text-sky-600', href: '/patient/appointments' },
            { label: 'Ordonnances', value: prescriptions.length, icon: <FileText className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600', href: '/patient/prescriptions' },
            { label: 'Consultations', value: 0, icon: <MessageSquare className="w-5 h-5" />, color: 'bg-violet-50 text-violet-600', href: '/patient/consultations' },
            { label: 'Profil', value: '100%', icon: <CheckCircle className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600', href: '/patient/profile' },
          ].map(s => (
            <Link key={s.label} href={s.href} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>{loading ? '—' : s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>Prochains rendez-vous</h3>
              <Link href="/patient/appointments" className="text-sky-600 text-sm hover:underline flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(2)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun rendez-vous à venir</p>
                <Link href="/patient/doctors" className="text-sky-600 text-sm mt-2 inline-block hover:underline">Prendre un rendez-vous →</Link>
              </div>
            ) : appointments.map((a: any) => (
              <div key={a._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-3 hover:bg-sky-50 transition-colors">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {a.doctor?.user?.firstName?.[0]}{a.doctor?.user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(a.date), 'dd MMM yyyy', {locale: fr})} à {a.timeSlot?.start}
                  </p>
                </div>
                <span className={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status]}</span>
              </div>
            ))}
          </div>

          {/* Prescriptions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>Dernières ordonnances</h3>
              <Link href="/patient/prescriptions" className="text-sky-600 text-sm hover:underline flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(2)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune ordonnance pour l'instant</p>
              </div>
            ) : prescriptions.map((p: any) => (
              <div key={p._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-3 hover:bg-emerald-50 transition-colors">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">Dr. {p.doctor?.user?.firstName} {p.doctor?.user?.lastName}</p>
                  <p className="text-xs text-gray-500">{format(new Date(p.createdAt), 'dd MMM yyyy', {locale: fr})} · {p.medications?.length} médicament(s)</p>
                </div>
                <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/prescriptions/${p._id}/pdf`} target="_blank"
                  className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-200 transition-colors font-medium">PDF</a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4" style={{fontFamily:'Sora,sans-serif'}}>Actions rapides</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: '/patient/triage', icon: <Brain className="w-6 h-6" />, label: 'Triage IA', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
              { href: '/patient/doctors', icon: <Stethoscope className="w-6 h-6" />, label: 'Médecins', color: 'bg-sky-50 text-sky-600 hover:bg-sky-100' },
              { href: '/patient/consultations', icon: <MessageSquare className="w-6 h-6" />, label: 'Consultations', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
              { href: '/patient/profile', icon: <User className="w-6 h-6" />, label: 'Mon profil', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
            ].map(a => (
              <Link key={a.href} href={a.href} className={`${a.color} rounded-2xl p-5 flex flex-col items-center gap-3 transition-colors text-center`}>
                {a.icon}
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
