'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Brain, Calendar, Stethoscope, User, FileText, MessageSquare, LayoutDashboard, Send, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
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

const URGENCY_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  low:       { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, label: 'Non urgent' },
  medium:    { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     icon: <Info className="w-5 h-5 text-amber-500" />,         label: 'Modéré' },
  high:      { color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200',   icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, label: 'Urgent' },
  emergency: { color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         icon: <AlertTriangle className="w-5 h-5 text-red-500" />,   label: '⚠️ Urgence' },
};

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim().length < 10) { toast.error('Décrivez vos symptômes plus en détail'); return; }
    setLoading(true);
    try {
      const res = await api.post('/triage/analyze', { symptoms, age, gender, duration });
      setResult(res.data.triage);
    } catch {
      toast.error('Erreur lors de l\'analyse');
    } finally { setLoading(false); }
  };

  const urg = result ? URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.medium : null;

  return (
    <DashboardLayout navItems={NAV} title="Triage IA">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800" style={{fontFamily:'Sora,sans-serif'}}>Analyse de vos symptômes</h2>
              <p className="text-gray-500 text-sm mt-1">Notre IA analyse vos symptômes et vous oriente vers la spécialité adaptée.</p>
            </div>
          </div>

          <form onSubmit={analyze} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Décrivez vos symptômes <span className="text-red-500">*</span></label>
              <textarea
                value={symptoms} onChange={e => setSymptoms(e.target.value)}
                placeholder="Ex: J'ai une douleur thoracique qui irradie dans le bras gauche depuis ce matin, accompagnée d'essoufflement et de sueurs..."
                className="input-field min-h-[120px] resize-none"
                rows={5} required
              />
              <p className="text-xs text-gray-400 mt-1">{symptoms.length}/500 caractères — Plus vous êtes précis, meilleure est l'analyse</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Âge</label>
                <input type="number" placeholder="35" value={age} onChange={e => setAge(e.target.value)} className="input-field" min="0" max="120" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="input-field">
                  <option value="">N/A</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                <select value={duration} onChange={e => setDuration(e.target.value)} className="input-field">
                  <option value="">N/A</option>
                  <option value="Quelques heures">Quelques heures</option>
                  <option value="1-2 jours">1-2 jours</option>
                  <option value="3-7 jours">3-7 jours</option>
                  <option value="Plus d'une semaine">Plus d'une semaine</option>
                  <option value="Chronique">Chronique</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading || symptoms.length < 10}
              className="w-full gradient-bg text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyse en cours...</> : <><Brain className="w-5 h-5" /> Analyser mes symptômes</>}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && urg && (
          <div className="animate-fade-up space-y-4">
            <div className={`rounded-2xl p-6 border ${urg.bg}`}>
              <div className="flex items-center gap-3 mb-4">
                {urg.icon}
                <div>
                  <h3 className={`font-bold text-lg ${urg.color}`} style={{fontFamily:'Sora,sans-serif'}}>Niveau d'urgence : {urg.label}</h3>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm mb-4`}>
                <Stethoscope className="w-4 h-4 text-sky-500" />
                <span className="font-semibold text-gray-800">Spécialité recommandée :</span>
                <span className="text-sky-600 font-bold">{result.specialty}</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">{result.reasoning}</p>
              {result.advice && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1">CONSEIL IMMÉDIAT</p>
                  <p className="text-gray-700 text-sm">{result.advice}</p>
                </div>
              )}
              {result.redFlags?.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 mt-3">
                  <p className="text-xs font-semibold text-red-600 mb-2">⚠️ SIGNES D'ALARME À SURVEILLER</p>
                  <ul className="space-y-1">
                    {result.redFlags.map((flag: string, i: number) => (
                      <li key={i} className="text-red-700 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />{flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {result.urgency !== 'emergency' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-semibold text-gray-800 mb-4" style={{fontFamily:'Sora,sans-serif'}}>Prochaine étape</h4>
                <Link href={`/patient/doctors?specialty=${encodeURIComponent(result.specialty)}`}
                  className="gradient-bg text-white font-semibold px-6 py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Consulter un(e) {result.specialty}
                </Link>
                <p className="text-xs text-gray-400 text-center mt-3">Vous serez redirigé vers la liste des médecins disponibles</p>
              </div>
            )}

            {result.urgency === 'emergency' && (
              <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h4 className="font-bold text-red-700 text-xl mb-2" style={{fontFamily:'Sora,sans-serif'}}>Situation d'urgence</h4>
                <p className="text-red-600 mb-4">Rendez-vous immédiatement aux urgences ou appelez le 15 (SAMU).</p>
                <a href="tel:15" className="bg-red-500 text-white font-bold px-8 py-4 rounded-2xl inline-flex items-center gap-2 hover:bg-red-600 transition-colors">
                  📞 Appeler le 15 (SAMU)
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
