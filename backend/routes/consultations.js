const express = require('express');
const router = express.Router();
const { getConsultation, getByAppointment, getMyConsultations, endConsultation, sendMessage } = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyConsultations);
router.get('/appointment/:appointmentId', protect, getByAppointment);
router.get('/:id', protect, getConsultation);
router.put('/:id/end', protect, endConsultation);
router.post('/:id/message', protect, sendMessage);

module.exports = router;
