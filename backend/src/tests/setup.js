import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Mock environment variables for testing
process.env.JWT_SECRET = 'supersecret_test_key_123';
process.env.NODE_ENV = 'test';

let mongoServer;

beforeAll(async () => {
  // Start the in-memory database
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Close any existing connections to prevent leaks
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Clear the database before disconnecting
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  // Tear down connections and the temporary server after all tests
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
