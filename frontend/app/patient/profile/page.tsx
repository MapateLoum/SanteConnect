'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { User, Brain, Calendar, FileText, MessageSquare, LayoutDashboard, Stethoscope, Save, Mail, Phone, MapPin, Droplets } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/patient/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/patient/triage', label: 'Triage IA', icon: <Brain className="w-4 h-4" /> },
  { href: '/patient/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/patient/appointments', label: 'Mes rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/patient/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/patient/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/patient/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'', phone: user?.phone||'', gender:'', dateOfBirth:'', bloodType:'', address:'', city:'' });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/update-profile', form);
      updateUser(res.data.user);
      toast.success('Profil mis à jour');
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout navItems={NAV} title="Mon profil">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <h2 className="text-xl font-bold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>{user?.firstName} {user?.lastName}</h2>
          <p className="text-gray-400 flex items-center justify-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" />{user?.email}</p>
          <span className="mt-3 inline-block bg-sky-100 text-sky-700 text-sm px-3 py-1 rounded-full font-medium">Patient</span>
        </div>

        <form onSubmit={save} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 mb-2" style={{fontFamily:'Sora,sans-serif'}}>Informations personnelles</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field pl-10" placeholder="+221 77 000 00 00" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input-field">
                <option value="">Sélectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
              <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Groupe sanguin</label>
              <div className="relative"><Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                <select value={form.bloodType} onChange={e => set('bloodType', e.target.value)} className="input-field pl-10">
                  <option value="">N/A</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.city} onChange={e => set('city', e.target.value)} className="input-field pl-10" placeholder="Dakar" /></div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" />Sauvegarder</>}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
