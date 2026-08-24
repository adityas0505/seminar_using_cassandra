const express = require('express');
const {
  getHalls,
  getHall,
  createHall,
  updateHall,
  deleteHall
} = require('../controllers/hallController');
const { protect, authorize } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.route('/')
  .get(getHalls)
  .post(protect, authorize('admin'), upload.single('image'), createHall);

router.route('/:id')
  .get(getHall)
  .put(protect, authorize('admin'), upload.single('image'), updateHall)
  .delete(protect, authorize('admin'), deleteHall);

module.exports = router;
