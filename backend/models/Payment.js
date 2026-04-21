const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  amount:      { type: Number, required: true },
  currency:    { type: String, default: 'XOF' },
  method:      { type: String, enum: ['wave', 'orange_money', 'free_money'], default: 'wave' },
  status:      { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  waveTransactionId: { type: String },
  waveCheckoutId:    { type: String },
  metadata:    { type: mongoose.Schema.Types.Mixed },
  paidAt:      { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
