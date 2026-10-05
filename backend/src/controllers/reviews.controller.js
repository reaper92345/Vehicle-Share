const { pool } = require("../db/pool");
const { asyncHandler } = require("../utils/async-handler");
const { parsePositiveInteger } = require("../utils/validation");

const createReview = asyncHandler(async (req, res) => {
  const { booking_id, rating, comment } = req.body || {};

  if (!Number.isInteger(Number(booking_id)) || Number(booking_id) <= 0) {
    return res.status(400).json({ error: "booking_id must be a positive integer." });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be an integer between 1 and 5." });
  }

  const bookingResult = await pool.query(
    `SELECT b.id, b.renter_id, b.equipment_id, e.owner_id
     FROM bookings b
     JOIN equipment e ON e.id = b.equipment_id
     WHERE b.id = $1`,
    [booking_id]
  );

  if (bookingResult.rowCount === 0) {
    return res.status(404).json({ error: "Booking not found." });
  }

  const booking = bookingResult.rows[0];
  const isRenter = booking.renter_id === req.user.id;
  const isOwner = booking.owner_id === req.user.id;

  if (!isRenter && !isOwner) {
    return res.status(403).json({ error: "You can only review a booking in which you participated." });
  }

  const revieweeId = isRenter ? booking.owner_id : booking.renter_id;

  const existingReview = await pool.query(
    `SELECT id FROM reviews WHERE booking_id = $1 AND reviewer_id = $2`,
    [booking_id, req.user.id]
  );

  if (existingReview.rowCount > 0) {
    return res.status(409).json({ error: "You have already reviewed this booking." });
  }

  const insertResult = await pool.query(
    `INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [booking_id, req.user.id, revieweeId, rating, comment || null]
  );

  return res.status(201).json({ review: insertResult.rows[0] });
});

const getReviewsForUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const userExists = await pool.query(`SELECT id FROM users WHERE id = $1`, [userId]);
  if (userExists.rowCount === 0) {
    return res.status(404).json({ error: "User not found." });
  }

  const { rows } = await pool.query(
    `SELECT r.*, u.full_name AS reviewer_name
     FROM reviews r
     JOIN users u ON u.id = r.reviewer_id
     WHERE r.reviewee_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );

  return res.status(200).json({ reviews: rows });
});

module.exports = { createReview, getReviewsForUser };
