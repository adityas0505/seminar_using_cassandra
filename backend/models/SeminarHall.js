const mongoose = require('mongoose');

const SeminarHallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please add capacity']
  },
  location: {
    type: String,
    required: [true, 'Please add location']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop'
  }
}, { timestamps: true });

module.exports = mongoose.model('SeminarHall', SeminarHallSchema);
