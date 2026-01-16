import { rateLimit } from 'express-rate-limit';
import logger, { logSecurityEvent } from '../utils/logger.js';

/**
 * Enhanced Rate Limiter
 * Production-ready rate limiting with security logging
 * Inspired by Amazon/Flipkart traffic management
 */

/**
 * Default configuration from environment
 */
const DEFAULT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 min
const DEFAULT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10);

/**
 * Skip function for test environment
 * @param {Object} req - Express request
 * @returns {boolean} Whether to skip rate limiting
 */
const skipInTest = () => process.env.NODE_ENV === 'test';

/**
 * Standard rate limit exceeded handler
 * @param {string} limiterName - Name of the limiter
 * @returns {Function} Express handler
 */
const createHandler = (limiterName) => (req, res) => {
  logSecurityEvent('rate_limit_exceeded', {
    limiter: limiterName,
    ip: req.ip,
    path: req.path,
    userId: req.user?.id,
  });

  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retryAfter: res.getHeader('Retry-After'),
    },
  });
};

/**
 * General API rate limiter
 * Applies to all API routes
 */
export const apiLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: DEFAULT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: createHandler('api'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
});

/**
 * Stricter rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: (req, res) => {
    logSecurityEvent('auth_rate_limit_exceeded', {
      ip: req.ip,
      email: req.body?.email,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
        retryAfterMinutes: 15,
      },
    });
  },
});

/**
 * Very strict rate limiter for user registration
 * Prevents spam and automated account creation
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour from same IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: (req, res) => {
    logSecurityEvent('register_rate_limit_exceeded', {
      ip: req.ip,
      email: req.body?.email,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'REGISTER_RATE_LIMIT_EXCEEDED',
        message: 'Too many registration attempts. Please try again in 1 hour.',
        retryAfterMinutes: 60,
      },
    });
  },
});

/**
 * Rate limiter for order creation
 * Prevents spam orders and protects inventory
 */
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 orders per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: (req, res) => {
    logSecurityEvent('order_rate_limit_exceeded', {
      ip: req.ip,
      userId: req.user?.id,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'ORDER_RATE_LIMIT_EXCEEDED',
        message: 'Too many order requests. Please try again later.',
        retryAfterMinutes: 15,
      },
    });
  },
});

/**
 * Sensitive operations limiter (password reset, email verification)
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: (req, res) => {
    logSecurityEvent('sensitive_rate_limit_exceeded', {
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'SENSITIVE_RATE_LIMIT_EXCEEDED',
        message: 'Too many attempts. Please try again in 1 hour.',
        retryAfterMinutes: 60,
      },
    });
  },
});

/**
 * Search limiter - protect against expensive queries
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: createHandler('search'),
});

/**
 * Admin operations limiter
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: (req, res) => {
    logSecurityEvent('admin_rate_limit_exceeded', {
      ip: req.ip,
      userId: req.user?.id,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'ADMIN_RATE_LIMIT_EXCEEDED',
        message: 'Too many admin requests. Please slow down.',
      },
    });
  },
});

/**
 * Create a custom rate limiter
 * @param {Object} options - Rate limiter options
 * @returns {Function} Rate limiter middleware
 */
export const createCustomLimiter = (options) => {
  const {
    name = 'custom',
    windowMs = DEFAULT_WINDOW_MS,
    max = DEFAULT_MAX_REQUESTS,
    ...rest
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: createHandler(name),
    ...rest,
  });
};
