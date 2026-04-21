'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileText, Brain, Calendar, MessageSquare, User, LayoutDashboard, Stethoscope, Download, Pill } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/patient/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/patient/triage', label: 'Triage IA', icon: <Brain className="w-4 h-4" /> },
  { href: '/patient/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/patient/appointments', label: 'Mes rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/patient/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/patient/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/patient/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions/my').then(r => setPrescriptions(r.data.prescriptions || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const downloadPdf = async (prescriptionId: string) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ordonnance_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  };

  return (
    <DashboardLayout navItems={NAV} title="Mes ordonnances">
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">Aucune ordonnance pour l'instant</p>
          </div>
        ) : prescriptions.map((p: any) => (
          <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Dr. {p.doctor?.user?.firstName} {p.doctor?.user?.lastName}</h4>
                  <p className="text-gray-400 text-sm">{format(new Date(p.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                </div>
              </div>
              <button
                onClick={() => downloadPdf(p._id)}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                <Download className="w-4 h-4" /> Télécharger PDF
              </button>
            </div>
            {p.diagnosis && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">DIAGNOSTIC</p>
                <p className="text-gray-700 text-sm">{p.diagnosis}</p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 mb-2">MÉDICAMENTS PRESCRITS</p>
              {p.medications?.map((m: any, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-sky-50 rounded-xl p-3">
                  <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Pill className="w-3.5 h-3.5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{m.name}</p>
                    <p className="text-gray-500 text-xs">{m.dosage} — {m.frequency} — {m.duration}</p>
                    {m.instructions && <p className="text-gray-400 text-xs mt-0.5">📋 {m.instructions}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}