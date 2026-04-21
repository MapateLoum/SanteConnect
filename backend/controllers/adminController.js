const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Payment = require('../models/Payment');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, totalConsultations, payments] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Consultation.countDocuments({ status: 'completed' }),
      Payment.find({ status: 'completed' }),
    ]);
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayAppointments = await Appointment.countDocuments({ date: { $gte: today } });
    const pendingVerifications = await Doctor.countDocuments({ isVerified: false });

    // Top specialties
    const specialtyAgg = await Appointment.aggregate([
      { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doc' } },
      { $unwind: '$doc' },
      { $group: { _id: '$doc.specialty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      stats: { totalPatients, totalDoctors, totalAppointments, totalConsultations, totalRevenue, todayAppointments, pendingVerifications },
      specialties: specialtyAgg,
      monthlyRevenue,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(query).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/doctors/pending
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: false }).populate('user', 'firstName lastName email phone createdAt');
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/verify
exports.verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isVerified: req.body.verified }, { new: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Médecin introuvable' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Appointment.countDocuments(query);
    res.json({ success: true, appointments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
