const express = require('express');
const router = express.Router();
const { createPrescription, getMyPrescriptions, getPrescription, downloadPdf } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/my', protect, getMyPrescriptions);
router.get('/:id', protect, getPrescription);
router.get('/:id/pdf', protect, downloadPdf);

module.exports = router;
