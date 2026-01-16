/**
 * Test setup file
 * This file runs before all tests to set up the test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only-minimum-32-chars';
process.env.JWT_EXPIRE = '1h';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'; // Default for tests
