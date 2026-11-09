const cassandra = require('cassandra-driver');
const path = require('path');
const fs = require('fs');

let client = null;

const getClient = () => {
  if (client) return client;

  const bundlePath = process.env.ASTRA_DB_BUNDLE_PATH || 
    (fs.existsSync(path.join(__dirname, '..', 'secure-connect-bundle.zip')) ? path.join(__dirname, '..', 'secure-connect-bundle.zip') : null);

  const astraToken = process.env.ASTRA_DB_APPLICATION_TOKEN;

  if (bundlePath && astraToken) {
    console.log(`Connecting to Astra DB using bundle: ${bundlePath}`);
    client = new cassandra.Client({
      cloud: {
        secureConnectBundle: bundlePath
      },
      credentials: {
        username: 'token',
        password: astraToken
      },
      keyspace: process.env.ASTRA_DB_KEYSPACE || process.env.CASSANDRA_KEYSPACE || 'default_keyspace'
    });
  } else {
    // Local / direct Cassandra fallback
    const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1').split(',');
    const localDataCenter = process.env.CASSANDRA_LOCAL_DATA_CENTER || 'datacenter1';
    const keyspace = process.env.CASSANDRA_KEYSPACE || 'seminar_booking';

    console.log(`Connecting to Cassandra at ${contactPoints.join(', ')} (datacenter: ${localDataCenter})`);
    client = new cassandra.Client({
      contactPoints,
      localDataCenter,
      keyspace
    });
  }

  return client;
};

const initSchema = async () => {
  const c = getClient();
  await c.connect();
  console.log('Cassandra connected successfully!');

  // Create Users table & indexes
  await c.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid,
      name text,
      email text,
      password text,
      role text,
      created_at timestamp,
      PRIMARY KEY (id)
    );
  `);

  await c.execute(`
    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
  `);

  // Create Seminar Halls table
  await c.execute(`
    CREATE TABLE IF NOT EXISTS seminar_halls (
      id uuid,
      name text,
      capacity int,
      location text,
      status text,
      image text,
      created_at timestamp,
      PRIMARY KEY (id)
    );
  `);

  // Create Bookings table & indexes
  await c.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id uuid,
      user_id uuid,
      hall_id uuid,
      date timestamp,
      start_time text,
      end_time text,
      status text,
      purpose text,
      created_at timestamp,
      PRIMARY KEY (id)
    );
  `);

  await c.execute(`
    CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings (user_id);
  `);

  await c.execute(`
    CREATE INDEX IF NOT EXISTS bookings_hall_id_idx ON bookings (hall_id);
  `);

  console.log('Cassandra schema initialized (users, seminar_halls, bookings).');
};

module.exports = {
  getClient,
  initSchema
};

