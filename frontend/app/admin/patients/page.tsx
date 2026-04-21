'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Users, Stethoscope, Calendar, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/admin/patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/appointments', label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" /> },
];

export default function AdminPatientsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = (q='') => {
    setLoading(true);
    api.get(`/admin/users?role=patient${q ? `&search=${q}` : ''}`).then(r => setUsers(r.data.users||[])).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? {...u, isActive: res.data.user.isActive} : u));
      toast.success('Statut modifié');
    } catch { toast.error('Erreur'); }
  };

  return (
    <DashboardLayout navItems={NAV} title="Gestion des patients">
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher un patient..." value={search} onChange={e => { setSearch(e.target.value); if (e.target.value.length > 2 || !e.target.value) load(e.target.value); }} className="input-field pl-11" />
        </div>
        {loading ? <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        : <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
            <span>PATIENT</span><span>EMAIL</span><span>TÉLÉPHONE</span><span>STATUT</span>
          </div>
          {users.map((u:any) => (
            <div key={u._id} className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                <span className="font-medium text-gray-800 text-sm truncate">{u.firstName} {u.lastName}</span>
              </div>
              <span className="text-gray-500 text-sm self-center truncate">{u.email}</span>
              <span className="text-gray-500 text-sm self-center">{u.phone || '—'}</span>
              <div className="flex items-center gap-2">
                <span className={u.isActive ? 'badge-completed' : 'badge-cancelled'}>{u.isActive ? 'Actif' : 'Désactivé'}</span>
                <button onClick={() => toggle(u._id)} className="text-gray-400 hover:text-gray-600">
                  {u.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>}
      </div>
    </DashboardLayout>
  );
}
