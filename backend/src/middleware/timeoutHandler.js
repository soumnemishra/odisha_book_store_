import logger from '../utils/logger.js';
import { TimeoutError } from '../utils/errors.js';

/**
 * Request Timeout Handler Middleware
 * Prevents requests from hanging indefinitely
 * Ensures resources are freed even if handlers don't complete
 */

/**
 * Default timeout configuration
 */
const DEFAULT_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10);

/**
 * Create timeout middleware
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware
 */
const createTimeoutHandler = (timeoutMs = DEFAULT_TIMEOUT_MS, options = {}) => {
    const {
        message = 'Request timed out',
        statusCode = 504,
        onTimeout = null,
    } = options;

    return (req, res, next) => {
        // Skip if already finished
        if (res.headersSent) {
            return next();
        }

        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;

            // Log timeout
            logger.warn('Request timeout', {
                path: req.path,
                method: req.method,
                timeoutMs,
                requestId: req.requestId,
            });

            // Call custom timeout handler if provided
            if (onTimeout) {
                try {
                    onTimeout(req, res);
                } catch (err) {
                    logger.error('Timeout handler error', { error: err.message });
                }
            }

            // Only send response if headers not sent
            if (!res.headersSent) {
                res.status(statusCode).json({
                    success: false,
                    error: {
                        code: 'REQUEST_TIMEOUT',
                        message,
                        timeoutMs,
                    },
                });
            }

            // Destroy the request to free resources
            if (req.socket && !req.socket.destroyed) {
                req.socket.destroy();
            }
        }, timeoutMs);

        // Clear timeout when response finishes
        res.on('finish', () => {
            clearTimeout(timeoutId);
        });

        res.on('close', () => {
            clearTimeout(timeoutId);
        });

        // Augment res.json to clear timeout
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            if (!timedOut) {
                clearTimeout(timeoutId);
                return originalJson(data);
            }
        };

        // Augment res.send to clear timeout
        const originalSend = res.send.bind(res);
        res.send = (data) => {
            if (!timedOut) {
                clearTimeout(timeoutId);
                return originalSend(data);
            }
        };

        // Add helper to check if timed out
        req.isTimedOut = () => timedOut;

        next();
    };
};

/**
 * Async operation timeout wrapper
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operation - Operation name for error message
 * @returns {Promise} Wrapped promise
 */
export const withTimeout = (promise, timeoutMs, operation = 'Operation') => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new TimeoutError(`${operation} timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        promise
            .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
};

/**
 * Route-specific timeout configurations
 */
export const TimeoutPresets = {
    FAST: 5000,       // 5 seconds - for quick operations
    NORMAL: 30000,    // 30 seconds - default
    SLOW: 60000,      // 60 seconds - for complex operations
    UPLOAD: 120000,   // 2 minutes - for file uploads
    LONG: 300000,     // 5 minutes - for batch operations
};

/**
 * Apply timeout to specific routes
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Function} Middleware
 */
export const routeTimeout = (timeoutMs) => createTimeoutHandler(timeoutMs);

/**
 * Default timeout middleware for general API routes
 */
export const defaultTimeout = createTimeoutHandler(DEFAULT_TIMEOUT_MS);

/**
 * Abort controller wrapper for fetch/axios requests
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Controller with signal and abort function
 */
export const createAbortController = (timeoutMs) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return {
        signal: controller.signal,
        clear: () => clearTimeout(timeoutId),
        abort: () => {
            clearTimeout(timeoutId);
            controller.abort();
        },
    };
};

export default createTimeoutHandler;
