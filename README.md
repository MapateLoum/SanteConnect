# 🏥 SantéConnect — Plateforme de Téléconsultation Médicale

## 📋 Description
SantéConnect est une application web de téléconsultation médicale pour le Sénégal. Elle met en relation des patients avec des médecins via chat temps réel, avec un module IA de triage des symptômes, paiement Wave, et génération d'ordonnances PDF.

## 🚀 Stack Technique
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Express.js + Node.js + Socket.io
- **Base de données**: MongoDB Atlas (Mongoose)
- **Auth**: JWT
- **IA Triage**: Groq API (LLaMA 3.3 70B)
- **Paiement**: Wave Business API
- **PDF**: PDFKit
- **Temps réel**: Socket.io
- **Déploiement**: Vercel (front) + Render (back)

## 📁 Structure du Projet

```
santeconnect/
├── frontend/          # Next.js App
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── auth/login/           # Connexion
│   │   ├── auth/register/        # Inscription
│   │   ├── patient/              # Espace patient
│   │   │   ├── dashboard/        # Tableau de bord
│   │   │   ├── triage/           # Triage IA symptômes
│   │   │   ├── doctors/          # Liste + détail médecins
│   │   │   ├── appointments/     # Rendez-vous
│   │   │   ├── consultations/    # Consultations
│   │   │   ├── prescriptions/    # Ordonnances
│   │   │   └── profile/          # Profil patient
│   │   ├── doctor/               # Espace médecin
│   │   │   ├── dashboard/        # Tableau de bord
│   │   │   ├── appointments/     # Gestion RDV
│   │   │   ├── consultations/    # Consultations
│   │   │   ├── prescriptions/    # Ordonnances émises
│   │   │   ├── schedule/         # Agenda / horaires
│   │   │   └── profile/          # Profil médecin
│   │   ├── admin/                # Espace admin
│   │   │   ├── dashboard/        # Stats globales
│   │   │   ├── doctors/          # Vérification médecins
│   │   │   ├── patients/         # Gestion patients
│   │   │   └── appointments/     # Tous les RDV
│   │   ├── consultation/[id]/    # Chat temps réel
│   │   └── payment/              # Pages paiement
│   ├── components/layout/        # DashboardLayout partagé
│   ├── context/AuthContext.tsx   # Gestion auth JWT
│   └── lib/api.ts                # Client axios configuré
│
└── backend/           # Express API
    ├── server.js                 # Point d'entrée
    ├── models/                   # Modèles Mongoose
    │   ├── User.js
    │   ├── Doctor.js
    │   ├── Appointment.js
    │   ├── Consultation.js
    │   ├── Prescription.js
    │   └── Payment.js
    ├── controllers/              # Logique métier
    │   ├── authController.js
    │   ├── doctorController.js
    │   ├── appointmentController.js
    │   ├── consultationController.js
    │   ├── prescriptionController.js
    │   ├── triageController.js    # IA Groq
    │   ├── paymentController.js   # Wave
    │   └── adminController.js
    ├── routes/                   # Routes REST
    ├── middleware/auth.js         # JWT middleware
    └── socket/handler.js         # Socket.io
```

## ⚙️ Installation

### Prérequis
- Node.js 18+
- MongoDB Atlas account
- Groq API key (gratuit : console.groq.com)
- Wave Business API key

### 1. Backend
```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env
npm install
npm run dev   # Port 5000
```

### 2. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # ou éditer .env.local
npm install
npm run dev   # Port 3000
```

## 🔑 Variables d'environnement

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/santeconnect
JWT_SECRET=votre_secret_jwt_tres_long
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
GROQ_API_KEY=gsk_xxxxxxxxxxxx
WAVE_API_KEY=votre_wave_api_key
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 👥 Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **Patient** | Triage IA, médecins, RDV, chat, ordonnances, profil |
| **Médecin** | Dashboard, RDV, consultations, ordonnances, agenda, profil |
| **Admin** | Stats, vérification médecins, gestion patients, tous RDV |

## 🔌 API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/doctors | Liste médecins |
| GET | /api/doctors/:id/slots | Créneaux dispo |
| POST | /api/appointments | Créer RDV |
| POST | /api/triage/analyze | Analyse IA |
| POST | /api/payments/initiate | Init paiement Wave |
| GET | /api/prescriptions/:id/pdf | Télécharger PDF |
| GET | /api/admin/stats | Stats admin |

## 🚀 Déploiement

### Render (Backend)
1. New Web Service → connecter repo
2. Build: `npm install`
3. Start: `npm start`
4. Ajouter variables d'environnement

### Vercel (Frontend)
1. Import project
2. Ajouter `NEXT_PUBLIC_API_URL` = URL Render

## 💡 Fonctionnalités clés
- 🤖 **Triage IA** : Groq LLaMA 3.3 70B analyse symptômes → spécialité
- 💬 **Chat temps réel** : Socket.io avec indicateur de frappe
- 📄 **Ordonnances PDF** : PDFKit avec header/footer SantéConnect
- 💰 **Wave Pay** : Intégration Wave Business API
- 🔔 **Notifications** : Système de notifications in-app
- 📊 **Admin dashboard** : Stats, graphiques, vérifications

