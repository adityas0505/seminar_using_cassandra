const SeminarHall = require('../models/SeminarHall');

// @desc    Get all seminar halls
// @route   GET /api/halls
// @access  Public
exports.getHalls = async (req, res, next) => {
  try {
    const halls = await SeminarHall.find();
    res.status(200).json({ success: true, count: halls.length, data: halls });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single seminar hall
// @route   GET /api/halls/:id
// @access  Public
exports.getHall = async (req, res, next) => {
  try {
    const hall = await SeminarHall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, error: 'Seminar Hall not found' });
    }
    res.status(200).json({ success: true, data: hall });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new seminar hall
// @route   POST /api/halls
// @access  Private (Admin)
exports.createHall = async (req, res, next) => {
  try {
    const hallData = { ...req.body };
    
    // If file is uploaded, use the local path
    if (req.file) {
      hallData.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const hall = await SeminarHall.create(hallData);
    res.status(201).json({ success: true, data: hall });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update seminar hall
// @route   PUT /api/halls/:id
// @access  Private (Admin)
exports.updateHall = async (req, res, next) => {
  try {
    const hallData = { ...req.body };
    
    if (req.file) {
      hallData.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const hall = await SeminarHall.findByIdAndUpdate(req.params.id, hallData, {
      new: true,
      runValidators: true
    });
    if (!hall) {
      return res.status(404).json({ success: false, error: 'Seminar Hall not found' });
    }
    res.status(200).json({ success: true, data: hall });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete seminar hall
// @route   DELETE /api/halls/:id
// @access  Private (Admin)
exports.deleteHall = async (req, res, next) => {
  try {
    const hall = await SeminarHall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, error: 'Seminar Hall not found' });
    }
    await hall.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
