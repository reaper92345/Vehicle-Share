const { pool } = require("../db/pool");
const { asyncHandler } = require("../utils/async-handler");
const { isNonEmptyString, parsePositiveInteger } = require("../utils/validation");

function getBookingOverlapQuery() {
  return `
    SELECT id
    FROM bookings
    WHERE equipment_id = $1
      AND status IN ('Approved', 'Active')
      AND start_date < $3
      AND end_date > $2
  `;
}

const createBooking = asyncHandler(async (req, res) => {
  if (req.user.userType !== "renter" && req.user.userType !== "both") {
    return res.status(403).json({ error: "Only renters can create booking requests." });
  }

  const { equipment_id, start_date, end_date } = req.body || {};

  if (!Number.isInteger(Number(equipment_id)) || Number(equipment_id) <= 0) {
    return res.status(400).json({ error: "equipment_id must be a positive integer." });
  }

  if (!start_date || !end_date || new Date(start_date) == "Invalid Date" || new Date(end_date) == "Invalid Date") {
    return res.status(400).json({ error: "start_date and end_date must be valid ISO dates." });
  }

  const start = new Date(`${start_date}T00:00:00.000Z`);
  const end = new Date(`${end_date}T00:00:00.000Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return res.status(400).json({ error: "end_date must be on or after start_date." });
  }

  const equipmentResult = await pool.query(
    `SELECT id, owner_id, price_per_day, is_available, title
     FROM equipment
     WHERE id = $1`,
    [equipment_id]
  );

  if (equipmentResult.rowCount === 0) {
    return res.status(404).json({ error: "Equipment listing not found." });
  }

  const equipment = equipmentResult.rows[0];
  if (!equipment.is_available) {
    return res.status(409).json({ error: "This equipment is not currently available for booking." });
  }

  const overlapResult = await pool.query(getBookingOverlapQuery(), [
    equipment.id,
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10),
  ]);

  if (overlapResult.rowCount > 0) {
    return res.status(409).json({
      error: "This equipment is already booked for the requested date range.",
      conflictingBookingIds: overlapResult.rows.map((row) => row.id),
    });
  }

  const differenceInMs = end.getTime() - start.getTime();
  const dayCount = Math.max(1, Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1);
  const totalPrice = Number(equipment.price_per_day) * dayCount;

  const bookingResult = await pool.query(
    `INSERT INTO bookings (equipment_id, renter_id, start_date, end_date, total_price, status)
     VALUES ($1, $2, $3, $4, $5, 'Pending')
     RETURNING *`,
    [equipment.id, req.user.id, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10), totalPrice]
  );

  return res.status(201).json({ booking: bookingResult.rows[0] });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInteger(req.params.id);
  if (!bookingId) {
    return res.status(400).json({ error: "Booking id must be a positive integer." });
  }

  const { status, reason } = req.body || {};
  if (!status || !["Approved", "Cancelled"].includes(status)) {
    return res.status(400).json({ error: "status must be either Approved or Cancelled." });
  }

  const bookingResult = await pool.query(
    `SELECT b.id, b.status, b.equipment_id, e.owner_id, b.renter_id
     FROM bookings b
     JOIN equipment e ON e.id = b.equipment_id
     WHERE b.id = $1`,
    [bookingId]
  );

  if (bookingResult.rowCount === 0) {
    return res.status(404).json({ error: "Booking not found." });
  }

  const booking = bookingResult.rows[0];
  if (booking.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Only the equipment owner can update booking status." });
  }

  if (booking.status !== "Pending") {
    return res.status(409).json({ error: "Only pending bookings can be approved or cancelled." });
  }

  const nextStatus = status === "Approved" ? "Approved" : "Cancelled";
  const updated = await pool.query(
    `UPDATE bookings
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [nextStatus, bookingId]
  );

  return res.status(200).json({
    booking: updated.rows[0],
    reason: isNonEmptyString(reason, 500) ? reason.trim() : undefined,
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const whereClause = req.user.userType === "owner" ? "e.owner_id = $1" : "b.renter_id = $1";
  const values = [req.user.id];

  const { rows } = await pool.query(
    `SELECT b.*, e.title AS equipment_title, e.location, u.full_name AS renter_name, owner.full_name AS owner_name
     FROM bookings b
     JOIN equipment e ON e.id = b.equipment_id
     JOIN users u ON u.id = b.renter_id
     JOIN users owner ON owner.id = e.owner_id
     WHERE ${whereClause}
     ORDER BY b.created_at DESC`,
    values
  );

  return res.status(200).json({ bookings: rows });
});

module.exports = { createBooking, updateBookingStatus, getMyBookings };
