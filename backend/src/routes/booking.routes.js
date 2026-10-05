const express = require("express");
const { createBooking, updateBookingStatus, getMyBookings } = require("../controllers/bookings.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", requireAuth, getMyBookings);
router.post("/", requireAuth, createBooking);
router.patch("/:id/status", requireAuth, updateBookingStatus);

module.exports = router;
