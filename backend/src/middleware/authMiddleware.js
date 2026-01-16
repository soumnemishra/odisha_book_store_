import { verify as jwtVerify } from '../utils/jwt.js';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Protect routes - require authentication
 * Verifies JWT token and attaches user to request object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @throws {UnauthorizedError} If token is missing or invalid
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from HTTP-only cookie first, fallback to Authorization header for backward compatibility
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    [, token] = req.headers.authorization.split(' ');
  }

  if (!token) {
    throw new UnauthorizedError('Not authorized to access this route');
  }

  try {
    const decoded = jwtVerify(token);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new UnauthorizedError('User not found');
    }

    next();
  } catch (error) {
    // If it's already an AppError, re-throw it
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    // Otherwise, convert to UnauthorizedError
    throw new UnauthorizedError('Not authorized to access this route');
  }
});

/**
 * Grant access to specific roles (Admin only)
 * Must be used after protect middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @throws {ForbiddenError} If user is not an admin
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new ForbiddenError('Access denied. Admin privileges required.');
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate user but allows request to proceed if no token
 * Useful for routes that provide enhanced features for logged-in users
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from HTTP-only cookie first, fallback to Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    [, token] = req.headers.authorization.split(' ');
  }

  // If no token, proceed without authentication (guest mode)
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwtVerify(token);
    req.user = await User.findById(decoded.id).select('-password');
    // If user not found, proceed as guest
    if (!req.user) {
      req.user = null;
    }
  } catch (error) {
    // Token invalid/expired, proceed as guest
    req.user = null;
  }

  next();
});
