const express = require('express');
const { generatePaymentQr, confirmPayment, resendReceipt, downloadReceipt } = require('../controllers/payments.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:id/qr', requireAuth, generatePaymentQr);
router.post('/:id/confirm', requireAuth, confirmPayment);
router.post('/:id/resend-receipt', requireAuth, resendReceipt);
router.get('/:id/receipt', requireAuth, downloadReceipt);

module.exports = router;
