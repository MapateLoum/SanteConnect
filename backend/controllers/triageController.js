const https = require('https');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SPECIALTIES = [
  'Médecine générale', 'Cardiologie', 'Dermatologie', 'Neurologie',
  'Pneumologie', 'Gastro-entérologie', 'Pédiatrie', 'Gynécologie',
  'Ophtalmologie', 'ORL', 'Orthopédie', 'Psychiatrie', 'Urologie',
  'Endocrinologie', 'Rhumatologie', 'Infectiologie',
];

async function callGroq(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: 500,
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// POST /api/triage/analyze
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender, duration } = req.body;
    if (!symptoms || symptoms.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Veuillez décrire vos symptômes plus en détail' });
    }

    const systemPrompt = `Tu es un assistant médical de triage pour SantéConnect, une plateforme sénégalaise de téléconsultation.
Ton rôle est d'analyser les symptômes décrits et de suggérer la spécialité médicale la plus adaptée.
Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "specialty": "nom de la spécialité parmi la liste fournie",
  "urgency": "low|medium|high|emergency",
  "reasoning": "explication courte en français (max 2 phrases)",
  "advice": "conseil immédiat pour le patient (max 2 phrases)",
  "redFlags": ["signe_alarme_1", "signe_alarme_2"]
}
Spécialités disponibles: ${SPECIALTIES.join(', ')}.
Si urgence=emergency, indique clairement d'aller aux urgences.`;

    const userMsg = `Patient: ${age ? age + ' ans' : 'âge non précisé'}, ${gender || 'sexe non précisé'}
Symptômes: ${symptoms}
Durée: ${duration || 'non précisée'}`;

    const response = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMsg },
    ]);

    const content = response.choices?.[0]?.message?.content || '';
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      result = {
        specialty: 'Médecine générale',
        urgency: 'medium',
        reasoning: 'Analyse en cours. Un médecin généraliste pourra orienter vers la bonne spécialité.',
        advice: 'Consultez un médecin généraliste pour un bilan complet.',
        redFlags: [],
      };
    }

    res.json({ success: true, triage: result });
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.json({
      success: true,
      triage: {
        specialty: 'Médecine générale',
        urgency: 'medium',
        reasoning: 'Notre système d\'analyse est temporairement indisponible.',
        advice: 'Consultez un médecin généraliste qui pourra vous orienter.',
        redFlags: [],
      },
    });
  }
};
