const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, getAvailableSlots, updateDoctorProfile, addReview, getSpecialties } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/specialties', getSpecialties);  // ← en premier
router.get('/:id', getDoctor);               // ← après
router.get('/:id/slots', getAvailableSlots);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.post('/:id/review', protect, authorize('patient'), addReview);
module.exports = router;
