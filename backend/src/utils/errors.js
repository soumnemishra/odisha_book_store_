/* eslint-disable max-classes-per-file */
/**
 * Enhanced Error Classes for Production-Ready Backend
 * Includes transient vs permanent error classification for retry logic
 */

/**
 * Base application error class
 * All custom errors extend this class
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isRetryable - Whether the error is retryable
   */
  constructor(message, statusCode = 500, isRetryable = false) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.isRetryable = isRetryable;
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for logging/response
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      isRetryable: this.isRetryable,
      timestamp: this.timestamp,
    };
  }
}

// ============================================================================
// TRANSIENT ERRORS (Retryable)
// ============================================================================

/**
 * Transient Error Base Class
 * These errors are temporary and should be retried
 */
export class TransientError extends AppError {
  constructor(message = 'Temporary error, please retry', statusCode = 503) {
    super(message, statusCode, true);
  }
}

/**
 * Database Connection Error
 * Temporary database issues that may resolve
 */
export class DatabaseConnectionError extends TransientError {
  constructor(message = 'Database temporarily unavailable') {
    super(message, 503);
  }
}

/**
 * Service Unavailable Error
 * External service temporarily down
 */
export class ServiceUnavailableError extends TransientError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
  }
}

/**
 * Timeout Error
 * Request took too long
 */
export class TimeoutError extends TransientError {
  constructor(message = 'Request timed out') {
    super(message, 504);
  }
}

/**
 * Rate Limit Error
 * Too many requests, retry later
 */
export class RateLimitError extends TransientError {
  /**
   * @param {string} message - Error message
   * @param {number} retryAfterMs - Time to wait before retry
   */
  constructor(message = 'Too many requests', retryAfterMs = 60000) {
    super(message, 429);
    this.retryAfterMs = retryAfterMs;
  }
}

// ============================================================================
// PERMANENT ERRORS (Non-Retryable)
// ============================================================================

/**
 * Permanent Error Base Class
 * These errors should NOT be retried
 */
export class PermanentError extends AppError {
  constructor(message = 'Permanent error', statusCode = 400) {
    super(message, statusCode, false);
  }
}

/**
 * Bad request error (400)
 * Used for validation errors, malformed requests, etc.
 */
export class BadRequestError extends PermanentError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Validation Error (400)
 * Specific validation failures
 */
export class ValidationError extends PermanentError {
  /**
   * @param {string} message - Error message
   * @param {Array} errors - Array of validation errors
   */
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400);
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

/**
 * Unauthorized error (401)
 * Used when authentication is required but not provided or invalid
 */
export class UnauthorizedError extends PermanentError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden error (403)
 * Used when user is authenticated but doesn't have permission
 */
export class ForbiddenError extends PermanentError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not found error (404)
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends PermanentError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict error (409)
 * Used when there's a conflict with the current state (e.g., duplicate entry)
 */
export class ConflictError extends PermanentError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

/**
 * Unprocessable Entity error (422)
 * Used when request is well-formed but semantically incorrect
 */
export class UnprocessableEntityError extends PermanentError {
  constructor(message = 'Unprocessable entity') {
    super(message, 422);
  }
}

/**
 * Not Implemented Error (501)
 * For features that are planned but not yet implemented
 */
export class NotImplementedError extends AppError {
  constructor(message = 'Feature not yet implemented') {
    super(message, 501, false);
  }
}

/**
 * Internal Server Error (500)
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, false);
  }
}

// ============================================================================
// CIRCUIT BREAKER ERRORS
// ============================================================================

/**
 * Circuit Open Error
 * Circuit breaker is open, requests are being rejected
 */
export class CircuitOpenError extends TransientError {
  constructor(serviceName = 'unknown') {
    super(`Circuit breaker open for service: ${serviceName}`, 503);
    this.serviceName = serviceName;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if an error is transient (retryable)
 * @param {Error} error - The error to check
 * @returns {boolean} Whether the error is retryable
 */
export const isTransientError = (error) => {
  // Check our custom flag
  if (error instanceof AppError) {
    return error.isRetryable;
  }

  // Check for known transient error types/codes
  const transientCodes = [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'EPIPE',
  ];

  if (error.code && transientCodes.includes(error.code)) {
    return true;
  }

  // MongoDB transient errors
  if (error.name === 'MongoNetworkError' ||
    error.name === 'MongoTimeoutError' ||
    error.message?.includes('connection') ||
    error.message?.includes('timeout')) {
    return true;
  }

  // Check HTTP status codes
  const statusCode = error.statusCode || error.status;
  if (statusCode === 429 || statusCode === 502 || statusCode === 503 || statusCode === 504) {
    return true;
  }

  return false;
};

/**
 * Wrap an error in an appropriate AppError type
 * @param {Error} error - The original error
 * @returns {AppError} Wrapped error
 */
export const wrapError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  if (isTransientError(error)) {
    return new TransientError(error.message);
  }

  return new InternalServerError(error.message);
};

/**
 * Create error response object for API
 * @param {Error} error - The error
 * @param {boolean} includeStack - Whether to include stack trace
 * @returns {Object} Error response object
 */
export const createErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: error.message,
      code: error.name,
      statusCode: error.statusCode || 500,
    },
  };

  if (error instanceof ValidationError && error.errors) {
    response.error.details = error.errors;
  }

  if (error.isRetryable !== undefined) {
    response.error.retryable = error.isRetryable;
  }

  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
};
