const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  type:      { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl:   { type: String },
  read:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const consultationSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'abandoned'],
    default: 'waiting',
  },
  messages: [messageSchema],
  startedAt:   { type: Date },
  endedAt:     { type: Date },
  duration:    { type: Number }, // minutes
  diagnosis:   { type: String },
  doctorNotes: { type: String },
  followUpDate:{ type: Date },
  hasPrescrip: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
