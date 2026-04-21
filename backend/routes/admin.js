const express = require('express');
const router = express.Router();
const { getStats, getUsers, toggleUser, getPendingDoctors, verifyDoctor, getAllAppointments } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/verify', verifyDoctor);
router.get('/appointments', getAllAppointments);

module.exports = router;
