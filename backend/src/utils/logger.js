import winston from 'winston';
import { AsyncLocalStorage } from 'async_hooks';
import fs from 'fs';

/**
 * Enhanced Logger with Request Correlation
 * Production-ready logging inspired by Amazon/Flipkart observability patterns
 */

// Async local storage for request context
const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Get current request context
 * @returns {Object|null}
 */
export const getRequestContext = () => {
  return asyncLocalStorage.getStore() || null;
};

/**
 * Run function with request context
 * @param {Object} context - Request context
 * @param {Function} fn - Function to run
 */
export const runWithContext = (context, fn) => {
  asyncLocalStorage.run(context, fn);
};

/**
 * Custom format to include request context
 */
const contextFormat = winston.format((info) => {
  const context = getRequestContext();
  if (context) {
    info.requestId = context.requestId;
    info.userId = context.userId;
    info.path = context.path;
    info.method = context.method;
  }
  return info;
});

/**
 * Pretty print format for development
 */
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
    const reqId = requestId ? `[${requestId.substring(0, 8)}]` : '';
    const metaStr = Object.keys(meta).length > 0
      ? ` ${JSON.stringify(meta, null, 0)}`
      : '';
    return `${timestamp} ${level} ${reqId} ${message}${metaStr}`;
  })
);

/**
 * JSON format for production
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  contextFormat(),
  winston.format.json()
);

/**
 * Determine log level based on environment
 */
const getLogLevel = () => {
  const level = process.env.LOG_LEVEL;
  if (level) return level;

  switch (process.env.NODE_ENV) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
};

/**
 * Ensure logs directory exists
 */
const ensureLogsDirectory = () => {
  const logsDir = './logs';
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  } catch (err) {
    // Ignore errors - logging will just go to console
  }
};

// Ensure logs directory exists
ensureLogsDirectory();

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  level: getLogLevel(),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: {
    service: 'odisha-book-store',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  }));

  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    tailable: true,
  }));
}

/**
 * Create a child logger with additional context
 * @param {Object} context - Additional context
 * @returns {winston.Logger}
 */
export const createChildLogger = (context = {}) => {
  return logger.child(context);
};

/**
 * Log timing information
 * @param {string} operation - Operation name
 * @param {number} startTime - Start time in ms
 * @param {Object} meta - Additional metadata
 */
export const logTiming = (operation, startTime, meta = {}) => {
  const duration = Date.now() - startTime;
  logger.info(`${operation} completed`, {
    operation,
    durationMs: duration,
    ...meta,
  });
};

/**
 * Performance timing helper
 * @param {string} operation - Operation name
 * @returns {Object} Timer object with end() method
 */
export const startTimer = (operation) => {
  const startTime = Date.now();
  return {
    operation,
    startTime,
    end: (meta = {}) => logTiming(operation, startTime, meta),
    elapsed: () => Date.now() - startTime,
  };
};

/**
 * Structured error logging
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * @param {Object} meta - Additional metadata
 */
export const logError = (message, error, meta = {}) => {
  logger.error(message, {
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    errorCode: error.code,
    isOperational: error.isOperational || false,
    isRetryable: error.isRetryable || false,
    ...meta,
  });
};

/**
 * Log HTTP request
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {number} duration - Request duration in ms
 */
export const logRequest = (req, res, duration) => {
  const level = res.statusCode >= 400 ? 'warn' : 'info';

  logger[level]('HTTP Request', {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    durationMs: duration,
    contentLength: res.get('Content-Length'),
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
};

/**
 * Database query logging
 * @param {string} operation - Query operation
 * @param {string} collection - Collection name
 * @param {number} duration - Query duration
 * @param {Object} meta - Additional metadata
 */
export const logDbQuery = (operation, collection, duration, meta = {}) => {
  const level = duration > 100 ? 'warn' : 'debug';

  logger[level]('Database Query', {
    operation,
    collection,
    durationMs: duration,
    slow: duration > 100,
    ...meta,
  });
};

/**
 * Security event logging
 * @param {string} event - Security event type
 * @param {Object} meta - Event metadata
 */
export const logSecurityEvent = (event, meta = {}) => {
  logger.warn('Security Event', {
    securityEvent: event,
    ...meta,
  });
};

export { asyncLocalStorage };
export default logger;
