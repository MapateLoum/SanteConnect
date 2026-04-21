const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialty: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  bio: { type: String },
  experience: { type: Number, default: 0 }, // years
  consultationFee: { type: Number, required: true },
  languages: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  education: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  workingHours: {
    monday:    { start: String, end: String, active: { type: Boolean, default: true } },
    tuesday:   { start: String, end: String, active: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, active: { type: Boolean, default: true } },
    thursday:  { start: String, end: String, active: { type: Boolean, default: true } },
    friday:    { start: String, end: String, active: { type: Boolean, default: true } },
    saturday:  { start: String, end: String, active: { type: Boolean, default: false } },
    sunday:    { start: String, end: String, active: { type: Boolean, default: false } },
  },
  reviews: [{
    patient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating:    { type: Number, min: 1, max: 5 },
    comment:   { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  totalConsultations: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
