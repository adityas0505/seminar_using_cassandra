const Booking = require('../models/Booking');
const SeminarHall = require('../models/SeminarHall');

// Helper function to convert "HH:MM" to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
exports.createBooking = async (req, res, next) => {
  try {
    const { hallId, date, startTime, endTime } = req.body;
    req.body.userId = req.user.id;

    // Check if hall exists
    const hall = await SeminarHall.findById(hallId);
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
    // Only check against Approved and Pending bookings
    const existingBookings = await Booking.find({
      hallId: hallId,
      date: new Date(date),
      status: { $in: ['Approved', 'Pending'] }
    });

    const hasOverlap = existingBookings.some((booking) => {
      const existingStartMin = timeToMinutes(booking.startTime);
      const existingEndMin = timeToMinutes(booking.endTime);
      // Overlap logic: newStartTime < existingEndTime AND newEndTime > existingStartTime
      return (newStartMin < existingEndMin && newEndMin > existingStartMin);
    });

    if (hasOverlap) {
      return res.status(400).json({ success: false, error: 'This hall is already booked for the selected time slot' });
    }

    const booking = await Booking.create(req.body);
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
    const bookings = await Booking.find({ userId: req.user.id }).populate('hallId', 'name location');
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
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('hallId', 'name location');
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
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete/Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Make sure user is booking owner or admin
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this booking' });
    }

    await booking.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
