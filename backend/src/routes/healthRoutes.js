import express from 'express';
import mongoose from 'mongoose';
import { getConnectionStatus, checkDatabaseHealth } from '../config/db.js';
import { getHealthMetrics, getDatabaseStatus } from '../utils/dbHealthMonitor.js';
import { getAllCircuitBreakerStats } from '../utils/circuitBreaker.js';
import { getCache } from '../utils/cacheManager.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Health Check Routes
 * Provides different levels of health information
 */

/**
 * @route   GET /api/health
 * @desc    Basic liveness check - is the server responding?
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
    });
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness check - is the server ready to accept requests?
 * @access  Public
 */
router.get('/ready', async (req, res) => {
    try {
        const dbStatus = getConnectionStatus();
        const isReady = dbStatus.isConnected &&
            mongoose.connection.readyState === 1;

        res.status(isReady ? 200 : 503).json({
            success: isReady,
            status: isReady ? 'ready' : 'not_ready',
            timestamp: new Date().toISOString(),
            checks: {
                database: {
                    connected: dbStatus.isConnected,
                    readyState: dbStatus.readyStateText,
                },
            },
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'not_ready',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

/**
 * @route   GET /api/health/live
 * @desc    Kubernetes-style liveness probe
 * @access  Public
 */
router.get('/live', (req, res) => {
    // Simple check - if we can respond, we're alive
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
    });
});

/**
 * @route   GET /api/health/deep
 * @desc    Deep health check with all system metrics (admin only)
 * @access  Private/Admin
 */
router.get('/deep', protect, admin, async (req, res) => {
    try {
        const startTime = Date.now();

        // Database health
        const dbHealth = await checkDatabaseHealth();
        const dbMetrics = getHealthMetrics();
        const dbFullStatus = await getDatabaseStatus();

        // Cache stats
        const cache = getCache();
        const cacheStats = cache.getStats();

        // Circuit breaker stats
        const circuitBreakerStats = getAllCircuitBreakerStats();

        // Memory usage
        const memUsage = process.memoryUsage();
        const formatBytes = (bytes) => {
            return (bytes / 1024 / 1024).toFixed(2) + ' MB';
        };

        // CPU usage (approximate)
        const cpuUsage = process.cpuUsage();

        const response = {
            success: true,
            status: dbHealth.healthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            responseTimeMs: Date.now() - startTime,

            system: {
                uptime: Math.floor(process.uptime()),
                nodeVersion: process.version,
                platform: process.platform,
                pid: process.pid,
                memory: {
                    heapUsed: formatBytes(memUsage.heapUsed),
                    heapTotal: formatBytes(memUsage.heapTotal),
                    rss: formatBytes(memUsage.rss),
                    external: formatBytes(memUsage.external),
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                },
            },

            database: {
                healthy: dbHealth.healthy,
                latencyMs: dbHealth.latencyMs,
                connection: dbFullStatus.connection,
                metrics: dbMetrics,
            },

            cache: cacheStats,

            circuitBreakers: circuitBreakerStats,

            environment: {
                nodeEnv: process.env.NODE_ENV,
                port: process.env.PORT,
            },
        };

        res.json(response);

    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

/**
 * @route   GET /api/health/metrics
 * @desc    Prometheus-style metrics endpoint
 * @access  Private/Admin
 */
router.get('/metrics', protect, admin, async (req, res) => {
    try {
        const dbHealth = await checkDatabaseHealth();
        const cache = getCache();
        const cacheStats = cache.getStats();
        const memUsage = process.memoryUsage();

        // Format as Prometheus metrics
        let metrics = '';

        // Uptime
        metrics += `# HELP app_uptime_seconds Application uptime in seconds\n`;
        metrics += `# TYPE app_uptime_seconds gauge\n`;
        metrics += `app_uptime_seconds ${Math.floor(process.uptime())}\n\n`;

        // Database
        metrics += `# HELP db_healthy Database health status\n`;
        metrics += `# TYPE db_healthy gauge\n`;
        metrics += `db_healthy ${dbHealth.healthy ? 1 : 0}\n\n`;

        metrics += `# HELP db_latency_ms Database latency in milliseconds\n`;
        metrics += `# TYPE db_latency_ms gauge\n`;
        metrics += `db_latency_ms ${dbHealth.latencyMs || 0}\n\n`;

        // Cache
        metrics += `# HELP cache_hits_total Total cache hits\n`;
        metrics += `# TYPE cache_hits_total counter\n`;
        metrics += `cache_hits_total ${cacheStats.hits}\n\n`;

        metrics += `# HELP cache_misses_total Total cache misses\n`;
        metrics += `# TYPE cache_misses_total counter\n`;
        metrics += `cache_misses_total ${cacheStats.misses}\n\n`;

        metrics += `# HELP cache_size Current cache size\n`;
        metrics += `# TYPE cache_size gauge\n`;
        metrics += `cache_size ${cacheStats.size}\n\n`;

        // Memory
        metrics += `# HELP nodejs_heap_used_bytes Heap memory used\n`;
        metrics += `# TYPE nodejs_heap_used_bytes gauge\n`;
        metrics += `nodejs_heap_used_bytes ${memUsage.heapUsed}\n\n`;

        metrics += `# HELP nodejs_heap_total_bytes Total heap memory\n`;
        metrics += `# TYPE nodejs_heap_total_bytes gauge\n`;
        metrics += `nodejs_heap_total_bytes ${memUsage.heapTotal}\n\n`;

        res.set('Content-Type', 'text/plain');
        res.send(metrics);

    } catch (error) {
        res.status(500).send(`# Error generating metrics: ${error.message}\n`);
    }
});

export default router;
