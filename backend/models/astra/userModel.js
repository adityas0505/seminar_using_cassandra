const { getDb } = require('../../config/astra');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const getCollection = () => getDb().collection('users');

const createUser = async ({ name, email, password, role = 'user' }) => {
  const collection = getCollection();
  const lowerEmail = email.toLowerCase();

  const existing = await collection.findOne({ email: lowerEmail });
  if (existing) {
    throw new Error('A user with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const id = uuidv4();
  const now = new Date();

  const doc = {
    _id: id,
    name,
    email: lowerEmail,
    password: hashedPassword,
    role,
    createdAt: now
  };

  await collection.insertOne(doc);

  return {
    _id: id,
    id,
    name,
    email: lowerEmail,
    role
  };
};

const findUserByEmail = async (email, includePassword = false) => {
  const collection = getCollection();
  const doc = await collection.findOne({ email: email.toLowerCase() });

  if (!doc) return null;

  const user = {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role
  };

  if (includePassword) {
    user.password = doc.password;
  }

  return user;
};

const findUserById = async (id) => {
  const collection = getCollection();
  const doc = await collection.findOne({ _id: id });

  if (!doc) return null;

  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role
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

