// eslint-disable-next-line import/no-extraneous-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

/**
 * Connect to in-memory MongoDB for testing
 */
export const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
    });

    console.log('Test database connected');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
};

/**
 * Disconnect and close in-memory MongoDB
 */
export const disconnectTestDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Error disconnecting test database:', error);
    throw error;
  }
};

/**
 * Clear all collections in the test database
 */
export const clearTestDB = async () => {
  if (!mongoose.connection.db) {
    return;
  }

  const { collections } = mongoose.connection;
  const promises = Object.keys(collections).map((key) => collections[key].deleteMany({}));
  await Promise.all(promises);
};

/**
 * Get database connection status
 */
export const getConnectionStatus = () => mongoose.connection.readyState;
