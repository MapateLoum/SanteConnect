'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Connexion réussie !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{fontFamily:'Sora,sans-serif'}}>Bienvenue sur SantéConnect</h1>
          <p className="text-sky-100 text-lg leading-relaxed">Votre santé, notre priorité. Consultez des médecins qualifiés depuis chez vous.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[{n:'500+',l:'Médecins'},{n:'15k+',l:'Patients'},{n:'98%',l:'Satisfaction'},{n:'24/7',l:'Disponible'}].map(s => (
              <div key={s.l} className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold" style={{fontFamily:'Sora,sans-serif'}}>{s.n}</div>
                <div className="text-sky-100 text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{fontFamily:'Sora,sans-serif'}}><span className="gradient-text">Santé</span>Connect</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{fontFamily:'Sora,sans-serif'}}>Connexion</h2>
          <p className="text-gray-500 mb-8">Pas encore de compte ? <Link href="/auth/register" className="text-sky-600 font-medium hover:underline">S'inscrire gratuitement</Link></p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" placeholder="vous@exemple.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="input-field input-icon" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field input-icon" style={{paddingRight:"2.75rem"}} required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full gradient-bg text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Se connecter</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 p-4 bg-sky-50 rounded-2xl border border-sky-100">
            <p className="text-xs font-semibold text-sky-700 mb-2">Comptes de démonstration :</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>🏥 Admin : admin@santeconnect.sn / admin123</p>
              <p>👨‍⚕️ Médecin : doctor@santeconnect.sn / doctor123</p>
              <p>🤒 Patient : patient@santeconnect.sn / patient123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}