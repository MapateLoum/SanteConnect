const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// POST /api/prescriptions
exports.createPrescription = async (req, res) => {
  try {
    const { consultationId, medications, diagnosis, notes, validUntil } = req.body;
    const consultation = await Consultation.findById(consultationId)
      .populate('patient', 'firstName lastName dateOfBirth')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } });

    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation introuvable' });

    const prescription = await Prescription.create({
      consultation: consultationId,
      patient: consultation.patient._id,
      doctor: consultation.doctor._id,
      medications,
      diagnosis,
      notes,
      validUntil: validUntil ? new Date(validUntil) : null,
    });

    consultation.hasPrescrip = true;
    await consultation.save();

    await prescription.populate([
      { path: 'patient', select: 'firstName lastName dateOfBirth gender' },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } },
    ]);

    res.status(201).json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/my
exports.getMyPrescriptions = async (req, res) => {
  try {
    const query = req.user.role === 'patient'
      ? { patient: req.user._id }
      : { doctor: (await Doctor.findOne({ user: req.user._id }))?._id };
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/:id
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth gender city phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName phone' } });
    if (!prescription) return res.status(404).json({ success: false, message: 'Ordonnance introuvable' });
    res.json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/:id/pdf
exports.downloadPdf = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth gender city phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName phone' } });
    if (!prescription) return res.status(404).json({ success: false, message: 'Ordonnance introuvable' });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ordonnance_${prescription._id}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#0EA5E9').text('SantéConnect', 50, 50);
    doc.fontSize(10).fillColor('#666').text('Plateforme de téléconsultation médicale', 50, 78);
    doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#0EA5E9').stroke();

    // Doctor info
    doc.fontSize(12).fillColor('#333').text('MÉDECIN PRESCRIPTEUR', 50, 120);
    const d = prescription.doctor;
    doc.fontSize(11).fillColor('#000')
      .text(`Dr. ${d.user.firstName} ${d.user.lastName}`, 50, 140)
      .text(`Spécialité : ${d.specialty}`, 50, 158)
      .text(`N° Ordre : ${d.licenseNumber}`, 50, 176);

    // Patient info
    doc.fontSize(12).fillColor('#333').text('PATIENT', 300, 120);
    const p = prescription.patient;
    doc.fontSize(11).fillColor('#000')
      .text(`${p.firstName} ${p.lastName}`, 300, 140)
      .text(`Né(e) le : ${p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}`, 300, 158)
      .text(`Ville : ${p.city || 'N/A'}`, 300, 176);

    doc.moveTo(50, 210).lineTo(545, 210).strokeColor('#ddd').stroke();

    // Date
    doc.fontSize(10).fillColor('#666')
      .text(`Date : ${new Date(prescription.issuedAt).toLocaleDateString('fr-FR')}`, 50, 222)
      .text(`Valide jusqu\'au : ${prescription.validUntil ? new Date(prescription.validUntil).toLocaleDateString('fr-FR') : 'Non spécifié'}`, 300, 222);

    // Diagnosis
    if (prescription.diagnosis) {
      doc.fontSize(12).fillColor('#333').text('DIAGNOSTIC', 50, 255);
      doc.fontSize(11).fillColor('#000').text(prescription.diagnosis, 50, 275, { width: 495 });
    }

    // Medications
    let yPos = 320;
    doc.fontSize(12).fillColor('#333').text('MÉDICAMENTS PRESCRITS', 50, yPos);
    yPos += 25;

    prescription.medications.forEach((med, i) => {
      doc.rect(50, yPos, 495, 80).fillColor('#f8fafc').fill().strokeColor('#e2e8f0').stroke();
      doc.fontSize(12).fillColor('#0EA5E9').text(`${i + 1}. ${med.name}`, 65, yPos + 10);
      doc.fontSize(10).fillColor('#333')
        .text(`Dosage : ${med.dosage}`, 65, yPos + 28)
        .text(`Fréquence : ${med.frequency}`, 65, yPos + 44)
        .text(`Durée : ${med.duration}`, 300, yPos + 28);
      if (med.instructions) doc.text(`Instructions : ${med.instructions}`, 65, yPos + 60);
      yPos += 95;
    });

    if (prescription.notes) {
      doc.fontSize(12).fillColor('#333').text('NOTES', 50, yPos + 10);
      doc.fontSize(11).fillColor('#000').text(prescription.notes, 50, yPos + 30, { width: 495 });
    }

    // Footer
    doc.moveTo(50, 750).lineTo(545, 750).strokeColor('#0EA5E9').stroke();
    doc.fontSize(9).fillColor('#999')
      .text('Document généré par SantéConnect — santeconnect.sn', 50, 760, { align: 'center' })
      .text('Ce document est valide uniquement avec la signature numérique du médecin', 50, 775, { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
