const { getClient } = require('../../config/cassandra');
const { v4: uuidv4 } = require('uuid');
const cassandra = require('cassandra-driver');

const formatHall = (row) => ({
  _id: row.id.toString(),
  id: row.id.toString(),
  name: row.name,
  capacity: row.capacity,
  location: row.location,
  status: row.status || 'active',
  image: row.image || 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop',
  createdAt: row.created_at
});

const getAllHalls = async () => {
  const client = getClient();
  const query = `SELECT * FROM seminar_halls`;
  const result = await client.execute(query, [], { prepare: true });
  return result.rows.map(formatHall);
};

const getHallById = async (id) => {
  const client = getClient();
  const uuidVal = typeof id === 'string' ? cassandra.types.Uuid.fromString(id) : id;
  const query = `SELECT * FROM seminar_halls WHERE id = ?`;
  const result = await client.execute(query, [uuidVal], { prepare: true });

  if (result.rowLength === 0) return null;
  return formatHall(result.rows[0]);
};

const createHall = async ({ name, capacity, location, status = 'active', image }) => {
  const client = getClient();
  const id = uuidv4();
  const defaultImage = 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop';
  const img = image || defaultImage;
  const now = new Date();

  const query = `
    INSERT INTO seminar_halls (id, name, capacity, location, status, image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  await client.execute(query, [id, name, parseInt(capacity, 10), location, status, img, now], { prepare: true });

  return {
    _id: id,
    id,
    name,
    capacity: parseInt(capacity, 10),
    location,
    status,
    image: img,
    createdAt: now
  };
};

const updateHall = async (id, data) => {
  const existing = await getHallById(id);
  if (!existing) return null;

  const client = getClient();
  const uuidVal = typeof id === 'string' ? cassandra.types.Uuid.fromString(id) : id;

  const name = data.name !== undefined ? data.name : existing.name;
  const capacity = data.capacity !== undefined ? parseInt(data.capacity, 10) : existing.capacity;
  const location = data.location !== undefined ? data.location : existing.location;
  const status = data.status !== undefined ? data.status : existing.status;
  const image = data.image !== undefined ? data.image : existing.image;

  const query = `
    UPDATE seminar_halls
    SET name = ?, capacity = ?, location = ?, status = ?, image = ?
    WHERE id = ?
  `;

  await client.execute(query, [name, capacity, location, status, image, uuidVal], { prepare: true });

  return {
    _id: id.toString(),
    id: id.toString(),
    name,
    capacity,
    location,
    status,
    image
  };
};

const deleteHall = async (id) => {
  const client = getClient();
  const uuidVal = typeof id === 'string' ? cassandra.types.Uuid.fromString(id) : id;
  const query = `DELETE FROM seminar_halls WHERE id = ?`;
  await client.execute(query, [uuidVal], { prepare: true });
  return true;
};

module.exports = {
  getAllHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall
};

