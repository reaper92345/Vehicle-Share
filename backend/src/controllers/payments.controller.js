const { pool } = require("../db/pool");
const { asyncHandler } = require("../utils/async-handler");
const QRCode = require("qrcode");
const { sendPaymentReceiptEmail, renderReceiptHtml, invoiceNumber } = require("../services/email.service");

const BOOKING_DETAIL_SQL = `
  SELECT b.*, e.title AS equipment_title, e.location, e.price_per_day, e.image_url, e.owner_id,
         renter.full_name AS renter_name, renter.email AS renter_email, renter.phone_number AS renter_phone,
         owner.full_name AS owner_name, owner.email AS owner_email, owner.phone_number AS owner_phone
  FROM bookings b
  JOIN equipment e ON e.id = b.equipment_id
  JOIN users renter ON renter.id = b.renter_id
  JOIN users owner ON owner.id = e.owner_id
  WHERE b.id = $1
`;

async function loadBookingDetail(bookingId) {
  const { rows } = await pool.query(BOOKING_DETAIL_SQL, [bookingId]);
  return rows[0] || null;
}

function canAccessBooking(req, booking) {
  if (!booking) return false;
  if (req.user.userType === "admin") return true;
  return booking.renter_id === req.user.id || booking.owner_id === req.user.id;
}

const generatePaymentQr = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (!bookingId) {
    return res.status(400).json({ error: "Invalid booking id" });
  }

  const booking = await loadBookingDetail(bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (!canAccessBooking(req, booking)) {
    return res.status(403).json({ error: "You cannot access this payment." });
  }

  const amount = booking.total_price;
  const paymentUrl = `https://rbb-bank.example.com/pay?bookingId=${bookingId}&amount=${amount}`;
  const qrDataUrl = await QRCode.toDataURL(paymentUrl);
  res.status(200).json({ qrDataUrl, paymentUrl, amount, invoiceNo: invoiceNumber(bookingId) });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (!bookingId) {
    return res.status(400).json({ error: "Invalid booking id" });
  }

  const existing = await loadBookingDetail(bookingId);
  if (!existing) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (existing.renter_id !== req.user.id && req.user.userType !== "admin") {
    return res.status(403).json({ error: "Only the hire customer can confirm this payment." });
  }
  if (!["Approved", "Active"].includes(existing.status)) {
    return res.status(409).json({ error: "Payment can only be confirmed for approved or active bookings." });
  }

  const nextStatus = existing.status === "Approved" ? "Active" : existing.status;
  const result = await pool.query(
    `UPDATE bookings
     SET payment_status = 'paid', status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [bookingId, nextStatus]
  );

  const booking = await loadBookingDetail(bookingId);
  let emailResult = { sent: false };
  try {
    emailResult = await sendPaymentReceiptEmail(booking);
  } catch (error) {
    console.error("[payments] Failed to send receipt email:", error);
    emailResult = { sent: false, error: "email_failed" };
  }

  res.status(200).json({
    booking: result.rows[0],
    invoiceNo: invoiceNumber(bookingId),
    email: {
      sent: Boolean(emailResult.sent),
      invoiceNo: emailResult.invoiceNo,
      previewUrl: emailResult.previewUrl,
      mode: emailResult.mode,
    },
  });
});

const resendReceipt = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (!bookingId) {
    return res.status(400).json({ error: "Invalid booking id" });
  }
  const booking = await loadBookingDetail(bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (!canAccessBooking(req, booking)) {
    return res.status(403).json({ error: "You cannot access this receipt." });
  }
  if (booking.payment_status !== "paid") {
    return res.status(409).json({ error: "Receipt is available only after payment." });
  }

  const emailResult = await sendPaymentReceiptEmail(booking);
  res.status(200).json({
    ok: true,
    invoiceNo: emailResult.invoiceNo,
    email: { sent: Boolean(emailResult.sent), previewUrl: emailResult.previewUrl, mode: emailResult.mode },
  });
});

const downloadReceipt = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (!bookingId) {
    return res.status(400).json({ error: "Invalid booking id" });
  }
  const booking = await loadBookingDetail(bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (!canAccessBooking(req, booking)) {
    return res.status(403).json({ error: "You cannot access this receipt." });
  }
  if (booking.payment_status !== "paid") {
    return res.status(409).json({ error: "Receipt is available only after payment." });
  }

  const html = renderReceiptHtml(booking);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", `inline; filename="${invoiceNumber(bookingId)}.html"`);
  res.status(200).send(html);
});

module.exports = {
  generatePaymentQr,
  confirmPayment,
  resendReceipt,
  downloadReceipt,
};
