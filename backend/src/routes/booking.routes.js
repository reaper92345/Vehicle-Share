const express = require("express");
const { createBooking, updateBookingStatus, getMyBookings, getOwnerDashboard } = require("../controllers/bookings.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", requireAuth, getMyBookings);
router.post("/", requireAuth, createBooking);
router.patch("/:id/status", requireAuth, updateBookingStatus);
router.get("/owner/dashboard", requireAuth, getOwnerDashboard);

module.exports = router;
