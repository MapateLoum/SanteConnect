const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// GET /api/consultations/:id
exports.getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patient', 'firstName lastName email avatar dateOfBirth gender bloodType allergies chronicDiseases')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName avatar' } })
      .populate('appointment');
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation introuvable' });
    res.json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/consultations/appointment/:appointmentId
exports.getByAppointment = async (req, res) => {
  try {
    const consultation = await Consultation.findOne({ appointment: req.params.appointmentId })
      .populate('patient', 'firstName lastName email avatar dateOfBirth gender bloodType allergies')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName avatar' } });
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation introuvable' });
    res.json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/consultations/my
exports.getMyConsultations = async (req, res) => {
  try {
    const query = req.user.role === 'patient'
      ? { patient: req.user._id }
      : { doctor: (await Doctor.findOne({ user: req.user._id }))?._id };

    const consultations = await Consultation.find(query)
      .populate('patient', 'firstName lastName avatar')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName avatar' } })
      .populate('appointment')  // ✅ ajout
      .sort({ createdAt: -1 });

    res.json({ success: true, consultations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/consultations/:id/end
exports.endConsultation = async (req, res) => {
  try {
    const { diagnosis, doctorNotes, followUpDate } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation introuvable' });

    consultation.status = 'completed';
    consultation.endedAt = new Date();
    consultation.duration = Math.round((consultation.endedAt - consultation.startedAt) / 60000);
    consultation.diagnosis = diagnosis;
    consultation.doctorNotes = doctorNotes;
    if (followUpDate) consultation.followUpDate = new Date(followUpDate);
    await consultation.save();

    await Appointment.findByIdAndUpdate(consultation.appointment, { status: 'completed' });

    const doctor = await Doctor.findById(consultation.doctor);
    if (doctor) {
      doctor.totalRevenue += (await Appointment.findById(consultation.appointment))?.amount || 0;
      await doctor.save();
    }

    res.json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/consultations/:id/message
exports.sendMessage = async (req, res) => {
  try {
    const { content, type } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation introuvable' });

    const message = { sender: req.user._id, content, type: type || 'text' };
    consultation.messages.push(message);
    await consultation.save();

    const newMsg = consultation.messages[consultation.messages.length - 1];
    if (req.io) req.io.to(`consultation_${consultation._id}`).emit('new_message', { ...newMsg.toObject(), sender: req.user });

    res.status(201).json({ success: true, message: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
