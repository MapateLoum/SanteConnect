const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const https = require('https');

async function waveRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'api.wave.com',
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
        ...(bodyStr && { 'Content-Length': Buffer.byteLength(bodyStr) }),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// POST /api/payments/initiate
exports.initiatePayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } });
    if (!appointment) return res.status(404).json({ success: false, message: 'RDV introuvable' });
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    // Create Wave checkout session
    const waveResponse = await waveRequest('/v1/checkout/sessions', 'POST', {
      amount: appointment.amount,
      currency: 'XOF',
      error_url: `${process.env.CLIENT_URL}/payment/error`,
      success_url: `${process.env.CLIENT_URL}/payment/success?appointmentId=${appointmentId}`,
      checkout_status: 'open',
    });

    let checkoutId = null;
    let checkoutUrl = null;

    if (waveResponse.status === 200 && waveResponse.data?.id) {
      checkoutId = waveResponse.data.id;
      checkoutUrl = waveResponse.data.wave_launch_url || waveResponse.data.checkout_url;
    }

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user._id,
      doctor: appointment.doctor._id,
      amount: appointment.amount,
      method: 'wave',
      status: 'pending',
      waveCheckoutId: checkoutId,
    });

    res.json({
      success: true,
      payment,
      checkoutUrl: checkoutUrl || `${process.env.CLIENT_URL}/payment/mock?paymentId=${payment._id}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Paiement introuvable' });

    payment.status = 'completed';
    payment.waveTransactionId = transactionId || 'MOCK_' + Date.now();
    payment.paidAt = new Date();
    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: 'paid', paymentId: payment._id });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/my
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patient: req.user._id })
      .populate('appointment')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/webhook (Wave webhook)
exports.webhook = async (req, res) => {
  try {
    const { id, status, transaction_id } = req.body;
    if (status === 'succeeded') {
      const payment = await Payment.findOne({ waveCheckoutId: id });
      if (payment) {
        payment.status = 'completed';
        payment.waveTransactionId = transaction_id;
        payment.paidAt = new Date();
        await payment.save();
        await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: 'paid' });
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
