// create-admin.js
// Place ce fichier à la racine du dossier backend/
// Utilisation : node create-admin.js

require('dotenv').config();
const mongoose = require('mongoose');

// ─── Configure ici ───────────────────────────────────────
const ADMIN_EMAIL     = 'loumpapamapate@gmail.com';
const ADMIN_PASSWORD  = 'Passer2003';
const ADMIN_FIRSTNAME = 'Super';
const ADMIN_LASTNAME  = 'Admin';
const ADMIN_PHONE     = '778222941';
// ─────────────────────────────────────────────────────────

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const User = require('./models/User');

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      if (existing.role === 'admin') {
        console.log('ℹ️  Ce compte est déjà admin. Réinitialisation du mot de passe...');
      } else {
        console.log(`ℹ️  Compte existant (role: ${existing.role}) → upgrade en admin...`);
        existing.role = 'admin';
      }
      // Le pre-save hook de User.js va hasher correctement
      existing.password = ADMIN_PASSWORD;
      await existing.save();
      console.log('✅ Compte mis à jour.');
    } else {
      // Nouveau compte — pre-save hook hache le password automatiquement
      await User.create({
        firstName: ADMIN_FIRSTNAME,
        lastName:  ADMIN_LASTNAME,
        email:     ADMIN_EMAIL,
        password:  ADMIN_PASSWORD,
        phone:     ADMIN_PHONE,
        role:      'admin',
        isActive:  true,
      });
      console.log('🎉 Nouveau compte admin créé.');
    }

    console.log('');
    console.log('─────────────────────────────────');
    console.log(`   Email        : ${ADMIN_EMAIL}`);
    console.log(`   Mot de passe : ${ADMIN_PASSWORD}`);
    console.log('─────────────────────────────────');
    console.log('👉 Connecte-toi sur /auth/login');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
}

createAdmin();