const { getClient } = require('../../config/cassandra');
const { v4: uuidv4 } = require('uuid');
const cassandra = require('cassandra-driver');
const bcrypt = require('bcrypt');

const createUser = async ({ name, email, password, role = 'user' }) => {
  const client = getClient();
  const id = uuidv4();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const now = new Date();

  // Check if email already exists
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('A user with this email already exists');
  }

  const query = `
    INSERT INTO users (id, name, email, password, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await client.execute(query, [id, name, email.toLowerCase(), hashedPassword, role, now], { prepare: true });

  return {
    _id: id,
    id,
    name,
    email: email.toLowerCase(),
    role
  };
};

const findUserByEmail = async (email, includePassword = false) => {
  const client = getClient();
  const query = `SELECT * FROM users WHERE email = ? ALLOW FILTERING`;
  const result = await client.execute(query, [email.toLowerCase()], { prepare: true });

  if (result.rowLength === 0) return null;
  const row = result.rows[0];

  const user = {
    _id: row.id.toString(),
    id: row.id.toString(),
    name: row.name,
    email: row.email,
    role: row.role
  };

  if (includePassword) {
    user.password = row.password;
  }

  return user;
};

const findUserById = async (id) => {
  const client = getClient();
  const uuidVal = typeof id === 'string' ? cassandra.types.Uuid.fromString(id) : id;
  const query = `SELECT id, name, email, role FROM users WHERE id = ?`;
  const result = await client.execute(query, [uuidVal], { prepare: true });

  if (result.rowLength === 0) return null;
  const row = result.rows[0];

  return {
    _id: row.id.toString(),
    id: row.id.toString(),
    name: row.name,
    email: row.email,
    role: row.role
  };
};

const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  matchPassword
};

