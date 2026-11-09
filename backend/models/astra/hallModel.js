const { getDb } = require('../../config/astra');
const { v4: uuidv4 } = require('uuid');

const getCollection = () => getDb().collection('seminar_halls');

const formatHall = (doc) => ({
  _id: doc._id.toString(),
  id: doc._id.toString(),
  name: doc.name,
  capacity: doc.capacity,
  location: doc.location,
  status: doc.status || 'active',
  image: doc.image || 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop',
  createdAt: doc.createdAt
});

const getAllHalls = async () => {
  const collection = getCollection();
  const cursor = collection.find();
  const docs = await cursor.toArray();
  return docs.map(formatHall);
};

const getHallById = async (id) => {
  const collection = getCollection();
  const doc = await collection.findOne({ _id: id });
  if (!doc) return null;
  return formatHall(doc);
};

const createHall = async ({ name, capacity, location, status = 'active', image }) => {
  const collection = getCollection();
  const id = uuidv4();
  const defaultImage = 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop';
  const img = image || defaultImage;
  const now = new Date();

  const doc = {
    _id: id,
    name,
    capacity: parseInt(capacity, 10),
    location,
    status,
    image: img,
    createdAt: now
  };

  await collection.insertOne(doc);
  return formatHall(doc);
};

const updateHall = async (id, data) => {
  const collection = getCollection();
  const existing = await getHallById(id);
  if (!existing) return null;

  const updateFields = {};
  if (data.name !== undefined) updateFields.name = data.name;
  if (data.capacity !== undefined) updateFields.capacity = parseInt(data.capacity, 10);
  if (data.location !== undefined) updateFields.location = data.location;
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.image !== undefined) updateFields.image = data.image;

  await collection.updateOne({ _id: id }, { $set: updateFields });
  return await getHallById(id);
};

const deleteHall = async (id) => {
  const collection = getCollection();
  await collection.deleteOne({ _id: id });
  return true;
};

module.exports = {
  getAllHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall
};

