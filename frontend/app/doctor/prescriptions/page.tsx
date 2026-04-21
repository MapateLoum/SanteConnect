'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, MessageSquare, FileText, User, LayoutDashboard, Clock, Download, Pill } from 'lucide-react';
import api from '@/lib/api';
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

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/prescriptions/my').then(r => setPrescriptions(r.data.prescriptions||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  return (
    <DashboardLayout navItems={NAV} title="Ordonnances émises">
      <div className="space-y-4">
        {loading ? <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        : prescriptions.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" /><p className="text-gray-500">Aucune ordonnance émise</p></div>
        : prescriptions.map((p:any) => (
          <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <h4 className="font-semibold text-gray-800">{p.patient?.firstName} {p.patient?.lastName}</h4>
                  <p className="text-gray-400 text-sm">{format(new Date(p.createdAt),'dd MMMM yyyy',{locale:fr})}</p>
                </div>
              </div>
              <a href={`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000/api'}/prescriptions/${p._id}/pdf`} target="_blank"
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Download className="w-4 h-4" /> PDF
              </a>
            </div>
            {p.diagnosis && <p className="text-sm text-gray-600 mb-3 bg-gray-50 px-3 py-2 rounded-lg">{p.diagnosis}</p>}
            <div className="flex flex-wrap gap-2">
              {p.medications?.map((m:any,i:number) => (
                <span key={i} className="bg-sky-50 text-sky-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Pill className="w-3 h-3" />{m.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
