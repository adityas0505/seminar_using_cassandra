const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  hallId: {
    type: mongoose.Schema.ObjectId,
    ref: 'SeminarHall',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add end time']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  purpose: {
    type: String,
    required: [true, 'Please add the purpose of booking']
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
