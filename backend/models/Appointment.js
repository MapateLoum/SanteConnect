const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:  { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date:    { type: Date, required: true },
  timeSlot: {
    start: { type: String, required: true },
    end:   { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
  },
  type: { type: String, enum: ['chat', 'video'], default: 'chat' },
  symptoms: { type: String },
  suggestedSpecialty: { type: String },
  triageResult: {
    specialty: String,
    urgency:   { type: String, enum: ['low', 'medium', 'high', 'emergency'] },
    reasoning: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentId:  { type: String },
  amount:     { type: Number },
  notes:      { type: String },
  cancelReason: { type: String },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
