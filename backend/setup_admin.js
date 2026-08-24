const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Remove all existing admins
    await User.deleteMany({ role: 'admin' });
    console.log('Removed old admins');

    // Create new admin - LET THE MODEL HOOK HANDLE HASHING
    const adminEmail = 'vvce23cseaiml0027@vvce.ac.in';
    const adminPassword = 'vvce@123';
    const adminName = 'VVCE Admin';

    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Passing plain password
      role: 'admin'
    });
    
    console.log(`Admin created successfully: ${adminEmail}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

setupAdmin();
