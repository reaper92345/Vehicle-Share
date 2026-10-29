const { pool } = require("../db/pool");
const { asyncHandler } = require("../utils/async-handler");
const { isNonEmptyString, parsePositiveInteger } = require("../utils/validation");

const BOOKING_STATUSES = ["Pending", "Approved", "Active", "Completed", "Cancelled"];

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

  const { equipment_id, start_date, end_date, terms_accepted, deployment_location } = req.body || {};

  if (!terms_accepted) {
    return res.status(400).json({ error: "You must accept the EquipShare Rental Agreement & Terms before submitting a booking." });
  }

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

  let siteLocation = null;
  if (deployment_location !== undefined && deployment_location !== null && deployment_location !== "") {
    if (!isNonEmptyString(deployment_location, 200)) {
      return res.status(400).json({ error: "deployment_location must be 200 characters or fewer." });
    }
    siteLocation = deployment_location.trim();
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
    `INSERT INTO bookings (equipment_id, renter_id, start_date, end_date, total_price, status, payment_status, terms_accepted_at, deployment_location)
     VALUES ($1, $2, $3, $4, $5, 'Pending', 'unpaid', NOW(), $6)
     RETURNING *`,
    [equipment.id, req.user.id, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10), totalPrice, siteLocation]
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
  if (booking.owner_id !== req.user.id && req.user.userType !== "admin") {
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
  const { rows } = await pool.query(
    `SELECT b.id, b.equipment_id, b.renter_id, b.start_date, b.end_date,
            b.total_price, b.status, b.payment_status, b.created_at, b.updated_at,
            b.terms_accepted_at, b.deployment_location,
            e.title AS equipment_title, e.location, e.price_per_day, e.image_url, e.owner_id,
            u.full_name AS owner_name, u.email AS owner_email, u.phone_number AS owner_phone
     FROM bookings b
     JOIN equipment e ON e.id = b.equipment_id
     JOIN users u ON u.id = e.owner_id
     WHERE b.renter_id = $1
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );
  return res.status(200).json({ bookings: rows });
});

const getOwnerDashboard = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT b.*, e.title AS equipment_title, e.location, e.price_per_day, e.image_url,
            u.full_name AS renter_name, u.email AS renter_email, u.phone_number AS renter_phone
     FROM bookings b
     JOIN equipment e ON e.id = b.equipment_id
     JOIN users u ON u.id = b.renter_id
     WHERE e.owner_id = $1
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );
  return res.status(200).json({ bookings: rows });
});

const listAllBookings = asyncHandler(async (req, res) => {
  const { status, payment_status, from, to } = req.query;
  const conditions = [];
  const values = [];

  if (status) {
    if (status === "Paid") {
      conditions.push(`b.payment_status = 'paid'`);
    } else if (status === "Unpaid") {
      conditions.push(`b.payment_status <> 'paid'`);
    } else if (BOOKING_STATUSES.includes(status)) {
      values.push(status);
      conditions.push(`b.status = $${values.length}`);
    } else {
      return res.status(400).json({ error: "Invalid status filter." });
    }
  }
  if (payment_status) {
    if (!["paid", "unpaid"].includes(String(payment_status).toLowerCase())) {
      return res.status(400).json({ error: "payment_status must be paid or unpaid." });
    }
    values.push(String(payment_status).toLowerCase());
    conditions.push(`b.payment_status = $${values.length}`);
  }
  if (from) {
    values.push(from);
    conditions.push(`b.start_date >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`b.end_date <= $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT b.*, e.title AS equipment_title, e.location, e.price_per_day, e.image_url,
            u.full_name AS renter_name, u.email AS renter_email, u.phone_number AS renter_phone,
            owner.full_name AS owner_name, owner.email AS owner_email, owner.phone_number AS owner_phone
     FROM bookings b
     JOIN equipment e ON e.id = b.equipment_id
     JOIN users u ON u.id = b.renter_id
     JOIN users owner ON owner.id = e.owner_id
     ${where}
     ORDER BY b.created_at DESC`,
    values
  );
  res.status(200).json({ bookings: rows });
});

const adminUpdateBooking = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInteger(req.params.id);
  if (!bookingId) {
    return res.status(400).json({ error: "Invalid booking id." });
  }
  const { status, payment_status, deployment_location } = req.body || {};
  const fields = [];
  const values = [];

  if (status) {
    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid booking status." });
    }
    fields.push(`status = $${values.length + 1}`);
    values.push(status);
  }
  if (payment_status) {
    if (!["paid", "unpaid"].includes(payment_status)) {
      return res.status(400).json({ error: "payment_status must be paid or unpaid." });
    }
    fields.push(`payment_status = $${values.length + 1}`);
    values.push(payment_status);
  }
  if (deployment_location !== undefined) {
    fields.push(`deployment_location = $${values.length + 1}`);
    values.push(deployment_location ? String(deployment_location).trim() : null);
  }
  if (fields.length === 0) {
    return res.status(400).json({ error: "No updatable fields provided." });
  }
  fields.push("updated_at = NOW()");
  values.push(bookingId);
  const { rows } = await pool.query(
    `UPDATE bookings SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Booking not found." });
  }
  res.status(200).json({ booking: rows[0] });
});

const deleteBooking = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInteger(req.params.id);
  if (!bookingId) {
    return res.status(400).json({ error: "Invalid booking id." });
  }
  const result = await pool.query("DELETE FROM bookings WHERE id = $1 RETURNING id", [bookingId]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Booking not found." });
  }
  res.status(200).json({ message: "Booking deleted." });
});

module.exports = {
  createBooking,
  updateBookingStatus,
  getMyBookings,
  getOwnerDashboard,
  listAllBookings,
  adminUpdateBooking,
  deleteBooking,
};
