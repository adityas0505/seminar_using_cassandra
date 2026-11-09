require('dotenv').config();
const { getDb, initAstraDB } = require('./config/astra');
const userModel = require('./models/astra/userModel');
const hallModel = require('./models/astra/hallModel');

const setup = async () => {
  try {
    await initAstraDB();
    const db = getDb();
    const usersCollection = db.collection('users');

    // Remove existing admin if any
    await usersCollection.deleteMany({ role: 'admin' }).catch(() => {});
    console.log('Removed old admins.');

    // Create new admin
    const adminEmail = 'vvce23cseaiml0027@vvce.ac.in';
    const adminPassword = 'vvce@123';
    const adminName = 'VVCE Admin';

    const admin = await userModel.createUser({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log(`Admin created successfully in Astra DB: ${admin.email}`);

    // Check if halls exist, seed initial ones if empty
    const halls = await hallModel.getAllHalls();
    if (halls.length === 0) {
      console.log('Seeding initial seminar halls into Astra DB...');
      await hallModel.createHall({
        name: 'Sir M. Visvesvaraya Auditorium',
        capacity: 500,
        location: 'Ground Floor, Main Block',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?q=80&w=2070&auto=format&fit=crop'
      });
      await hallModel.createHall({
        name: 'APJ Abdul Kalam Seminar Hall',
        capacity: 250,
        location: '2nd Floor, CS Block',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop'
      });
      await hallModel.createHall({
        name: 'Aryabhata Conference Hall',
        capacity: 120,
        location: '1st Floor, Library Building',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop'
      });
      console.log('Seeded 3 seminar halls.');
    } else {
      console.log(`Found ${halls.length} existing seminar halls in Astra DB.`);
    }

    console.log('Astra DB setup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during Astra DB setup:', err);
    process.exit(1);
  }
};

setup();

