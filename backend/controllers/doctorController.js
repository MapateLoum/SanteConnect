const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// GET /api/doctors
exports.getDoctors = async (req, res) => {
  try {
    const { specialty, search, page = 1, limit = 12 } = req.query;
    const query = { isVerified: true };
    if (specialty) query.specialty = specialty;

    let doctors = await Doctor.find(query)
      .populate('user', 'firstName lastName email avatar phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ rating: -1 });

    if (search) {
      doctors = doctors.filter(d =>
        `${d.user.firstName} ${d.user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Doctor.countDocuments(query);
    res.json({ success: true, doctors, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'firstName lastName email avatar phone city');
    if (!doctor) return res.status(404).json({ success: false, message: 'Médecin introuvable' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id/slots
// Remplace uniquement la fonction getAvailableSlots dans doctorController.js

// GET /api/doctors/:id/slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date requise' });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Médecin introuvable' });

    // Sécurité : workingHours absent ou vide
    if (!doctor.workingHours) {
      return res.json({ success: true, slots: [] });
    }

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = doctor.workingHours[dayName];

    if (!daySchedule || !daySchedule.active || !daySchedule.start || !daySchedule.end) {
      return res.json({ success: true, slots: [] });
    }

    const existingAppointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) },
      status: { $in: ['pending', 'confirmed', 'ongoing'] },
    });

    const bookedSlots = existingAppointments.map(a => a.timeSlot.start);
    const allSlots = generateSlots(daySchedule.start, daySchedule.end, 30);
    const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

    res.json({ success: true, slots: availableSlots });
  } catch (err) {
    console.error('getAvailableSlots error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

function generateSlots(start, end, intervalMin) {
  const slots = [];
  let [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  while (sh * 60 + sm < eh * 60 + em) {
    slots.push(`${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}`);
    sm += intervalMin;
    if (sm >= 60) { sh++; sm -= 60; }
  }
  return slots;
}

// PUT /api/doctors/profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Profil médecin introuvable' });
    const fields = ['bio', 'consultationFee', 'languages', 'education', 'workingHours', 'isAvailable'];
    fields.forEach(f => { if (req.body[f] !== undefined) doctor[f] = req.body[f]; });
    await doctor.save();
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctors/:id/review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Médecin introuvable' });

    const alreadyReviewed = doctor.reviews.find(r => r.patient.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Vous avez déjà noté ce médecin' });

    doctor.reviews.push({ patient: req.user._id, rating, comment });
    doctor.totalReviews = doctor.reviews.length;
    doctor.rating = doctor.reviews.reduce((acc, r) => acc + r.rating, 0) / doctor.reviews.length;
    await doctor.save();
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/specialties
exports.getSpecialties = async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty');
    res.json({ success: true, specialties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
