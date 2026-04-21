'use client';
import { use, useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Star, Calendar, Clock, ChevronLeft, Brain, FileText, MessageSquare, User, LayoutDashboard, Stethoscope, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const NAV = [
  { href: '/patient/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/patient/triage', label: 'Triage IA', icon: <Brain className="w-4 h-4" /> },
  { href: '/patient/doctors', label: 'Médecins', icon: <Stethoscope className="w-4 h-4" /> },
  { href: '/patient/appointments', label: 'Mes rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { href: '/patient/consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/patient/prescriptions', label: 'Ordonnances', icon: <FileText className="w-4 h-4" /> },
  { href: '/patient/profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
];

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const dates = [...Array(7)].map((_, i) => {
    const d = addDays(new Date(), i + 1);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE dd MMM', { locale: fr }) };
  });

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(r => setDoctor(r.data.doctor))
      .catch(() => router.push('/patient/doctors'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    api.get(`/doctors/${id}/slots?date=${selectedDate}`)
      .then(r => setSlots(r.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, id]);

  const book = async () => {
    if (!selectedDate || !selectedSlot) { toast.error('Sélectionnez une date et un créneau'); return; }
    setBooking(true);
    try {
      const [h, m] = selectedSlot.split(':').map(Number);
      const em = m + 30 >= 60 ? m + 30 - 60 : m + 30;
      const eh = m + 30 >= 60 ? h + 1 : h;
      await api.post('/appointments', {
        doctorId: id,
        date: selectedDate,
        timeSlot: { start: selectedSlot, end: `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}` },
        symptoms,
        type: 'chat'
      });
      toast.success('Rendez-vous créé !');
      router.push('/patient/appointments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally { setBooking(false); }
  };

  if (loading) return (
    <DashboardLayout navItems={NAV} title="Médecin">
      <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
    </DashboardLayout>
  );
  if (!doctor) return null;

  return (
    <DashboardLayout navItems={NAV} title="Profil médecin">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/patient/doctors" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ChevronLeft className="w-4 h-4" /> Retour
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
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Sora,sans-serif' }}>{doctor.consultationFee?.toLocaleString()} FCFA</p>
                  <p className="text-gray-400 text-sm">par consultation</p>
                </div>
              </div>
              {doctor.bio && <p className="text-gray-600 mt-4 leading-relaxed">{doctor.bio}</p>}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-sky-50 text-sky-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />{doctor.experience || 0} ans d'expérience
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />{doctor.totalConsultations || 0} consultations
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-5" style={{ fontFamily: 'Sora,sans-serif' }}>Prendre rendez-vous</h3>
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Choisissez une date</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map(d => (
                <button key={d.value} onClick={() => { setSelectedDate(d.value); setSelectedSlot(''); }}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedDate === d.value ? 'gradient-bg text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          {selectedDate && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Créneaux disponibles</p>
              {slotsLoading
                ? <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="w-20 h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                : slots.length === 0
                  ? <p className="text-gray-400 text-sm">Aucun créneau ce jour</p>
                  : <div className="flex flex-wrap gap-2">
                    {slots.map(s => (
                      <button key={s} onClick={() => setSelectedSlot(s)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedSlot === s ? 'gradient-bg text-white shadow-sm' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}>
                        <Clock className="w-3.5 h-3.5" />{s}
                      </button>
                    ))}
                  </div>
              }
            </div>
          )}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Symptômes (optionnel)</p>
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
              placeholder="Décrivez brièvement vos symptômes..." className="input-field resize-none" rows={3} />
          </div>
          <button onClick={book} disabled={!selectedDate || !selectedSlot || booking}
            className="w-full gradient-bg text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
            {booking
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Calendar className="w-5 h-5" />Confirmer — {doctor.consultationFee?.toLocaleString()} FCFA</>
            }
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}