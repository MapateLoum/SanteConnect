'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Users, Stethoscope, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NAV = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/admin/patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/appointments', label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" /> },
];

export default function AdminDoctorsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending'|'all'>('pending');

  useEffect(() => {
    Promise.all([
      api.get('/admin/doctors/pending'),
      api.get('/doctors'),
    ]).then(([p, a]) => { setPending(p.data.doctors||[]); setAll(a.data.doctors||[]); }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const verify = async (id: string, verified: boolean) => {
    try {
      await api.put(`/admin/doctors/${id}/verify`, { verified });
      setPending(p => p.filter(d => d._id !== id));
      toast.success(verified ? 'Médecin vérifié' : 'Médecin refusé');
    } catch { toast.error('Erreur'); }
  };

  return (
    <DashboardLayout navItems={NAV} title="Gestion des médecins">
      <div className="space-y-6">
        <div className="flex gap-3">
          <button onClick={() => setTab('pending')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${tab==='pending'?'gradient-bg text-white':'bg-white border border-gray-200 text-gray-600'}`}>
            <Clock className="w-4 h-4" /> En attente ({pending.length})
          </button>
          <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab==='all'?'gradient-bg text-white':'bg-white border border-gray-200 text-gray-600'}`}>
            Tous les médecins
          </button>
        </div>
        {loading ? <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        : tab === 'pending' ? (
          pending.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><CheckCircle className="w-16 h-16 text-emerald-200 mx-auto mb-4" /><p className="text-gray-500">Aucune vérification en attente</p></div>
          : pending.map((d:any) => (
            <div key={d._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                {d.user?.firstName?.[0]}{d.user?.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Dr. {d.user?.firstName} {d.user?.lastName}</h4>
                <p className="text-sky-600 text-sm">{d.specialty} · N° {d.licenseNumber}</p>
                <p className="text-gray-400 text-xs mt-0.5">{d.user?.email} · Inscrit le {format(new Date(d.user?.createdAt),'dd MMM yyyy',{locale:fr})}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => verify(d._id, true)} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100"><CheckCircle className="w-4 h-4" />Valider</button>
                <button onClick={() => verify(d._id, false)} className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-100"><XCircle className="w-4 h-4" />Refuser</button>
              </div>
            </div>
          ))
        ) : all.map((d:any) => (
          <div key={d._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
              {d.user?.firstName?.[0]}{d.user?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Dr. {d.user?.firstName} {d.user?.lastName}</h4>
              <p className="text-sky-600 text-sm">{d.specialty}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={d.isVerified ? 'badge-completed' : 'badge-pending'}>{d.isVerified ? '✓ Vérifié' : 'Non vérifié'}</span>
              <span className="text-sm text-gray-500">{d.totalConsultations||0} consultations</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
