const express = require('express');
const { generatePaymentQr, confirmPayment } = require('../controllers/payments.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Generate QR code for a booking payment
router.get('/:id/qr', requireAuth, generatePaymentQr);

// Confirm payment after QR scan (mock)
router.post('/:id/confirm', requireAuth, confirmPayment);

module.exports = router;
