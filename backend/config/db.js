const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/learnai';

    console.log('[Database] Connecting to MongoDB...');

    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(
        `[Database] MongoDB Connected: ${conn.connection.host}`
      );

      return true;
    } catch (directError) {
      console.warn(
        `[Database] MongoDB connection failed: ${directError.message}`
      );

      // Use in-memory MongoDB only when explicitly enabled
      if (process.env.USE_MEMORY_DB === 'true') {
        console.log('[Database] Starting in-memory MongoDB...');

        const { MongoMemoryServer } = require('mongodb-memory-server');

        mongoServer = await MongoMemoryServer.create();

        const memoryUri = mongoServer.getUri();

        const conn = await mongoose.connect(memoryUri);

        console.log(
          `[Database] In-Memory MongoDB Connected: ${conn.connection.host}`
        );

        try {
          const seedInitialData = require('../utils/seedData');
          await seedInitialData();
          console.log('[Database] Initial data seeded');
        } catch (seedError) {
          console.warn(
            `[Database] Seed skipped: ${seedError.message}`
          );
        }

        return true;
      }

      console.warn(
        '[Database] Continuing without MongoDB connection.'
      );

      return false;
    }
  } catch (error) {
    console.error(
      `[Database] Connection Error: ${error.message}`
    );

    return false;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }

    console.log('[Database] Disconnected');
  } catch (error) {
    console.error(
      `[Database] Disconnect Error: ${error.message}`
    );
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};