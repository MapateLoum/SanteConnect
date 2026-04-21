'use client';
import { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  LayoutDashboard, Users, Stethoscope, Calendar,
  ChevronLeft, CheckCircle, XCircle, Star, Award, Phone, Mail, MapPin
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/admin/patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/appointments', label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" /> },
];

export default function AdminDoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.replace('/auth/login');
      else if (user.role !== 'admin') router.replace(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    api.get(`/doctors/${id}`)
      .then(r => setDoctor(r.data.doctor))
      .catch(() => router.push('/admin/doctors'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const verify = async (verified: boolean) => {
    try {
      await api.put(`/admin/doctors/${id}/verify`, { verified });
      setDoctor((prev: any) => ({ ...prev, isVerified: verified }));
      toast.success(verified ? 'Médecin vérifié avec succès' : 'Médecin refusé');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (authLoading || !user || user.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (loading) return (
    <DashboardLayout navItems={NAV} title="Détail médecin">
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    </DashboardLayout>
  );

  if (!doctor) return null;

  return (
    <DashboardLayout navItems={NAV} title="Détail médecin">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/admin/doctors" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ChevronLeft className="w-4 h-4" /> Retour aux médecins
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora,sans-serif' }}>
                    Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                  </h2>
                  <p className="text-sky-600 font-medium mt-0.5">{doctor.specialty}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(doctor.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-700">{(doctor.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({doctor.totalReviews || 0} avis)</span>
                  </div>
                </div>
                <span className={doctor.isVerified ? 'badge-completed' : 'badge-pending'}>
                  {doctor.isVerified ? '✓ Vérifié' : 'En attente'}
                </span>
              </div>

              {doctor.bio && <p className="text-gray-600 mt-4 leading-relaxed">{doctor.bio}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-sky-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-sky-700" style={{ fontFamily: 'Sora,sans-serif' }}>{doctor.experience || 0}</p>
                  <p className="text-xs text-sky-600">ans d'expérience</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-700" style={{ fontFamily: 'Sora,sans-serif' }}>{doctor.totalConsultations || 0}</p>
                  <p className="text-xs text-emerald-600">consultations</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-violet-700" style={{ fontFamily: 'Sora,sans-serif' }}>{doctor.totalReviews || 0}</p>
                  <p className="text-xs text-violet-600">avis patients</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-700" style={{ fontFamily: 'Sora,sans-serif' }}>{doctor.consultationFee?.toLocaleString()}</p>
                  <p className="text-xs text-amber-600">FCFA / consult.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Sora,sans-serif' }}>Informations de contact</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-sky-500" />
              </div>
              <span className="text-sm">{doctor.user?.email}</span>
            </div>
            {doctor.user?.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-sm">{doctor.user.phone}</span>
              </div>
            )}
            {doctor.user?.city && (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-violet-500" />
                </div>
                <span className="text-sm">{doctor.user.city}</span>
              </div>
            )}
            {doctor.licenseNumber && (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-sm">N° {doctor.licenseNumber}</span>
              </div>
            )}
          </div>
        </div>

        {doctor.workingHours && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Sora,sans-serif' }}>Horaires de travail</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(doctor.workingHours).map(([day, schedule]: [string, any]) => (
                <div key={day} className={`rounded-xl p-3 border ${schedule.active ? 'border-emerald-100 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{day}</p>
                  {schedule.active
                    ? <p className="text-sm font-medium text-emerald-700">{schedule.start} – {schedule.end}</p>
                    : <p className="text-sm text-gray-400">Fermé</p>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {!doctor.isVerified && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
            <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Sora,sans-serif' }}>Action requise</h3>
            <p className="text-gray-600 text-sm mb-4">Ce médecin attend une vérification pour apparaître sur la plateforme.</p>
            <div className="flex gap-3">
              <button onClick={() => verify(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                <CheckCircle className="w-4 h-4" /> Valider ce médecin
              </button>
              <button onClick={() => verify(false)}
                className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                <XCircle className="w-4 h-4" /> Refuser
              </button>
            </div>
          </div>
        )}

        {doctor.isVerified && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Médecin actuellement vérifié</p>
              <p className="text-sm text-gray-500">Vous pouvez révoquer la vérification si nécessaire.</p>
            </div>
            <button onClick={() => verify(false)}
              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
              <XCircle className="w-4 h-4" /> Révoquer
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}