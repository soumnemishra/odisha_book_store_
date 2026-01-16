import asyncHandler from '../middleware/asyncHandler.js';
import {
  register as authRegister,
  login as authLogin,
  getUserById,
} from '../services/authService.js';
import { generateToken, clearToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    logger.warn('Registration attempt with missing fields', { email });
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password',
    });
  }

  logger.info('User registration attempt', { email, name });

  const result = await authRegister({ name, email, password });

  // Generate token and set it as HTTP-only cookie (for web)
  const token = generateToken(res, result.userId);

  logger.info('User registered successfully', { userId: result.userId, email });

  // Return token in response body (for mobile) AND set as HTTP-only cookie (for web)
  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      token,  // Also send token in response for mobile apps
    },
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.warn('Login attempt with missing credentials', { email });
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  logger.info('User login attempt', { email });

  const result = await authLogin(email, password);

  // Generate token and set it as HTTP-only cookie (for web)
  const token = generateToken(res, result.userId);

  logger.info('User logged in successfully', { userId: result.userId, email });

  // Return token in response body (for mobile) AND set as HTTP-only cookie (for web)
  res.json({
    success: true,
    data: {
      user: result.user,
      token,  // Also send token in response for mobile apps
    },
  });
});

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getMe = asyncHandler(async (req, res) => {
  logger.debug('Fetching current user', { userId: req.user.id });

  // Use service layer instead of direct DB query (fixed anti-pattern)
  const user = await getUserById(req.user.id);

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Logout user / clear cookie
 * @route POST /api/auth/logout
 * @access Private
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const logoutUser = asyncHandler(async (req, res) => {
  logger.info('User logout', { userId: req.user.id });

  // Clear the HTTP-only cookie
  clearToken(res);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  logger.debug('Fetching user profile', { userId: req.user.id });

  // req.user is already set by authMiddleware
  res.json({
    success: true,
    data: req.user,
  });
});
