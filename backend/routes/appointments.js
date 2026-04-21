const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, getAppointment, updateStatus, cancelAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('patient'), createAppointment);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateStatus);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
