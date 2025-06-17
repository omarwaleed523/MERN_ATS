// Test setup file
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set a default JWT secret for testing if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests';
}

let mongoServer;

// Set up MongoDB Memory Server for testing
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Override the MONGO_URI environment variable for tests
  process.env.MONGO_URI = mongoUri;
  
  await mongoose.connect(mongoUri);
  console.log(`MongoDB Memory Server running at ${mongoUri}`);
});

// Close database connection after tests
afterAll(async () => {
  // Ensure we close all connections and handle promises properly
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
    console.log('MongoDB Memory Server stopped');
  }
  
  // Add a small delay to ensure all resources are properly released
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Clean up collections after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
  
  // Clear any mocks that might be holding resources
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

// Handle potential unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process as this would disrupt Jest
});
