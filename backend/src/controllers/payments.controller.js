const { pool } = require('../db/pool');
const { asyncHandler } = require('../utils/async-handler');
const QRCode = require('qrcode');

// Generate QR code for payment based on booking ID
// Returns a Data URL PNG image
const generatePaymentQr = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (!bookingId) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }
  // Fetch booking to get amount
  const { rows } = await pool.query(
    `SELECT total_price FROM bookings WHERE id = $1`,
    [bookingId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  const amount = rows[0].total_price;
  // Mock RBB payment URL – replace with real endpoint when available
  const paymentUrl = `https://rbb-bank.example.com/pay?bookingId=${bookingId}&amount=${amount}`;
  const qrDataUrl = await QRCode.toDataURL(paymentUrl);
  res.status(200).json({ qrDataUrl, paymentUrl });
});

// Confirm payment after QR scan (mock implementation)
const confirmPayment = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (!bookingId) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }
  const result = await pool.query(
    `UPDATE bookings SET payment_status = 'paid' WHERE id = $1 RETURNING *`,
    [bookingId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.status(200).json({ booking: result.rows[0] });
});

module.exports = {
  generatePaymentQr,
  confirmPayment,
};
