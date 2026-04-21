const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

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

    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ordonnance_${prescription._id}.pdf`);
    doc.pipe(res);

    const W = 595.28;
    const BLUE      = '#0EA5E9';
    const DARK_BLUE = '#0369A1';
    const LIGHT_BG  = '#F0F9FF';
    const GRAY      = '#64748B';
    const DARK      = '#1E293B';
    const WHITE     = '#FFFFFF';
    const DIVIDER   = '#E2E8F0';

    // ── Header banner ──────────────────────────────────────────
    doc.rect(0, 0, W, 110).fill(BLUE);

    // Logo circle
    doc.circle(60, 55, 28).fill(WHITE);
    doc.fontSize(22).fillColor(BLUE).font('Helvetica-Bold').text('S', 49, 43);

    // Title
    doc.fontSize(26).fillColor(WHITE).font('Helvetica-Bold').text('SantéConnect', 100, 30);
    doc.fontSize(11).fillColor('#BAE6FD').font('Helvetica').text('Ordonnance Médicale', 100, 62);

    // Prescription ID badge
    const idText = `N° ${prescription._id.toString().slice(-8).toUpperCase()}`;
    doc.fontSize(9).fillColor(WHITE).font('Helvetica');
    const idW = doc.widthOfString(idText) + 20;
    doc.roundedRect(W - idW - 40, 42, idW, 22, 11).fill('rgba(255,255,255,0.2)');
    doc.fillColor(WHITE).text(idText, W - idW - 30, 48);

    // ── Date bar ───────────────────────────────────────────────
    doc.rect(0, 110, W, 32).fill(DARK_BLUE);
    const dateStr  = new Date(prescription.issuedAt || prescription.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const validStr = prescription.validUntil
      ? new Date(prescription.validUntil).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'Non spécifié';
    doc.fontSize(9).fillColor('#BAE6FD').font('Helvetica').text(`Emise le : ${dateStr}`, 50, 120);
    doc.text(`Valide jusqu'au : ${validStr}`, 320, 120);

    // ── Doctor / Patient cards ─────────────────────────────────
    const cardTop = 160;
    const cardH   = 110;

    // Doctor card
    doc.roundedRect(40, cardTop, 240, cardH, 10).fill(LIGHT_BG);
    doc.roundedRect(40, cardTop, 240, cardH, 10).stroke(BLUE);
    doc.rect(40, cardTop, 6, cardH).fill(BLUE); // accent bar

    doc.fontSize(8).fillColor(BLUE).font('Helvetica-Bold')
      .text('MÉDECIN PRESCRIPTEUR', 56, cardTop + 14);

    const d = prescription.doctor;
    doc.fontSize(13).fillColor(DARK).font('Helvetica-Bold')
      .text(`Dr. ${d.user.firstName} ${d.user.lastName}`, 56, cardTop + 30);
    doc.fontSize(10).fillColor(GRAY).font('Helvetica')
      .text(`Spécialité : ${d.specialty || 'N/A'}`, 56, cardTop + 52)
      .text(`N° Ordre   : ${d.licenseNumber || 'N/A'}`, 56, cardTop + 68)
      .text(`Tél         : ${d.user.phone || 'N/A'}`, 56, cardTop + 84);

    // Patient card
    doc.roundedRect(315, cardTop, 240, cardH, 10).fill(LIGHT_BG);
    doc.roundedRect(315, cardTop, 240, cardH, 10).stroke(BLUE);
    doc.rect(549, cardTop, 6, cardH).fill(BLUE); // accent bar right

    doc.fontSize(8).fillColor(BLUE).font('Helvetica-Bold')
      .text('PATIENT', 330, cardTop + 14);

    const p = prescription.patient;
    doc.fontSize(13).fillColor(DARK).font('Helvetica-Bold')
      .text(`${p.firstName} ${p.lastName}`, 330, cardTop + 30);
    doc.fontSize(10).fillColor(GRAY).font('Helvetica')
      .text(`Né(e) le : ${p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}`, 330, cardTop + 52)
      .text(`Ville     : ${p.city || 'N/A'}`, 330, cardTop + 68)
      .text(`Tél       : ${p.phone || 'N/A'}`, 330, cardTop + 84);

    // ── Diagnostic section ─────────────────────────────────────
    let yPos = cardTop + cardH + 24;

    if (prescription.diagnosis) {
      // Section title
      doc.fontSize(10).fillColor(BLUE).font('Helvetica-Bold').text('DIAGNOSTIC', 50, yPos);
      doc.moveTo(50, yPos + 16).lineTo(W - 50, yPos + 16).strokeColor(DIVIDER).lineWidth(1).stroke();
      yPos += 24;

      doc.roundedRect(40, yPos, W - 80, 40, 6).fill('#FFF7ED');
      doc.roundedRect(40, yPos, 4, 40, 2).fill('#F97316');
      doc.fontSize(11).fillColor(DARK).font('Helvetica')
        .text(prescription.diagnosis, 56, yPos + 12, { width: W - 110 });
      yPos += 56;
    }

    // ── Medications section ────────────────────────────────────
    doc.fontSize(10).fillColor(BLUE).font('Helvetica-Bold').text('MÉDICAMENTS PRESCRITS', 50, yPos);
    doc.moveTo(50, yPos + 16).lineTo(W - 50, yPos + 16).strokeColor(DIVIDER).lineWidth(1).stroke();
    yPos += 26;

    prescription.medications.forEach((med, i) => {
      const medH = med.instructions ? 95 : 78;

      // Card shadow effect
      doc.roundedRect(42, yPos + 2, W - 84, medH, 8).fill('#E2E8F0');
      doc.roundedRect(40, yPos, W - 80, medH, 8).fill(WHITE);
      doc.roundedRect(40, yPos, W - 80, medH, 8).stroke(DIVIDER).lineWidth(0.5);

      // Number badge
      doc.circle(64, yPos + 20, 12).fill(BLUE);
      doc.fontSize(10).fillColor(WHITE).font('Helvetica-Bold').text(`${i + 1}`, 59, yPos + 14);

      // Med name
      doc.fontSize(13).fillColor(DARK).font('Helvetica-Bold')
        .text(med.name, 84, yPos + 12, { width: W - 140 });

      // Details row
      const detailY = yPos + 34;
      const details = [
        { label: 'Dosage',     value: med.dosage },
        { label: 'Frequence',  value: med.frequency },
        { label: 'Duree',      value: med.duration },
      ];

      details.forEach((detail, j) => {
        const x = 84 + j * 160;
        doc.fontSize(8).fillColor(GRAY).font('Helvetica').text(detail.label, x, detailY);
        doc.fontSize(10).fillColor(DARK).font('Helvetica-Bold').text(detail.value || 'N/A', x, detailY + 13);
      });

      if (med.instructions) {
        doc.roundedRect(84, yPos + 68, W - 130, 18, 4).fill('#F1F5F9');
        doc.fontSize(9).fillColor(GRAY).font('Helvetica')
          .text(`Instructions : ${med.instructions}`, 90, yPos + 72, { width: W - 140 });
      }

      yPos += medH + 12;
    });

    // ── Notes section ──────────────────────────────────────────
    if (prescription.notes) {
      yPos += 8;
      doc.fontSize(10).fillColor(BLUE).font('Helvetica-Bold').text('NOTES DU MÉDECIN', 50, yPos);
      doc.moveTo(50, yPos + 16).lineTo(W - 50, yPos + 16).strokeColor(DIVIDER).lineWidth(1).stroke();
      yPos += 26;
      doc.roundedRect(40, yPos, W - 80, 50, 6).fill('#F8FAFC');
      doc.fontSize(10).fillColor(DARK).font('Helvetica')
        .text(prescription.notes, 56, yPos + 12, { width: W - 110 });
      yPos += 62;
    }

    // ── Footer ─────────────────────────────────────────────────
    const footerY = 780;
    doc.rect(0, footerY, W, 61.28).fill(DARK_BLUE);
    doc.moveTo(0, footerY).lineTo(W, footerY).strokeColor(BLUE).lineWidth(2).stroke();

    doc.fontSize(9).fillColor('#BAE6FD').font('Helvetica')
      .text('Document généré par SantéConnect — santeconnect.sn', 0, footerY + 12, { align: 'center', width: W });
    doc.fontSize(8).fillColor('#7DD3FC')
      .text('Ce document est valide uniquement avec la signature numérique du médecin', 0, footerY + 28, { align: 'center', width: W });
    doc.fontSize(8).fillColor('#38BDF8')
      .text(`Référence : ${prescription._id}`, 0, footerY + 44, { align: 'center', width: W });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};