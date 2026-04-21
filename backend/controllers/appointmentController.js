const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const User = require('../models/User');

// POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms, triageResult, type } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Médecin introuvable' });

    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      'timeSlot.start': timeSlot.start,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) return res.status(400).json({ success: false, message: 'Ce créneau est déjà pris' });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      symptoms,
      triageResult,
      type: type || 'chat',
      amount: doctor.consultationFee,
      paymentStatus: 'pending',
    });

    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } },
    ]);

    // Notify doctor
    const doctorUser = await User.findById(doctor.user);
    if (doctorUser) {
      doctorUser.notifications.push({
        message: `Nouveau RDV de ${req.user.firstName} ${req.user.lastName} le ${new Date(date).toLocaleDateString('fr-FR')}`,
        type: 'appointment',
      });
      await doctorUser.save();
    }

    if (req.io) req.io.to(`doctor_${doctor.user}`).emit('new_appointment', appointment);

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return res.status(404).json({ success: false, message: 'Profil médecin introuvable' });
      query.doctor = doctor._id;
    }

    if (status) query.status = status;
    if (upcoming === 'true') query.date = { $gte: new Date() };

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone avatar')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName avatar' } })
      .sort({ date: upcoming === 'true' ? 1 : -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone avatar dateOfBirth gender bloodType allergies chronicDiseases')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName avatar' } });
    if (!appointment) return res.status(404).json({ success: false, message: 'RDV introuvable' });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'RDV introuvable' });

    appointment.status = status;
    if (cancelReason) appointment.cancelReason = cancelReason;

    if (status === 'ongoing') {
      let consultation = await Consultation.findOne({ appointment: appointment._id });
      if (!consultation) {
        const doctor = await Doctor.findById(appointment.doctor);
        consultation = await Consultation.create({
          appointment: appointment._id,
          patient: appointment.patient,
          doctor: appointment.doctor,
          status: 'active',
          startedAt: new Date(),
        });
        doctor.totalConsultations += 1;
        await doctor.save();
      }
    }

    await appointment.save();

    // Notify patient
    const patientUser = await User.findById(appointment.patient);
    if (patientUser) {
      const statusMsg = { confirmed: 'confirmé', cancelled: 'annulé', ongoing: 'en cours' };
      patientUser.notifications.push({
        message: `Votre rendez-vous a été ${statusMsg[status] || status}`,
        type: 'appointment',
      });
      await patientUser.save();
    }

    if (req.io) req.io.to(`patient_${appointment.patient}`).emit('appointment_updated', appointment);

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/appointments/:id
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'RDV introuvable' });
    if (appointment.patient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.reason || 'Annulé par le patient';
    await appointment.save();
    res.json({ success: true, message: 'RDV annulé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
