const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, getMyPayments, webhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/initiate', protect, initiatePayment);
router.post('/verify', protect, verifyPayment);
router.get('/my', protect, getMyPayments);
router.post('/webhook', webhook);

module.exports = router;
