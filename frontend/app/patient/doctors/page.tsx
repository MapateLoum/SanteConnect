'use client';
import { useEffect, useState, Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, Star, Brain, Calendar, FileText, MessageSquare, User, LayoutDashboard, Stethoscope, Filter, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

const NAV = [
  { href: '/patient/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/patient/triage', label: 'Triage IA', icon: <Brain className="w-4 h-4" /> },
  { href: '/patient/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/patient/appointments', label: 'Mes rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/patient/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/patient/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/patient/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

function DoctorsContent() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/specialties').then(r => setSpecialties(r.data.specialties || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (specialty) params.set('specialty', specialty);
    if (search) params.set('search', search);
    api.get(`/doctors?${params}`).then(r => setDoctors(r.data.doctors || [])).catch(() => setDoctors([])).finally(() => setLoading(false));
  }, [specialty, search]);

  return (
    <DashboardLayout navItems={NAV} title="Trouver un médecin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher un médecin..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-11" />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="input-field pl-11 pr-8 min-w-[200px]">
              <option value="">Toutes les spécialités</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {specialty && (
          <div className="flex items-center gap-2">
            <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              {specialty}
              <button onClick={() => setSpecialty('')} className="hover:text-sky-900">×</button>
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i) => <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20">
            <Stethoscope className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium">Aucun médecin trouvé</h3>
            <p className="text-gray-400 text-sm mt-1">Essayez d'autres critères de recherche</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc: any) => (
              <Link key={doc._id} href={`/patient/doctors/${doc._id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover block">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {doc.user?.firstName?.[0]}{doc.user?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate" style={{fontFamily:'Sora,sans-serif'}}>Dr. {doc.user?.firstName} {doc.user?.lastName}</h3>
                    <p className="text-sky-600 text-sm font-medium">{doc.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-gray-700">{doc.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-400 text-xs">({doc.totalReviews || 0} avis)</span>
                    </div>
                  </div>
                  {doc.isAvailable && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />En ligne
                    </span>
                  )}
                </div>
                {doc.bio && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{doc.bio}</p>}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Consultation</p>
                    <p className="font-bold text-gray-800">{doc.consultationFee?.toLocaleString()} FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{doc.experience || 0} ans</p>
                    <p className="text-xs text-sky-600 font-medium mt-0.5">{doc.totalConsultations || 0} consultations</p>
                  </div>
                </div>
                <button className="w-full gradient-bg text-white text-sm font-medium py-2.5 rounded-xl mt-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  Prendre rendez-vous <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DoctorsContent />
    </Suspense>
  );
}