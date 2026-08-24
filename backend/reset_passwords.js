const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // We must fetch and save each user to trigger the 'save' hook
    const admin = await User.findOne({ email: 'vvce23cseaiml0027@vvce.ac.in' });
    if (admin) {
      admin.password = 'vvce@123';
      await admin.save();
    }

    const user = await User.findOne({ email: 'test@test.com' });
    if (user) {
      user.password = 'password123';
      await user.save();
    }
    
    console.log('Passwords reset successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

resetPasswords();
