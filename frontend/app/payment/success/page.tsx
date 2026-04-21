'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const appointmentId = params.get('appointmentId');
  const mode = params.get('mode');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (mode === 'checkout' && appointmentId) {
      // Mock payment for demo — in production Wave would redirect here with transaction ID
      api.post('/payments/initiate', { appointmentId }).then(r => {
        if (r.data.payment?._id) {
          api.post('/payments/verify', { paymentId: r.data.payment._id, transactionId: 'WAVE_' + Date.now() }).then(() => setPaid(true)).catch(() => setPaid(true));
        }
      }).catch(() => setPaid(true));
    } else {
      setPaid(true);
    }
  }, []);

  const dashboard = user?.role === 'doctor' ? '/doctor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard';

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full animate-scale-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3" style={{fontFamily:'Sora,sans-serif'}}>Rendez-vous confirmé !</h1>
        <p className="text-gray-500 mb-8">Votre rendez-vous a été créé avec succès. Vous recevrez une confirmation prochainement.</p>
        <div className="flex flex-col gap-3">
          <Link href="/patient/appointments" className="gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
            Voir mes rendez-vous <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href={dashboard} className="bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
