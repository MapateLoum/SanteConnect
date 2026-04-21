'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Users, Stethoscope, Calendar, TrendingUp, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import api from '@/lib/api';

const NAV = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/admin/patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/appointments', label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" /> },
];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.replace('/auth/login');
      else if (user.role !== 'admin') router.replace(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/admin/stats').then(r => { setStats(r.data.stats); setSpecialties(r.data.specialties || []); }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user || user.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = stats ? [
    { label: 'Patients total', value: stats.totalPatients, icon: <Users className="w-5 h-5" />, color: 'bg-sky-50 text-sky-600', change: '+12%' },
    { label: 'Médecins', value: stats.totalDoctors, icon: <Stethoscope className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600', change: '+3' },
    { label: 'Rendez-vous total', value: stats.totalAppointments, icon: <Calendar className="w-5 h-5" />, color: 'bg-violet-50 text-violet-600', change: '+8%' },
    { label: 'Consultations terminées', value: stats.totalConsultations, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600', change: '' },
    { label: 'Revenus (FCFA)', value: stats.totalRevenue?.toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, color: 'bg-rose-50 text-rose-600', change: '' },
    { label: "RDV aujourd'hui", value: stats.todayAppointments, icon: <Activity className="w-5 h-5" />, color: 'bg-teal-50 text-teal-600', change: '' },
    { label: 'En attente vérif.', value: stats.pendingVerifications, icon: <AlertCircle className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600', change: '' },
  ] : [];

  return (
    <DashboardLayout navItems={NAV} title="Administration">
      <div className="space-y-6">
        <div className="gradient-bg rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Sora,sans-serif' }}>Tableau de bord Admin</h2>
            <p className="text-sky-100">Vue d'ensemble de la plateforme SantéConnect</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? [...Array(8)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)
            : cards.map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3`}>{c.icon}</div>
                <p className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora,sans-serif' }}>{c.value}</p>
                <p className="text-sm text-gray-500">{c.label}</p>
                {c.change && <p className="text-xs text-emerald-600 mt-1 font-medium">{c.change}</p>}
              </div>
            ))}
        </div>
        {specialties.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-5" style={{ fontFamily: 'Sora,sans-serif' }}>Spécialités les plus demandées</h3>
            <div className="space-y-3">
              {specialties.map((s: any) => {
                const max = specialties[0]?.count || 1;
                const pct = Math.round((s.count / max) * 100);
                return (
                  <div key={s._id} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 w-36 truncate">{s._id}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div className="gradient-bg h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}