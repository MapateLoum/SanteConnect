'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, Stethoscope, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

const SPECIALTIES = ['Médecine générale','Cardiologie','Dermatologie','Neurologie','Pneumologie','Gastro-entérologie','Pédiatrie','Gynécologie','Ophtalmologie','ORL','Orthopédie','Psychiatrie','Urologie','Endocrinologie'];

function RegisterForm() {
  const { register } = useAuth();
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'patient'|'doctor'>(params.get('role') === 'doctor' ? 'doctor' : 'patient');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', phone:'', gender:'', dateOfBirth:'', specialty:'', licenseNumber:'', consultationFee:'5000' });

  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Compte créé avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally { setLoading(false); }
  };

  const iconInput = (icon: React.ReactNode, input: React.ReactNode) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">{icon}</span>
      {input}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{fontFamily:'Sora,sans-serif'}}>Rejoignez SantéConnect</h1>
          <p className="text-sky-100 text-lg">Accédez à des soins de qualité ou rejoignez notre réseau de médecins.</p>
          <div className="mt-10 flex gap-4 justify-center">
            <button type="button" onClick={() => setRole('patient')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${role==='patient' ? 'bg-white text-sky-600' : 'bg-white/20 text-white'}`}>
              <User className="w-4 h-4" /> Patient
            </button>
            <button type="button" onClick={() => setRole('doctor')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${role==='doctor' ? 'bg-white text-sky-600' : 'bg-white/20 text-white'}`}>
              <Stethoscope className="w-4 h-4" /> Médecin
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{fontFamily:'Sora,sans-serif'}}><span className="gradient-text">Santé</span>Connect</span>
          </div>

          <div className="flex items-center gap-3 mb-8">
            {[1,2].map(i => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'gradient-bg' : 'bg-gray-200'}`} />
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{fontFamily:'Sora,sans-serif'}}>
            {step === 1 ? 'Informations personnelles' : 'Finaliser le profil'}
          </h2>
          <p className="text-gray-500 mb-8">
            Déjà un compte ? <Link href="/auth/login" className="text-sky-600 font-medium hover:underline">Se connecter</Link>
          </p>

          <div className="flex gap-3 mb-6 lg:hidden">
            <button type="button" onClick={() => setRole('patient')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${role==='patient' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <User className="w-4 h-4" /> Patient
            </button>
            <button type="button" onClick={() => setRole('doctor')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${role==='doctor' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Stethoscope className="w-4 h-4" /> Médecin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                    {iconInput(<User className="w-4 h-4" />, <input type="text" placeholder="Amadou" value={form.firstName} onChange={e => set('firstName', e.target.value)} className="input-field" style={{paddingLeft:'2.5rem'}} required />)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                    <input type="text" placeholder="Diallo" value={form.lastName} onChange={e => set('lastName', e.target.value)} className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  {iconInput(<Mail className="w-4 h-4" />, <input type="email" placeholder="vous@exemple.com" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" style={{paddingLeft:'2.5rem'}} required />)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><Lock className="w-4 h-4" /></span>
                    <input type={show ? 'text' : 'password'} placeholder="Min. 6 caractères" value={form.password} onChange={e => set('password', e.target.value)} className="input-field" style={{paddingLeft:'2.5rem', paddingRight:'2.5rem'}} required minLength={6} />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                  {iconInput(<Phone className="w-4 h-4" />, <input type="tel" placeholder="+221 77 000 00 00" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" style={{paddingLeft:'2.5rem'}} />)}
                </div>
              </>
            )}

            {step === 2 && role === 'patient' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input-field">
                    <option value="">Sélectionner</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </>
            )}

            {step === 2 && role === 'doctor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Spécialité</label>
                  <select value={form.specialty} onChange={e => set('specialty', e.target.value)} className="input-field" required>
                    <option value="">Choisir une spécialité</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro d'ordre médical</label>
                  <input type="text" placeholder="SN-MED-XXXXX" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tarif consultation (FCFA)</label>
                  <input type="number" placeholder="5000" value={form.consultationFee} onChange={e => set('consultationFee', e.target.value)} className="input-field" min="1000" />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
              )}
              <button type="submit" disabled={loading}
                className="gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 flex-1">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>{step === 1 ? 'Continuer' : 'Créer mon compte'} <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}