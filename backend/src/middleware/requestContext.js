import { randomUUID } from 'crypto';
import { runWithContext } from '../utils/logger.js';

/**
 * Request Context Middleware
 * Generates unique request IDs and tracks request timing
 * Enables distributed tracing and correlation across logs
 */

/**
 * Generate a unique request ID
 * @returns {string}
 */
const generateRequestId = () => {
    try {
        return randomUUID();
    } catch {
        // Fallback to timestamp-based ID
        return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;
    }
};

/**
 * Request context middleware
 * Adds request ID, timing, and correlation context
 */
const requestContext = (req, res, next) => {
    // Skip if already finished
    if (res.headersSent) {
        return next();
    }

    // Get or generate request ID
    const requestId = req.headers['x-request-id'] ||
        req.headers['x-correlation-id'] ||
        generateRequestId();

    // Create request context
    const context = {
        requestId,
        startTime: Date.now(),
        path: req.path,
        method: req.method,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: null, // Will be set by auth middleware
    };

    // Attach to request object
    req.context = context;
    req.requestId = requestId;

    // Set response headers
    res.setHeader('X-Request-Id', requestId);

    // Track response time
    res.on('finish', () => {
        const duration = Date.now() - context.startTime;
        // Store for logging middleware
        res.duration = duration;
    });

    // Run rest of request with context
    runWithContext(context, () => {
        next();
    });
};

/**
 * Update request context with user info (call after auth)
 * @param {Object} req - Express request
 * @param {string} userId - User ID
 */
export const setRequestUser = (req, userId) => {
    if (req.context) {
        req.context.userId = userId;
    }
};

/**
 * Get current request duration
 * @param {Object} req - Express request
 * @returns {number} Duration in ms
 */
export const getRequestDuration = (req) => {
    if (!req.context) return 0;
    return Date.now() - req.context.startTime;
};

/**
 * Create a correlation context for async operations
 * @param {Object} req - Express request
 * @returns {Object} Correlation context
 */
export const getCorrelationContext = (req) => {
    return {
        requestId: req.requestId,
        userId: req.context?.userId,
        path: req.path,
        method: req.method,
    };
};

export default requestContext;
