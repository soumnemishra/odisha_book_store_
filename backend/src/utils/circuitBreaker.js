import logger from './logger.js';
import { CircuitOpenError } from './errors.js';

/**
 * Circuit Breaker Pattern Implementation
 * Inspired by Netflix Hystrix and used by Amazon/Flipkart
 * 
 * States:
 * - CLOSED: Normal operation, requests go through
 * - OPEN: Failing, requests are rejected immediately
 * - HALF_OPEN: Testing, limited requests allowed to check recovery
 */

const STATES = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN',
};

/**
 * Default circuit breaker configuration
 */
const DEFAULT_OPTIONS = {
    failureThreshold: 5,        // Number of failures before opening
    successThreshold: 3,        // Number of successes to close from half-open
    timeout: 30000,             // Time in ms before trying half-open
    monitorInterval: 10000,     // How often to check state
    volumeThreshold: 5,         // Minimum requests before calculating failure rate
    failureRateThreshold: 50,   // Percentage of failures to trigger open
};

/**
 * Circuit Breaker class
 */
class CircuitBreaker {
    /**
     * @param {string} name - Name of the service/circuit
     * @param {Object} options - Configuration options
     */
    constructor(name, options = {}) {
        this.name = name;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.state = STATES.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = null;
        this.nextAttemptTime = null;
        this.requestCount = 0;
        this.failureCount = 0;

        // Statistics
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rejectedRequests: 0,
            stateChanges: [],
        };

        logger.debug('Circuit breaker created', {
            name: this.name,
            options: this.options,
        });
    }

    /**
     * Check current state and potentially transition
     */
    checkState() {
        if (this.state === STATES.OPEN) {
            const now = Date.now();
            if (now >= this.nextAttemptTime) {
                this.transitionTo(STATES.HALF_OPEN);
            }
        }
    }

    /**
     * Transition to a new state
     * @param {string} newState - The new state
     */
    transitionTo(newState) {
        const oldState = this.state;
        this.state = newState;

        // Reset counters based on new state
        if (newState === STATES.CLOSED) {
            this.failures = 0;
            this.successes = 0;
            this.requestCount = 0;
            this.failureCount = 0;
        } else if (newState === STATES.HALF_OPEN) {
            this.successes = 0;
        }

        this.stats.stateChanges.push({
            from: oldState,
            to: newState,
            timestamp: new Date().toISOString(),
        });

        logger.info('Circuit breaker state change', {
            name: this.name,
            from: oldState,
            to: newState,
        });
    }

    /**
     * Record a successful request
     */
    recordSuccess() {
        this.stats.totalRequests++;
        this.stats.successfulRequests++;
        this.requestCount++;
        this.successes++;
        this.failures = 0; // Reset consecutive failures

        if (this.state === STATES.HALF_OPEN) {
            if (this.successes >= this.options.successThreshold) {
                this.transitionTo(STATES.CLOSED);
            }
        }
    }

    /**
     * Record a failed request
     */
    recordFailure() {
        this.stats.totalRequests++;
        this.stats.failedRequests++;
        this.requestCount++;
        this.failureCount++;
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.state === STATES.HALF_OPEN) {
            // Immediately open on failure in half-open
            this.openCircuit();
        } else if (this.state === STATES.CLOSED) {
            // Check if we should open
            if (this.shouldOpen()) {
                this.openCircuit();
            }
        }
    }

    /**
     * Check if circuit should open
     * @returns {boolean}
     */
    shouldOpen() {
        // Check consecutive failures
        if (this.failures >= this.options.failureThreshold) {
            return true;
        }

        // Check failure rate if we have enough volume
        if (this.requestCount >= this.options.volumeThreshold) {
            const failureRate = (this.failureCount / this.requestCount) * 100;
            if (failureRate >= this.options.failureRateThreshold) {
                return true;
            }
        }

        return false;
    }

    /**
     * Open the circuit
     */
    openCircuit() {
        this.transitionTo(STATES.OPEN);
        this.nextAttemptTime = Date.now() + this.options.timeout;

        logger.warn('Circuit breaker opened', {
            name: this.name,
            failures: this.failures,
            nextAttemptIn: this.options.timeout,
        });
    }

    /**
     * Check if request should be allowed
     * @returns {boolean}
     */
    canRequest() {
        this.checkState();
        return this.state !== STATES.OPEN;
    }

    /**
     * Execute a function with circuit breaker protection
     * @param {Function} fn - Async function to execute
     * @returns {Promise<*>} Result of the function
     */
    async execute(fn) {
        if (!this.canRequest()) {
            this.stats.rejectedRequests++;
            throw new CircuitOpenError(this.name);
        }

        try {
            const result = await fn();
            this.recordSuccess();
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    /**
     * Get circuit breaker statistics
     * @returns {Object}
     */
    getStats() {
        return {
            name: this.name,
            state: this.state,
            ...this.stats,
            failureRate: this.requestCount > 0
                ? ((this.failureCount / this.requestCount) * 100).toFixed(2) + '%'
                : '0%',
            consecutiveFailures: this.failures,
            consecutiveSuccesses: this.successes,
            lastFailure: this.lastFailureTime
                ? new Date(this.lastFailureTime).toISOString()
                : null,
        };
    }

    /**
     * Manually reset the circuit breaker
     */
    reset() {
        this.transitionTo(STATES.CLOSED);
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rejectedRequests: 0,
            stateChanges: [],
        };
        logger.info('Circuit breaker manually reset', { name: this.name });
    }
}

/**
 * Circuit Breaker Registry
 * Manages multiple circuit breakers
 */
class CircuitBreakerRegistry {
    constructor() {
        this.breakers = new Map();
    }

    /**
     * Get or create a circuit breaker
     * @param {string} name - Service name
     * @param {Object} options - Configuration options
     * @returns {CircuitBreaker}
     */
    getBreaker(name, options = {}) {
        if (!this.breakers.has(name)) {
            this.breakers.set(name, new CircuitBreaker(name, options));
        }
        return this.breakers.get(name);
    }

    /**
     * Get all circuit breaker stats
     * @returns {Object}
     */
    getAllStats() {
        const stats = {};
        this.breakers.forEach((breaker, name) => {
            stats[name] = breaker.getStats();
        });
        return stats;
    }

    /**
     * Reset all circuit breakers
     */
    resetAll() {
        this.breakers.forEach((breaker) => breaker.reset());
    }
}

// Singleton registry
const registry = new CircuitBreakerRegistry();

/**
 * Create or get a circuit breaker
 * @param {string} name - Service name
 * @param {Object} options - Configuration options
 * @returns {CircuitBreaker}
 */
export const getCircuitBreaker = (name, options) => registry.getBreaker(name, options);

/**
 * Get all circuit breaker statistics
 * @returns {Object}
 */
export const getAllCircuitBreakerStats = () => registry.getAllStats();

/**
 * Reset all circuit breakers
 */
export const resetAllCircuitBreakers = () => registry.resetAll();

/**
 * Higher-order function to wrap a function with circuit breaker
 * @param {string} name - Circuit breaker name
 * @param {Function} fn - Function to wrap
 * @param {Object} options - Circuit breaker options
 * @returns {Function} Wrapped function
 */
export const withCircuitBreaker = (name, fn, options = {}) => {
    const breaker = getCircuitBreaker(name, options);
    return async (...args) => breaker.execute(() => fn(...args));
};

export { CircuitBreaker, STATES };
export default CircuitBreaker;
