'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, Shield, Clock, Star, ChevronRight, Stethoscope, Brain, FileText, Video, CheckCircle, Menu, X } from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Médecins vérifiés' },
  { value: '15k+', label: 'Patients satisfaits' },
  { value: '98%', label: 'Satisfaction' },
  { value: '24/7', label: 'Disponibilité' },
];

const FEATURES = [
  { icon: Brain, title: 'Triage IA', desc: 'Notre IA analyse vos symptômes et vous oriente vers le bon spécialiste.', color: 'from-violet-500 to-purple-600' },
  { icon: Video, title: 'Consultation en ligne', desc: 'Chat en temps réel avec votre médecin depuis n\'importe où.', color: 'from-sky-500 to-blue-600' },
  { icon: FileText, title: 'Ordonnances PDF', desc: 'Ordonnances numériques signées disponibles immédiatement.', color: 'from-emerald-500 to-teal-600' },
  { icon: Shield, title: 'Paiement Wave', desc: 'Payez via Wave, Orange Money ou Free Money en toute sécurité.', color: 'from-amber-500 to-orange-600' },
];

const HOW = [
  { step: '01', title: 'Décrivez vos symptômes', desc: 'L\'IA analyse et suggère la spécialité adaptée.' },
  { step: '02', title: 'Choisissez votre médecin', desc: 'Parcourez les profils et réservez un créneau.' },
  { step: '03', title: 'Payez en ligne', desc: 'Paiement sécurisé via Wave ou Mobile Money.' },
  { step: '04', title: 'Consultez et recevez', desc: 'Chat en direct et ordonnance PDF dans votre dossier.' },
];

const SPECIALTIES = ['Médecine générale', 'Cardiologie', 'Dermatologie', 'Pédiatrie', 'Gynécologie', 'Neurologie', 'Pneumologie', 'ORL'];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] overflow-x-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{fontFamily:'Sora,sans-serif'}}><span className="gradient-text">Santé</span>Connect</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['#features', '#how', '#specialties'].map((href, i) => (
              <a key={href} href={href} className="text-gray-600 hover:text-sky-600 text-sm font-medium transition-colors">{['Fonctionnalités','Comment ça marche','Spécialités'][i]}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-gray-700 hover:text-sky-600 text-sm font-medium px-4 py-2 rounded-xl">Connexion</Link>
            <Link href="/auth/register" className="gradient-bg text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 shadow-sm">Commencer gratuitement</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden glass border-t border-white/40 px-6 py-4 flex flex-col gap-4">
            <Link href="/auth/login" className="text-sky-600 text-sm font-medium">Connexion</Link>
            <Link href="/auth/register" className="gradient-bg text-white text-sm text-center py-2.5 rounded-xl">Commencer gratuitement</Link>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-sky-200 rounded-full blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-25 animate-float-delay" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />La santé digitale au Sénégal
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{fontFamily:'Sora,sans-serif'}}>
              Votre médecin à<br /><span className="gradient-text">portée de main</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">Consultez les meilleurs médecins en ligne. IA de triage, prise de RDV instantanée, ordonnances numériques.</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/auth/register" className="gradient-bg text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-base">
                Consulter maintenant <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/register?role=doctor" className="bg-white text-gray-700 font-semibold px-8 py-4 rounded-2xl border border-gray-200 hover:border-sky-300 transition-all flex items-center justify-center gap-2 text-base hover:shadow-md">
                <Stethoscope className="w-5 h-5 text-sky-500" />Je suis médecin
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {STATS.map(s => (
                <div key={s.value} className="text-center">
                  <div className="text-2xl font-bold gradient-text" style={{fontFamily:'Sora,sans-serif'}}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 max-w-sm mx-auto">
              <div className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center shadow-lg animate-float">
                <Stethoscope className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-gray-800">Dr. Amadou Diallo</h3>
                <p className="text-sky-600 text-sm">Cardiologue · 12 ans d'expérience</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  <span className="text-sm text-gray-500 ml-1">4.9</span>
                </div>
              </div>
              <div className="w-full bg-sky-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-2">Prochains créneaux disponibles</p>
                <div className="flex gap-2 flex-wrap">
                  {['09:00','10:30','14:00','15:30'].map(t => (
                    <span key={t} className="bg-white text-sky-600 text-xs font-medium px-3 py-1.5 rounded-lg border border-sky-100 cursor-pointer hover:bg-sky-500 hover:text-white transition-colors">{t}</span>
                  ))}
                </div>
              </div>
              <div className="w-full bg-emerald-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-600" />
                </div>
                <div><p className="text-xs font-semibold text-emerald-700">Triage IA complété</p><p className="text-xs text-gray-500">Cardiologie recommandée</p></div>
                <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
              </div>
            </div>
            <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3 animate-float">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center"><div className="w-3 h-3 bg-green-500 rounded-full" /></div>
              <div><p className="text-xs font-semibold">Médecin en ligne</p><p className="text-xs text-gray-400">Disponible maintenant</p></div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3 animate-float-delay">
              <div className="w-8 h-8 bg-sky-100 rounded-xl flex items-center justify-center"><FileText className="w-4 h-4 text-sky-600" /></div>
              <div><p className="text-xs font-semibold">Ordonnance prête</p><p className="text-xs text-gray-400">Télécharger le PDF</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily:'Sora,sans-serif'}}>Tout ce dont vous avez besoin</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">SantéConnect combine technologie médicale et accessibilité.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f,i) => (
              <div key={f.title} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 card-hover">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2" style={{fontFamily:'Sora,sans-serif'}}>{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 px-6 bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily:'Sora,sans-serif'}}>Comment ça marche</h2>
            <p className="text-gray-600">Simple, rapide, efficace — consulter en 4 étapes</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-sky-200 via-sky-400 to-emerald-300" />
            {HOW.map(h => (
              <div key={h.step} className="relative text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                  <span className="text-white font-bold text-lg" style={{fontFamily:'Sora,sans-serif'}}>{h.step}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2" style={{fontFamily:'Sora,sans-serif'}}>{h.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="specialties" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily:'Sora,sans-serif'}}>Nos spécialités</h2>
            <p className="text-gray-600">Des médecins qualifiés dans toutes les spécialités</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {SPECIALTIES.map(s => (
              <div key={s} className="bg-white border border-gray-100 text-gray-700 font-medium px-6 py-3 rounded-2xl shadow-sm hover:border-sky-300 hover:text-sky-600 hover:shadow-md transition-all cursor-pointer card-hover">{s}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-bg rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4" style={{fontFamily:'Sora,sans-serif'}}>Prêt à prendre soin de vous ?</h2>
              <p className="text-sky-100 text-lg mb-8">Rejoignez des milliers de Sénégalais qui font confiance à SantéConnect.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="bg-white text-sky-600 font-bold px-8 py-4 rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  Créer mon compte gratuit <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/auth/login" className="text-white border-2 border-white/40 font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">Se connecter</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center"><Heart className="w-4 h-4 text-white" /></div>
            <span className="text-white font-bold text-lg" style={{fontFamily:'Sora,sans-serif'}}>SantéConnect</span>
          </div>
          <p className="text-sm mb-6 max-w-sm">La première plateforme de téléconsultation médicale du Sénégal.</p>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">© 2025 SantéConnect — Tous droits réservés</div>
        </div>
      </footer>
    </div>
  );
}
