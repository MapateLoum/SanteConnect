'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, MessageSquare, FileText, User, LayoutDashboard, Clock, Save, Mail } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/doctor/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/doctor/appointments', label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/doctor/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/doctor/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/doctor/schedule', label: 'Mon agenda', icon: <Clock className="w-4 h-4" /> },
  { href: '/doctor/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

const SPECIALTIES = ['Médecine générale','Cardiologie','Dermatologie','Neurologie','Pneumologie','Gastro-entérologie','Pédiatrie','Gynécologie','Ophtalmologie','ORL','Orthopédie','Psychiatrie'];

export default function DoctorProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'', phone: user?.phone||'' });
  const [docForm, setDocForm] = useState({ bio:'', consultationFee:5000, experience:0, isAvailable:true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(r => {
      if (r.data.doctorProfile) {
        const dp = r.data.doctorProfile;
        setDocForm({ bio: dp.bio||'', consultationFee: dp.consultationFee||5000, experience: dp.experience||0, isAvailable: dp.isAvailable });
      }
    }).catch(() => {});
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [ur, dr] = await Promise.all([
        api.put('/auth/update-profile', form),
        api.put('/doctors/profile', docForm),
      ]);
      updateUser(ur.data.user);
      toast.success('Profil mis à jour');
    } catch { toast.error('Erreur'); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout navItems={NAV} title="Mon profil médecin">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <h2 className="text-xl font-bold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>Dr. {user?.firstName} {user?.lastName}</h2>
          <p className="text-gray-400 flex items-center justify-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" />{user?.email}</p>
          <span className="mt-3 inline-block bg-sky-100 text-sky-700 text-sm px-3 py-1 rounded-full font-medium">Médecin</span>
        </div>
        <form onSubmit={save} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>Informations personnelles</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label><input value={form.firstName} onChange={e => setForm(f=>({...f,firstName:e.target.value}))} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label><input value={form.lastName} onChange={e => setForm(f=>({...f,lastName:e.target.value}))} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label><input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} className="input-field" placeholder="+221 77 000 00 00" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label><textarea value={docForm.bio} onChange={e => setDocForm(f=>({...f,bio:e.target.value}))} className="input-field resize-none" rows={3} placeholder="Présentez-vous aux patients..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Tarif (FCFA)</label><input type="number" value={docForm.consultationFee} onChange={e => setDocForm(f=>({...f,consultationFee:+e.target.value}))} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Expérience (ans)</label><input type="number" value={docForm.experience} onChange={e => setDocForm(f=>({...f,experience:+e.target.value}))} className="input-field" /></div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input type="checkbox" id="avail" checked={docForm.isAvailable} onChange={e => setDocForm(f=>({...f,isAvailable:e.target.checked}))} className="w-4 h-4 text-sky-500 rounded" />
            <label htmlFor="avail" className="text-sm font-medium text-gray-700 cursor-pointer">Disponible pour les consultations</label>
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" />Sauvegarder</>}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
