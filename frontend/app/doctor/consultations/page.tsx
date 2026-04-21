'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, MessageSquare, FileText, User, LayoutDashboard, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

const STATUS_BADGE: Record<string,string> = { active:'badge-ongoing', completed:'badge-completed', waiting:'badge-pending' };
const STATUS_LABEL: Record<string,string> = { active:'En cours', completed:'Terminée', waiting:'En attente' };

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/consultations/my').then(r => setConsultations(r.data.consultations||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  return (
    <DashboardLayout navItems={NAV} title="Mes consultations">
      <div className="space-y-4">
        {loading ? <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        : consultations.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" /><p className="text-gray-500">Aucune consultation</p></div>
        : consultations.map((c:any) => (
          <div key={c._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-700 font-bold flex-shrink-0">{c.patient?.firstName?.[0]}{c.patient?.lastName?.[0]}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{c.patient?.firstName} {c.patient?.lastName}</h4>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5"><Clock className="w-3.5 h-3.5" />{format(new Date(c.createdAt),'dd MMMM yyyy',{locale:fr})}{c.duration && ` · ${c.duration} min`}</p>
              {c.diagnosis && <p className="text-gray-400 text-xs mt-0.5 truncate">Diagnostic : {c.diagnosis}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</span>
              {c.status === 'active' && <Link href={`/consultation/${c.appointment?._id || c.appointment}`} className="gradient-bg text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">Rejoindre <ChevronRight className="w-3 h-3" /></Link>}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
