const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const users = await User.find({}).select('+password');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

listUsers();
