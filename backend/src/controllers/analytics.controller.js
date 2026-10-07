// Analytics controller for admin dashboard
const { pool } = require('../db/pool');
const { asyncHandler } = require('../utils/async-handler');

// Get various statistics for the dashboard
const getStats = asyncHandler(async (req, res) => {
  // Total users (including admins)
  const { rows: userRows } = await pool.query('SELECT COUNT(*) AS total_users FROM users');
  // Total equipment items
  const { rows: equipmentRows } = await pool.query('SELECT COUNT(*) AS total_equipment FROM equipment');
  // Active bookings (status Approved or Active)
  const { rows: activeBookingRows } = await pool.query(
    "SELECT COUNT(*) AS active_bookings FROM bookings WHERE status IN ('Approved', 'Active')"
  );
  // Total revenue (sum of total_price for completed bookings)
  const { rows: revenueRows } = await pool.query(
    "SELECT COALESCE(SUM(total_price), 0) AS total_revenue FROM bookings WHERE status = 'Completed'"
  );

  const stats = {
    totalUsers: parseInt(userRows[0].total_users, 10),
    totalEquipment: parseInt(equipmentRows[0].total_equipment, 10),
    activeBookings: parseInt(activeBookingRows[0].active_bookings, 10),
    totalRevenue: parseFloat(revenueRows[0].total_revenue),
  };

  res.status(200).json({ stats });
});

module.exports = { getStats };
