# SantéConnect

SantéConnect est une plateforme de téléconsultation médicale pensée pour le Sénégal. Elle met en relation des patients avec des médecins via chat en temps réel, avec un module IA de triage des symptômes, paiement Wave et génération d'ordonnances PDF.

## 💡 Pourquoi SantéConnect ?

Au Sénégal, l'accès à un médecin reste difficile pour beaucoup — distances, délais, coûts. SantéConnect permet de consulter un professionnel de santé depuis n'importe où, en quelques minutes, avec un paiement mobile intégré.

## ✨ Fonctionnalités

**Pour les patients**
- Triage IA des symptômes avec orientation vers la bonne spécialité
- Recherche et réservation de créneaux chez un médecin
- Chat en temps réel pendant la consultation
- Réception d'ordonnances PDF dans son espace personnel

**Pour les médecins**
- Gestion de l'agenda et des rendez-vous
- Interface de consultation avec chat intégré
- Émission d'ordonnances numériques
- Tableau de bord : consultations du jour, historique

**Pour l'administrateur**
- Vérification et validation des comptes médecins
- Gestion des patients et de tous les rendez-vous
- Statistiques globales de la plateforme

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend | Express.js + Node.js |
| Base de données | MongoDB Atlas (Mongoose) |
| Temps réel | Socket.io |
| Auth | JWT |
| IA Triage | Groq API (LLaMA 3.3 70B) |
| PDF | PDFKit |
| Paiement | Wave Business API |
| Déploiement | Render (back) + Vercel (front) |

## 🚀 Déploiement

**Frontend — Vercel**
- Dossier racine configuré sur `frontend/`
- Les variables d'environnement sont définies dans le dashboard Vercel

**Backend — Render**
- Base de données : MongoDB Atlas
- Les variables d'environnement sont configurées dans le dashboard Render