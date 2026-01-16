import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * Database Health Monitor
 * Provides continuous monitoring and health metrics for MongoDB connection
 * Inspired by production monitoring patterns used by Amazon/Flipkart
 */

/**
 * Health check thresholds
 */
const THRESHOLDS = {
    LATENCY_WARNING_MS: 100,
    LATENCY_CRITICAL_MS: 500,
    HEALTH_CHECK_INTERVAL_MS: 30000, // Check every 30 seconds
};

/**
 * Metrics storage
 */
let metrics = {
    lastCheckTime: null,
    lastLatency: null,
    checksPerformed: 0,
    failedChecks: 0,
    totalLatency: 0,
    isHealthy: false,
};

let healthCheckInterval = null;

/**
 * Perform a single health check
 * @returns {Promise<Object>} Health check result
 */
export const performHealthCheck = async () => {
    const startTime = Date.now();
    const result = {
        timestamp: new Date().toISOString(),
        healthy: false,
        latencyMs: 0,
        details: {},
    };

    try {
        // Check connection state
        if (mongoose.connection.readyState !== 1) {
            result.details.error = 'Database not connected';
            result.details.readyState = mongoose.connection.readyState;
            metrics.failedChecks++;
            return result;
        }

        // Ping command
        const pingResult = await mongoose.connection.db.admin().ping();
        result.latencyMs = Date.now() - startTime;
        result.healthy = pingResult.ok === 1;

        // Update metrics
        metrics.checksPerformed++;
        metrics.lastCheckTime = result.timestamp;
        metrics.lastLatency = result.latencyMs;
        metrics.totalLatency += result.latencyMs;
        metrics.isHealthy = result.healthy;

        // Get detailed info
        result.details = {
            host: mongoose.connection.host,
            database: mongoose.connection.name,
            readyState: mongoose.connection.readyState,
            averageLatencyMs: Math.round(metrics.totalLatency / metrics.checksPerformed),
        };

        // Log warnings for high latency
        if (result.latencyMs > THRESHOLDS.LATENCY_CRITICAL_MS) {
            logger.error('Database health check CRITICAL - high latency', {
                latencyMs: result.latencyMs,
                threshold: THRESHOLDS.LATENCY_CRITICAL_MS,
            });
        } else if (result.latencyMs > THRESHOLDS.LATENCY_WARNING_MS) {
            logger.warn('Database health check WARNING - elevated latency', {
                latencyMs: result.latencyMs,
                threshold: THRESHOLDS.LATENCY_WARNING_MS,
            });
        }

        return result;

    } catch (error) {
        result.latencyMs = Date.now() - startTime;
        result.details.error = error.message;
        metrics.failedChecks++;
        metrics.isHealthy = false;

        logger.error('Database health check failed', {
            error: error.message,
            latencyMs: result.latencyMs,
        });

        return result;
    }
};

/**
 * Get connection pool statistics
 * @returns {Object} Pool statistics
 */
export const getPoolStats = () => {
    const client = mongoose.connection.getClient();

    if (!client) {
        return {
            available: false,
            error: 'Client not available',
        };
    }

    // Note: MongoDB driver v4+ has different pool management
    // These are approximations based on connection state
    return {
        available: true,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
    };
};

/**
 * Get aggregated health metrics
 * @returns {Object} Health metrics
 */
export const getHealthMetrics = () => {
    return {
        ...metrics,
        averageLatencyMs: metrics.checksPerformed > 0
            ? Math.round(metrics.totalLatency / metrics.checksPerformed)
            : null,
        successRate: metrics.checksPerformed > 0
            ? ((metrics.checksPerformed - metrics.failedChecks) / metrics.checksPerformed * 100).toFixed(2) + '%'
            : 'N/A',
    };
};

/**
 * Start periodic health monitoring
 * @param {number} intervalMs - Check interval in milliseconds
 */
export const startHealthMonitoring = (intervalMs = THRESHOLDS.HEALTH_CHECK_INTERVAL_MS) => {
    if (healthCheckInterval) {
        logger.warn('Health monitoring already running');
        return;
    }

    logger.info('Starting database health monitoring', { intervalMs });

    healthCheckInterval = setInterval(async () => {
        await performHealthCheck();
    }, intervalMs);

    // Don't prevent process exit
    healthCheckInterval.unref();
};

/**
 * Stop periodic health monitoring
 */
export const stopHealthMonitoring = () => {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
        logger.info('Database health monitoring stopped');
    }
};

/**
 * Reset metrics (useful for testing)
 */
export const resetMetrics = () => {
    metrics = {
        lastCheckTime: null,
        lastLatency: null,
        checksPerformed: 0,
        failedChecks: 0,
        totalLatency: 0,
        isHealthy: false,
    };
};

/**
 * Get comprehensive database status
 * @returns {Promise<Object>} Complete database status
 */
export const getDatabaseStatus = async () => {
    const healthCheck = await performHealthCheck();
    const poolStats = getPoolStats();
    const healthMetrics = getHealthMetrics();

    return {
        connection: {
            healthy: healthCheck.healthy,
            latencyMs: healthCheck.latencyMs,
            host: mongoose.connection.host,
            database: mongoose.connection.name,
            readyState: mongoose.connection.readyState,
        },
        pool: poolStats,
        metrics: healthMetrics,
        timestamp: new Date().toISOString(),
    };
};

export default {
    performHealthCheck,
    getPoolStats,
    getHealthMetrics,
    startHealthMonitoring,
    stopHealthMonitoring,
    resetMetrics,
    getDatabaseStatus,
};
