const { getClient } = require('../../config/cassandra');
const { v4: uuidv4 } = require('uuid');
const cassandra = require('cassandra-driver');
const { getHallById } = require('./hallModel');
const { findUserById } = require('./userModel');

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatBooking = async (row, populate = false) => {
  const booking = {
    _id: row.id.toString(),
    id: row.id.toString(),
    userId: row.user_id ? row.user_id.toString() : null,
    hallId: row.hall_id ? row.hall_id.toString() : null,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    purpose: row.purpose,
    createdAt: row.created_at
  };

  if (populate) {
    if (booking.userId) {
      const user = await findUserById(booking.userId);
      booking.userId = user ? { _id: user.id, id: user.id, name: user.name, email: user.email } : null;
    }
    if (booking.hallId) {
      const hall = await getHallById(booking.hallId);
      booking.hallId = hall ? { _id: hall.id, id: hall.id, name: hall.name, location: hall.location } : null;
    }
  }

  return booking;
};

const checkOverlap = async (hallId, dateStr, startTime, endTime) => {
  const client = getClient();
  const uuidHall = typeof hallId === 'string' ? cassandra.types.Uuid.fromString(hallId) : hallId;

  // Fetch bookings for this hall
  const query = `SELECT * FROM bookings WHERE hall_id = ? ALLOW FILTERING`;
  const result = await client.execute(query, [uuidHall], { prepare: true });

  const targetDate = new Date(dateStr).toDateString();
  const newStartMin = timeToMinutes(startTime);
  const newEndMin = timeToMinutes(endTime);

  return result.rows.some((row) => {
    if (row.status !== 'Approved' && row.status !== 'Pending') return false;
    const rowDate = new Date(row.date).toDateString();
    if (rowDate !== targetDate) return false;

    const existingStartMin = timeToMinutes(row.start_time);
    const existingEndMin = timeToMinutes(row.end_time);

    return newStartMin < existingEndMin && newEndMin > existingStartMin;
  });
};

const createBooking = async ({ userId, hallId, date, startTime, endTime, purpose, status = 'Pending' }) => {
  const client = getClient();
  const id = uuidv4();
  const uuidUser = typeof userId === 'string' ? cassandra.types.Uuid.fromString(userId) : userId;
  const uuidHall = typeof hallId === 'string' ? cassandra.types.Uuid.fromString(hallId) : hallId;
  const bookingDate = new Date(date);
  const now = new Date();

  const query = `
    INSERT INTO bookings (id, user_id, hall_id, date, start_time, end_time, status, purpose, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await client.execute(query, [id, uuidUser, uuidHall, bookingDate, startTime, endTime, status, purpose, now], { prepare: true });

  return {
    _id: id,
    id,
    userId: userId.toString(),
    hallId: hallId.toString(),
    date: bookingDate,
    startTime,
    endTime,
    status,
    purpose,
    createdAt: now
  };
};

const getBookingsByUser = async (userId) => {
  const client = getClient();
  const uuidUser = typeof userId === 'string' ? cassandra.types.Uuid.fromString(userId) : userId;
  const query = `SELECT * FROM bookings WHERE user_id = ? ALLOW FILTERING`;
  const result = await client.execute(query, [uuidUser], { prepare: true });

  const bookings = await Promise.all(result.rows.map((row) => formatBooking(row, false)));
  
  // Attach populated hallId as frontend requires b.hallId.name / location
  for (let b of bookings) {
    if (b.hallId) {
      const hall = await getHallById(b.hallId);
      b.hallId = hall ? { _id: hall.id, id: hall.id, name: hall.name, location: hall.location } : null;
    }
  }

  return bookings;
};

const getAllBookings = async () => {
  const client = getClient();
  const query = `SELECT * FROM bookings`;
  const result = await client.execute(query, [], { prepare: true });

  return await Promise.all(result.rows.map((row) => formatBooking(row, true)));
};

const getBookingById = async (id) => {
  const client = getClient();
  const uuidVal = typeof id === 'string' ? cassandra.types.Uuid.fromString(id) : id;
  const query = `SELECT * FROM bookings WHERE id = ?`;
  const result = await client.execute(query, [uuidVal], { prepare: true });

  if (result.rowLength === 0) return null;
  return await formatBooking(result.rows[0], false);
};

const updateBookingStatus = async (id, status) => {
  const client = getClient();
  const uuidVal = typeof id === 'string' ? cassandra.types.Uuid.fromString(id) : id;
  const query = `UPDATE bookings SET status = ? WHERE id = ?`;
  await client.execute(query, [status, uuidVal], { prepare: true });

  return await getBookingById(id);
};

const deleteBooking = async (id) => {
  const client = getClient();
  const uuidVal = typeof id === 'string' ? cassandra.types.Uuid.fromString(id) : id;
  const query = `DELETE FROM bookings WHERE id = ?`;
  await client.execute(query, [uuidVal], { prepare: true });
  return true;
};

module.exports = {
  checkOverlap,
  createBooking,
  getBookingsByUser,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking
};

