import logger from './logger.js';
import { isTransientError, TimeoutError } from './errors.js';

/**
 * Retry Handler with Exponential Backoff
 * Inspired by AWS SDK retry logic and production patterns
 */

/**
 * Default retry configuration
 */
const DEFAULT_OPTIONS = {
    maxRetries: 3,
    baseDelayMs: 1000,           // Initial delay
    maxDelayMs: 30000,           // Maximum delay
    backoffMultiplier: 2,        // Exponential multiplier
    jitterEnabled: true,         // Add randomness to prevent thundering herd
    timeoutMs: null,             // Overall timeout (null = no timeout)
    retryCondition: null,        // Custom retry condition function
    onRetry: null,               // Callback on each retry
};

/**
 * Calculate delay with exponential backoff and optional jitter
 * @param {number} attempt - Current attempt number (1-based)
 * @param {Object} options - Retry options
 * @returns {number} Delay in milliseconds
 */
const calculateDelay = (attempt, options) => {
    const { baseDelayMs, maxDelayMs, backoffMultiplier, jitterEnabled } = options;

    // Exponential backoff: delay = base * (multiplier ^ (attempt - 1))
    let delay = baseDelayMs * Math.pow(backoffMultiplier, attempt - 1);

    // Cap at max delay
    delay = Math.min(delay, maxDelayMs);

    // Add jitter (0-50% of delay)
    if (jitterEnabled) {
        const jitter = delay * Math.random() * 0.5;
        delay += jitter;
    }

    return Math.floor(delay);
};

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a timeout promise
 * @param {number} ms - Timeout in milliseconds
 * @param {string} operation - Operation name for error message
 * @returns {Promise<never>}
 */
const createTimeout = (ms, operation) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(`Operation '${operation}' timed out after ${ms}ms`));
        }, ms);
    });
};

/**
 * Execute a function with retry logic
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @returns {Promise<*>} Result of the function
 */
export const retryWithBackoff = async (fn, options = {}) => {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const { maxRetries, timeoutMs, retryCondition, onRetry } = config;

    let lastError;
    const startTime = Date.now();
    const operationName = fn.name || 'anonymous';

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            // Check overall timeout
            if (timeoutMs) {
                const elapsed = Date.now() - startTime;
                if (elapsed >= timeoutMs) {
                    throw new TimeoutError(`Overall timeout exceeded for '${operationName}'`);
                }

                // Race between function and remaining timeout
                const remainingTime = timeoutMs - elapsed;
                const result = await Promise.race([
                    fn(),
                    createTimeout(remainingTime, operationName),
                ]);
                return result;
            }

            // Execute without overall timeout
            return await fn();

        } catch (error) {
            lastError = error;

            // Check if we should retry
            const shouldRetry =
                attempt <= maxRetries &&
                (retryCondition ? retryCondition(error) : isTransientError(error));

            if (!shouldRetry) {
                throw error;
            }

            // Calculate delay for next attempt
            const delay = calculateDelay(attempt, config);

            // Log retry attempt
            logger.warn('Retry attempt', {
                operation: operationName,
                attempt,
                maxRetries,
                delay,
                error: error.message,
            });

            // Call onRetry callback if provided
            if (onRetry) {
                try {
                    await onRetry(error, attempt, delay);
                } catch (callbackError) {
                    logger.error('onRetry callback failed', { error: callbackError.message });
                }
            }

            // Wait before retrying
            await sleep(delay);
        }
    }

    // All retries exhausted
    throw lastError;
};

/**
 * Higher-order function to wrap a function with retry logic
 * @param {Function} fn - Function to wrap
 * @param {Object} options - Retry options
 * @returns {Function} Wrapped function
 */
export const withRetry = (fn, options = {}) => {
    return async (...args) => {
        return retryWithBackoff(() => fn(...args), {
            ...options,
            // Preserve function name for logging
            fn: { name: fn.name || 'wrapped' },
        });
    };
};

/**
 * Retry strategies for common scenarios
 */
export const RetryStrategies = {
    /**
     * Aggressive retry for critical operations
     */
    AGGRESSIVE: {
        maxRetries: 5,
        baseDelayMs: 500,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
    },

    /**
     * Conservative retry for non-critical operations
     */
    CONSERVATIVE: {
        maxRetries: 2,
        baseDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 1.5,
    },

    /**
     * Fast retry for quick operations
     */
    FAST: {
        maxRetries: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        backoffMultiplier: 2,
    },

    /**
     * Database operations
     */
    DATABASE: {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        retryCondition: (error) => {
            // Retry on connection errors and timeouts
            return error.name === 'MongoNetworkError' ||
                error.name === 'MongoTimeoutError' ||
                error.code === 'ECONNRESET' ||
                error.code === 'ECONNREFUSED';
        },
    },

    /**
     * External API calls
     */
    EXTERNAL_API: {
        maxRetries: 3,
        baseDelayMs: 2000,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
        timeoutMs: 60000,
    },
};

/**
 * Create a retry-wrapped async function with named strategy
 * @param {Function} fn - Function to wrap
 * @param {string} strategyName - Name of predefined strategy
 * @param {Object} overrides - Override options
 * @returns {Function} Wrapped function
 */
export const withRetryStrategy = (fn, strategyName, overrides = {}) => {
    const strategy = RetryStrategies[strategyName] || RetryStrategies.CONSERVATIVE;
    return withRetry(fn, { ...strategy, ...overrides });
};

/**
 * Execute multiple operations with collective retry logic
 * @param {Array<Function>} operations - Array of async functions
 * @param {Object} options - Retry options
 * @returns {Promise<Array>} Results array
 */
export const retryAll = async (operations, options = {}) => {
    return Promise.all(
        operations.map(op => retryWithBackoff(op, options))
    );
};

/**
 * Execute operations sequentially with retry
 * @param {Array<Function>} operations - Array of async functions
 * @param {Object} options - Retry options
 * @returns {Promise<Array>} Results array
 */
export const retrySequential = async (operations, options = {}) => {
    const results = [];
    for (const op of operations) {
        results.push(await retryWithBackoff(op, options));
    }
    return results;
};

export default {
    retryWithBackoff,
    withRetry,
    withRetryStrategy,
    RetryStrategies,
    retryAll,
    retrySequential,
};
