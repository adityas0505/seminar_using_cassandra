const bookingModel = require('../models/astra/bookingModel');
const hallModel = require('../models/astra/hallModel');

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
exports.createBooking = async (req, res, next) => {
  try {
    const { hallId, date, startTime, endTime, purpose } = req.body;
    const userId = req.user.id;

    // Check if hall exists
    const hall = await hallModel.getHallById(hallId);
    if (!hall) {
      return res.status(404).json({ success: false, error: 'Seminar Hall not found' });
    }

    if (hall.status !== 'active') {
      return res.status(400).json({ success: false, error: 'This hall is not active for booking' });
    }

    const newStartMin = timeToMinutes(startTime);
    const newEndMin = timeToMinutes(endTime);

    if (newStartMin >= newEndMin) {
      return res.status(400).json({ success: false, error: 'Start time must be before end time' });
    }

    // Check for overlapping bookings
    const hasOverlap = await bookingModel.checkOverlap(hallId, date, startTime, endTime);

    if (hasOverlap) {
      return res.status(400).json({ success: false, error: 'This hall is already booked for the selected time slot' });
    }

    const booking = await bookingModel.createBooking({
      userId,
      hallId,
      date,
      startTime,
      endTime,
      purpose,
      status: 'Pending'
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings
// @access  Private (User)
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await bookingModel.getBookingsByUser(req.user.id);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingModel.getAllBookings();
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let booking = await bookingModel.getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const updatedBooking = await bookingModel.updateBookingStatus(req.params.id, status);
    res.status(200).json({ success: true, data: updatedBooking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete/Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await bookingModel.getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Make sure user is booking owner or admin
    if (booking.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this booking' });
    }

    await bookingModel.deleteBooking(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
