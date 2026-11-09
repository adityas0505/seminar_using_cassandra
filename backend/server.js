const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config();

const { initAstraDB } = require('./config/astra');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const authRoutes = require('./routes/authRoutes');
const hallRoutes = require('./routes/hallRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/bookings', bookingRoutes);

const { getAllBookings } = require('./controllers/bookingController');
const { protect, authorize } = require('./middleware/authMiddleware');
app.get('/api/admin/bookings', protect, authorize('admin'), getAllBookings);

const PORT = process.env.PORT || 5000;

// Initialize Astra DB and start server
initAstraDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} with DataStax Astra DB`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize Astra DB:', err);
    process.exit(1);
  });
