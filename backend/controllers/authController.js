const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
};

// Horaires par défaut pour tous les nouveaux médecins
const DEFAULT_WORKING_HOURS = {
  monday:    { start: '08:00', end: '17:00', active: true },
  tuesday:   { start: '08:00', end: '17:00', active: true },
  wednesday: { start: '08:00', end: '17:00', active: true },
  thursday:  { start: '08:00', end: '17:00', active: true },
  friday:    { start: '08:00', end: '17:00', active: true },
  saturday:  { start: '08:00', end: '12:00', active: false },
  sunday:    { start: '08:00', end: '12:00', active: false },
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, phone, role,
      dateOfBirth, gender, specialty, licenseNumber, consultationFee, bio, experience,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email déjà utilisé' });

    const user = await User.create({
      firstName, lastName, email, password, phone,
      role: role || 'patient', dateOfBirth, gender,
    });

    if (role === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialty,
        licenseNumber,
        consultationFee: consultationFee || 5000,
        bio: bio || '',
        experience: experience || 0,
        isVerified: false,       // admin doit valider
        isAvailable: true,
        workingHours: DEFAULT_WORKING_HOURS,
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('REGISTER ERROR:', err.message, err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Compte désactivé' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }
    res.json({ success: true, user, doctorProfile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  try {
    const fields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'bloodType', 'address', 'city', 'allergies', 'chronicDiseases'];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};