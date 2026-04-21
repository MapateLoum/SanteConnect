'use client';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3" style={{fontFamily:'Sora,sans-serif'}}>Paiement échoué</h1>
        <p className="text-gray-500 mb-8">Le paiement n'a pas pu être traité. Veuillez réessayer.</p>
        <Link href="/patient/appointments" className="gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour aux rendez-vous
        </Link>
      </div>
    </div>
  );
}
