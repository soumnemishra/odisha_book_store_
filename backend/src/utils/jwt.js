import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Parse expiration string (e.g., '30d', '7d', '1h') to milliseconds
 * @param {String} expiresIn - Expiration string
 * @returns {Number} Expiration in milliseconds
 */
const parseExpiration = (expiresIn) => {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);

  switch (unit) {
    case 's': // seconds
      return value * 1000;
    case 'm': // minutes
      return value * 60 * 1000;
    case 'h': // hours
      return value * 60 * 60 * 1000;
    case 'd': // days
      return value * 24 * 60 * 60 * 1000;
    default:
      // Default to 30 days
      return 30 * 24 * 60 * 60 * 1000;
  }
};

/**
 * Generate JWT token and set it as HTTP-only cookie on the response object
 * @param {Object} res - Express response object
 * @param {String} userId - User ID to encode in the token
 */
export const generateToken = (res, userId) => {
  // Generate JWT token
  const token = jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });

  // Parse JWT_EXPIRE to set cookie expiration
  // Default to 30 days (30 * 24 * 60 * 60 * 1000 milliseconds)
  const maxAge = parseExpiration(config.JWT_EXPIRE);

  // Set HTTP-only cookie with security options
  res.cookie('token', token, {
    httpOnly: true, // Prevent XSS attacks
    secure: config.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict', // CSRF protection
    maxAge, // Cookie expiration time
    path: '/', // Cookie available for all routes
  });

  return token;
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verify = (token) => jwt.verify(token, config.JWT_SECRET);

/**
 * Clear JWT token cookie
 * @param {Object} res - Express response object
 */
export const clearToken = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiration to past date to clear cookie
    path: '/',
  });
};
