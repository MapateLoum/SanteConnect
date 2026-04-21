const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
  patient:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:       { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  medications: [{
    name:        { type: String, required: true },
    dosage:      { type: String, required: true },
    frequency:   { type: String, required: true },
    duration:    { type: String, required: true },
    instructions:{ type: String },
  }],
  diagnosis:   { type: String },
  notes:       { type: String },
  validUntil:  { type: Date },
  pdfUrl:      { type: String },
  issuedAt:    { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
