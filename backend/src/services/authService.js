import User from '../models/User.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password (will be hashed)
 * @returns {Promise<Object>} Object containing user data and userId
 * @returns {Object} return.user - User object (without password)
 * @returns {string} return.userId - User's MongoDB ID
 * @throws {ConflictError} If user with email already exists
 * @throws {Error} If user creation fails
 */
export const register = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User already exists with this email');
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    name,
    email,
    password, // Will be automatically hashed by the pre-save hook
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    userId: user._id,
  };
};

/**
 * Authenticate user and return user data
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Object containing user data and userId
 * @returns {Object} return.user - User object (without password)
 * @returns {string} return.userId - User's MongoDB ID
 * @throws {UnauthorizedError} If email doesn't exist or password is incorrect
 * @throws {Error} If database query fails
 */
export const login = async (email, password) => {
  // Find user and include password field (since select: false)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check password using instance method
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    userId: user._id,
  };
};

/**
 * Get user by ID
 * @param {string} userId - User's MongoDB ID
 * @returns {Promise<Object>} User object without password
 * @throws {NotFoundError} If user doesn't exist
 * @throws {Error} If database query fails
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};
