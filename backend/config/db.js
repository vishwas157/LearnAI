const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnai';
    
    // First attempt to connect to specified URI
    try {
      console.log(`Connecting to MongoDB at: ${mongoUri}...`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (directErr) {
      console.warn(`Local MongoDB connection failed (${directErr.message}). Launching in-memory MongoDB fallback...`);
    }

    // Fallback: Use mongodb-memory-server for frictionless zero-config development
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    
    const conn = await mongoose.connect(memoryUri);
    console.log(`✓ In-Memory MongoDB Connected: ${memoryUri}`);
    
    // Seed initial data if in-memory
    const seedInitialData = require('../utils/seedData');
    await seedInitialData();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting DB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
