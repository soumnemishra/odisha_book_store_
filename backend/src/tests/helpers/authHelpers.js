import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

/**
 * Generate a valid JWT token for testing
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
export const generateTestToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

/**
 * Create a test user in the database
 * @param {Object} userData - User data override
 * @returns {Promise<Object>} Created user and token
 */
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    role: 'user',
  };

  const user = await User.create({
    ...defaultUser,
    ...userData,
  });

  const token = generateTestToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

/**
 * Create a test admin user
 * @returns {Promise<Object>} Created admin user and token
 */
export const createTestAdmin = async () =>
  createTestUser({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  });

/**
 * Create multiple test users
 * @param {number} count - Number of users to create
 * @returns {Promise<Array>} Array of created users with tokens
 */
export const createTestUsers = async (count = 3) => {
  const promises = Array.from({ length: count }, (_, i) =>
    createTestUser({
      name: `Test User ${i + 1}`,
      email: `test${i + 1}@example.com`,
    })
  );

  return Promise.all(promises);
};

/**
 * Mock authentication middleware for supertest
 * @param {Object} user - User object to authenticate
 * @returns {Function} Express middleware
 */
export const mockAuth = (user) => (req, res, next) => {
  req.user = user;
  next();
};
