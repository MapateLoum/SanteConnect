const express = require('express');
const router = express.Router();
const { analyzeSymptoms } = require('../controllers/triageController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyzeSymptoms);

module.exports = router;
