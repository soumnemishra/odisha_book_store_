import mongoose from 'mongoose';
import { config } from './env.js';
import logger from '../utils/logger.js';

/**
 * MongoDB Connection Configuration
 * Production-ready settings inspired by Amazon/Flipkart patterns
 */
const connectionOptions = {
  // Connection Pool Settings
  maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE_MAX || '50', 10),
  minPoolSize: parseInt(process.env.MONGODB_POOL_SIZE_MIN || '5', 10),

  // Timeouts
  serverSelectionTimeoutMS: 10000, // 10 seconds to find a server
  socketTimeoutMS: 45000, // 45 seconds socket timeout
  connectTimeoutMS: 10000, // 10 seconds connection timeout

  // Keep-alive
  heartbeatFrequencyMS: 10000, // Check server health every 10 seconds

  // Write Concern
  retryWrites: process.env.MONGODB_RETRY_WRITES !== 'false',
  w: 'majority', // Wait for majority acknowledgment

  // Read Preference
  readPreference: 'primaryPreferred', // Prefer primary, fallback to secondary
};

/**
 * Connection state tracking
 */
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number
 * @returns {number} Delay in milliseconds
 */
const getRetryDelay = (attempt) => {
  const baseDelay = RETRY_DELAY_MS;
  const maxDelay = 60000; // Max 1 minute
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Connect to MongoDB database with retry logic
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  // Skip if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.debug('MongoDB already connected, reusing connection');
    return;
  }

  connectionAttempts++;

  try {
    const startTime = Date.now();

    const conn = await mongoose.connect(config.MONGODB_URI, connectionOptions);

    const connectionTime = Date.now() - startTime;
    isConnected = true;
    connectionAttempts = 0; // Reset on success

    logger.info('MongoDB Connected', {
      host: conn.connection.host,
      database: conn.connection.name,
      poolSize: connectionOptions.maxPoolSize,
      connectionTimeMs: connectionTime,
    });

    // Setup connection event handlers
    setupConnectionHandlers();

  } catch (error) {
    isConnected = false;

    logger.error('MongoDB connection error', {
      error: error.message,
      attempt: connectionAttempts,
      maxAttempts: MAX_RETRY_ATTEMPTS,
      stack: error.stack,
    });

    // Retry with exponential backoff
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      const delay = getRetryDelay(connectionAttempts);
      logger.info(`Retrying MongoDB connection in ${delay}ms...`, {
        attempt: connectionAttempts,
        nextAttempt: connectionAttempts + 1,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(); // Recursive retry
    }

    // Exit after max retries in production
    logger.error('MongoDB connection failed after max retries, exiting');
    process.exit(1);
  }
};

/**
 * Setup MongoDB connection event handlers
 */
const setupConnectionHandlers = () => {
  const db = mongoose.connection;

  // Connection lost
  db.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected', {
      readyState: db.readyState,
    });

    // Attempt auto-reconnect if not shutting down
    if (process.env.NODE_ENV !== 'test' && !isShuttingDown) {
      logger.info('Attempting automatic reconnection...');
      setTimeout(() => connectDB(), RETRY_DELAY_MS);
    }
  });

  // Connection error
  db.on('error', (error) => {
    logger.error('MongoDB connection error event', {
      error: error.message,
      code: error.code,
    });
  });

  // Reconnected
  db.on('reconnected', () => {
    isConnected = true;
    logger.info('MongoDB reconnected successfully');
  });

  // Connection closed
  db.on('close', () => {
    isConnected = false;
    logger.info('MongoDB connection closed');
  });
};

/**
 * Shutdown flag to prevent reconnection during graceful shutdown
 */
let isShuttingDown = false;

/**
 * Gracefully disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  isShuttingDown = true;

  if (mongoose.connection.readyState !== 0) {
    logger.info('Closing MongoDB connection...');
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB connection closed gracefully');
  }
};

/**
 * Get database connection status
 * @returns {Object} Connection status information
 */
export const getConnectionStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection.readyState;

  return {
    isConnected,
    readyState,
    readyStateText: states[readyState] || 'unknown',
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || null,
    poolSize: connectionOptions.maxPoolSize,
  };
};

/**
 * Check if database is healthy
 * @returns {Promise<Object>} Health check result
 */
export const checkDatabaseHealth = async () => {
  const startTime = Date.now();

  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        healthy: false,
        error: 'Database not connected',
        readyState: mongoose.connection.readyState,
      };
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - startTime;

    return {
      healthy: true,
      latencyMs: latency,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      latencyMs: Date.now() - startTime,
    };
  }
};

export default connectDB;
