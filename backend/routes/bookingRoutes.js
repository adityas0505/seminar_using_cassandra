const express = require('express');
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Specific route for admin to get all bookings
router.get('/all', protect, authorize('admin'), getAllBookings);

router.route('/')
  .post(protect, createBooking)
  .get(protect, getUserBookings);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateBookingStatus);

router.route('/:id')
  .delete(protect, deleteBooking);

module.exports = router;
