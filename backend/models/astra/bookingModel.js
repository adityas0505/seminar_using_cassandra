const { getDb } = require('../../config/astra');
const { v4: uuidv4 } = require('uuid');
const { getHallById } = require('./hallModel');
const { findUserById } = require('./userModel');

const getCollection = () => getDb().collection('bookings');

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatBooking = async (doc, populate = false) => {
  const booking = {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    userId: doc.userId ? doc.userId.toString() : null,
    hallId: doc.hallId ? doc.hallId.toString() : null,
    date: doc.date,
    startTime: doc.startTime,
    endTime: doc.endTime,
    status: doc.status,
    purpose: doc.purpose,
    createdAt: doc.createdAt
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
  const collection = getCollection();
  const cursor = collection.find({ hallId: hallId.toString() });
  const docs = await cursor.toArray();

  const targetDate = new Date(dateStr).toDateString();
  const newStartMin = timeToMinutes(startTime);
  const newEndMin = timeToMinutes(endTime);

  return docs.some((doc) => {
    if (doc.status !== 'Approved' && doc.status !== 'Pending') return false;
    const docDate = new Date(doc.date).toDateString();
    if (docDate !== targetDate) return false;

    const existingStartMin = timeToMinutes(doc.startTime);
    const existingEndMin = timeToMinutes(doc.endTime);

    return newStartMin < existingEndMin && newEndMin > existingStartMin;
  });
};

const createBooking = async ({ userId, hallId, date, startTime, endTime, purpose, status = 'Pending' }) => {
  const collection = getCollection();
  const id = uuidv4();
  const bookingDate = new Date(date);
  const now = new Date();

  const doc = {
    _id: id,
    userId: userId.toString(),
    hallId: hallId.toString(),
    date: bookingDate,
    startTime,
    endTime,
    status,
    purpose,
    createdAt: now
  };

  await collection.insertOne(doc);
  return formatBooking(doc, false);
};

const getBookingsByUser = async (userId) => {
  const collection = getCollection();
  const cursor = collection.find({ userId: userId.toString() });
  const docs = await cursor.toArray();

  const bookings = await Promise.all(docs.map((d) => formatBooking(d, false)));

  // Attach populated hallId as frontend requires b.hallId.name and b.hallId.location
  for (let b of bookings) {
    if (b.hallId) {
      const hall = await getHallById(b.hallId);
      b.hallId = hall ? { _id: hall.id, id: hall.id, name: hall.name, location: hall.location } : null;
    }
  }

  return bookings;
};

const getAllBookings = async () => {
  const collection = getCollection();
  const cursor = collection.find();
  const docs = await cursor.toArray();

  return await Promise.all(docs.map((d) => formatBooking(d, true)));
};

const getBookingById = async (id) => {
  const collection = getCollection();
  const doc = await collection.findOne({ _id: id });
  if (!doc) return null;
  return await formatBooking(doc, false);
};

const updateBookingStatus = async (id, status) => {
  const collection = getCollection();
  await collection.updateOne({ _id: id }, { $set: { status } });
  return await getBookingById(id);
};

const deleteBooking = async (id) => {
  const collection = getCollection();
  await collection.deleteOne({ _id: id });
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

