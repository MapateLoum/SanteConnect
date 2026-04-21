'use client';
import { use, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { Send, FileText, X, Pill, Plus, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { user, token } = useAuth();
  const router = useRouter();
  const [consultation, setConsultation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<{ name: string } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrescription, setShowPrescription] = useState(false);
  const [ending, setEnding] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    api.get(`/consultations/appointment/${id}`).then(r => {
      setConsultation(r.data.consultation);
      setMessages(r.data.consultation.messages || []);
    }).catch(() => {
      api.get(`/consultations/${id}`).then(r => {
        setConsultation(r.data.consultation);
        setMessages(r.data.consultation.messages || []);
      }).catch(() => router.back());
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!consultation || !token) return;
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', { auth: { token } });
    s.emit('join_consultation', consultation._id);

    s.on('new_message', (msg: any) => {
      setMessages(prev => {
        // ✅ Remplacer le message optimiste correspondant par le vrai message
        // On cherche un temp_ avec le même contenu pour éviter le doublon
        const tempIndex = prev.findIndex(
          m => m._id?.startsWith('temp_') && m.content === msg.content
        );
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = msg;
          return updated;
        }
        // Sinon c'est un message de l'autre personne → l'ajouter
        return [...prev, msg];
      });
    });

    s.on('typing', ({ name, isTyping }: any) => {
      if (isTyping) setTyping({ name });
      else setTyping(null);
    });

    setSocket(s);
    return () => {
      s.emit('leave_consultation', consultation._id);
      s.disconnect();
    };
  }, [consultation, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = () => {
    if (!input.trim() || !socket || !consultation) return;

    const tempId = `temp_${Date.now()}`;
    const content = input;

    // ✅ Optimistic update avec tempId unique et sender = user complet
    const optimisticMsg = {
      _id: tempId,
      sender: user,
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');

    // Envoyer via socket ET API
    socket.emit('send_message', {
      consultationId: consultation._id,
      content,
      type: 'text',
    });
    api.post(`/consultations/${consultation._id}/message`, { content }).catch(() => {});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
    socket?.emit('typing', { consultationId: consultation?._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('typing', { consultationId: consultation?._id, isTyping: false });
    }, 1500);
  };

  const endConsultation = async () => {
    if (!diagnosis) { toast.error('Veuillez indiquer un diagnostic'); return; }
    setEnding(true);
    try {
      await api.put(`/consultations/${consultation._id}/end`, { diagnosis });
      toast.success('Consultation terminée');
      router.push('/doctor/dashboard');
    } catch { toast.error('Erreur'); } finally { setEnding(false); }
  };

  const savePrescription = async () => {
    const meds = medications.filter(m => m.name && m.dosage && m.frequency && m.duration);
    if (meds.length === 0) { toast.error('Ajoutez au moins un médicament'); return; }
    setSaving(true);
    try {
      await api.post('/prescriptions', { consultationId: consultation._id, medications: meds, diagnosis });
      toast.success('Ordonnance créée !');
      setShowPrescription(false);
    } catch { toast.error('Erreur'); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!consultation) return null;

  const isDoctor = user?.role === 'doctor';
  const other = isDoctor ? consultation.patient : consultation.doctor?.user;

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center text-white font-semibold text-sm">
            {other?.firstName?.[0]}{other?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {isDoctor ? '' : 'Dr. '}{other?.firstName} {other?.lastName}
            </p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">En ligne</span>
            </div>
          </div>
        </div>

        {/* Boutons uniquement pour le médecin */}
        {isDoctor && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrescription(true)}
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <FileText className="w-4 h-4" /> Ordonnance
            </button>
            <button
              onClick={endConsultation}
              disabled={ending}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" /> {ending ? 'En cours...' : 'Terminer'}
            </button>
          </div>
        )}
      </header>

      {/* Barre info patient — médecin seulement */}
      {isDoctor && consultation.patient && (
        <div className="bg-sky-50 border-b border-sky-100 px-4 py-2 flex items-center gap-4 text-xs text-sky-700">
          <span>👤 {consultation.patient.firstName} {consultation.patient.lastName}</span>
          {consultation.patient.dateOfBirth && (
            <span>🎂 {format(new Date(consultation.patient.dateOfBirth), 'dd/MM/yyyy')}</span>
          )}
          {consultation.patient.bloodType && (
            <span>🩸 {consultation.patient.bloodType}</span>
          )}
          {consultation.patient.allergies?.length > 0 && (
            <span>⚠️ Allergies: {consultation.patient.allergies.join(', ')}</span>
          )}
        </div>
      )}

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-500 text-sm">Consultation démarrée. Bonjour !</p>
          </div>
        )}

        {messages.map((msg: any, i: number) => {
          // ✅ Comparaison robuste — couvre ObjectId brut, objet populé, optimistic update
          const senderId = msg.sender?._id?.toString() ?? msg.sender?.toString();
          const isMe = senderId === user?._id?.toString();

          return (
            <div
              key={msg._id || i}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-up`}
            >
              {/* Avatar de l'autre personne à gauche */}
              {!isMe && (
                <div className="w-7 h-7 gradient-bg rounded-xl flex items-center justify-center text-white text-xs font-semibold mr-2 mt-1 flex-shrink-0">
                  {(msg.sender?.firstName || other?.firstName)?.[0]}
                </div>
              )}

              {/* Bulle de message */}
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${
                isMe
                  ? 'gradient-bg text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-sky-100' : 'text-gray-400'}`}>
                  {format(new Date(msg.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })}

        {typing && (
          <p className="text-gray-400 text-xs animate-pulse">
            {typing.name} est en train d'écrire...
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            rows={1}
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={sendMsg}
            disabled={!input.trim()}
            className="w-11 h-11 gradient-bg rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal ordonnance — médecin seulement */}
      {isDoctor && showPrescription && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShowPrescription(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Sora,sans-serif' }}>
                Rédiger une ordonnance
              </h3>
              <button onClick={() => setShowPrescription(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Diagnostic</label>
                <textarea
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Diagnostic posé..."
                />
              </div>

              {medications.map((med, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-sky-500" />Médicament {i + 1}
                    </p>
                    {medications.length > 1 && (
                      <button
                        onClick={() => setMedications(m => m.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Nom du médicament"
                    value={med.name}
                    onChange={e => setMedications(m => m.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    className="input-field text-sm py-2"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={e => setMedications(m => m.map((x, j) => j === i ? { ...x, dosage: e.target.value } : x))}
                      className="input-field text-sm py-2"
                    />
                    <input
                      placeholder="Fréquence"
                      value={med.frequency}
                      onChange={e => setMedications(m => m.map((x, j) => j === i ? { ...x, frequency: e.target.value } : x))}
                      className="input-field text-sm py-2"
                    />
                    <input
                      placeholder="Durée"
                      value={med.duration}
                      onChange={e => setMedications(m => m.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))}
                      className="input-field text-sm py-2"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setMedications(m => [...m, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])}
                className="w-full border-2 border-dashed border-gray-300 text-gray-500 rounded-xl py-2.5 text-sm hover:border-sky-400 hover:text-sky-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Ajouter un médicament
              </button>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPrescription(false)} className="btn-secondary flex-1 justify-center">
                  Annuler
                </button>
                <button
                  onClick={savePrescription}
                  disabled={saving}
                  className="gradient-bg text-white font-semibold py-3 rounded-xl flex-1 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><FileText className="w-4 h-4" />Enregistrer</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}