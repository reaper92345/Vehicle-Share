// Admin routes
const express = require('express');
const { verifyAdmin } = require('../middleware/admin.middleware');
const userController = require('../controllers/user.controller');
const equipmentController = require('../controllers/equipment.controller');
const bookingController = require('../controllers/bookings.controller');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

// Protect all admin routes
router.use(verifyAdmin);

// User management
router.get('/users', userController.listUsers);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Equipment management (reuse existing controller but admin can see all)
router.get('/equipment', equipmentController.listEquipment);
router.post('/equipment', equipmentController.createEquipment);
router.put('/equipment/:id', equipmentController.updateEquipment);
router.delete('/equipment/:id', equipmentController.deleteEquipment);

// Booking overview
router.get('/bookings', bookingController.listAllBookings);
router.put('/bookings/:id', bookingController.updateBookingStatus);
router.delete('/bookings/:id', bookingController.deleteBooking);

// Analytics/dashboard
router.get('/analytics', analyticsController.getStats);

module.exports = router;
