import logger from '../utils/logger.js';
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  InternalServerError,
} from '../utils/errors.js';

/**
 * Global error handler middleware
 * Handles all errors and returns appropriate HTTP responses
 * @param {Error|AppError} err - Error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with context
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    errorName: err.name,
    errorCode: err.code,
    statusCode: err.statusCode,
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      // Only include stack trace in development (not production or prod)
      ...(process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'prod' && { stack: err.stack }),
    });
  }

  // Mongoose bad ObjectId - convert to NotFoundError
  if (err.name === 'CastError') {
    error = new NotFoundError('Resource not found');
  }
  // Mongoose duplicate key - convert to ConflictError
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    error = new ConflictError(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
  }
  // Mongoose validation error - convert to BadRequestError
  else if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = new BadRequestError(message);
  }
  // JWT errors - convert to UnauthorizedError
  else if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expired');
  }
  // Default to 500 Internal Server Error
  else {
    error = new InternalServerError(
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod'
        ? 'Internal server error'
        : err.message
    );
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    // Only include stack trace in development (not production or prod)
    ...(process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'prod' && { stack: err.stack }),
  });
};

export default errorHandler;
