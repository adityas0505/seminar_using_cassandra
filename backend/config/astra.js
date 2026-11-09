const { DataAPIClient } = require('@datastax/astra-db-ts');

let db = null;

const getDb = () => {
  if (db) return db;

  const endpoint = process.env.ASTRA_DB_API_ENDPOINT;
  const token = process.env.ASTRA_DB_APPLICATION_TOKEN;

  if (!endpoint || !token) {
    throw new Error('Missing ASTRA_DB_API_ENDPOINT or ASTRA_DB_APPLICATION_TOKEN in environment');
  }

  const client = new DataAPIClient(token);
  db = client.db(endpoint);
  return db;
};

const initAstraDB = async () => {
  const database = getDb();
  console.log('Connecting to DataStax Astra DB...');

  const existingCollections = await database.listCollections();
  console.log('Connected to Astra DB! Existing collections:', existingCollections);

  if (!existingCollections.includes('users')) {
    await database.createCollection('users').catch(() => {});
    console.log('Created Astra collection: users');
  }

  if (!existingCollections.includes('seminar_halls')) {
    await database.createCollection('seminar_halls').catch(() => {});
    console.log('Created Astra collection: seminar_halls');
  }

  if (!existingCollections.includes('bookings')) {
    await database.createCollection('bookings').catch(() => {});
    console.log('Created Astra collection: bookings');
  }

  console.log('Astra DB collections ready.');
  return database;
};

module.exports = {
  getDb,
  initAstraDB
};

