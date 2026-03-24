const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { generateBillPDF } = require('../controllers/pdfController');

router.get('/:id', protect, generateBillPDF);

module.exports = router;