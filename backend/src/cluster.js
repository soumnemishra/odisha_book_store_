import cluster from 'cluster';
import os from 'os';
import logger from './utils/logger.js';

/**
 * Node.js Clustering for Multi-Core Utilization
 * Production pattern used by Amazon/Flipkart for horizontal scaling
 * 
 * Usage: 
 *   - Set ENABLE_CLUSTERING=true in .env
 *   - Run: node src/cluster.js (instead of node src/server.js)
 */

/**
 * Cluster configuration
 */
const WORKER_COUNT = process.env.WORKER_COUNT === 'auto'
    ? os.cpus().length
    : parseInt(process.env.WORKER_COUNT || os.cpus().length.toString(), 10);

const ENABLE_CLUSTERING = process.env.ENABLE_CLUSTERING === 'true';

/**
 * Worker restart configuration
 */
const RESTART_DELAY_MS = 1000; // Wait 1 second before restarting crashed worker
const MAX_RESTARTS_PER_MINUTE = 5;
let restartsInLastMinute = 0;

// Reset restart counter every minute
setInterval(() => {
    restartsInLastMinute = 0;
}, 60000);

/**
 * Handle worker exit
 * @param {Object} worker - The exited worker
 * @param {number} code - Exit code
 * @param {string} signal - Exit signal
 */
const handleWorkerExit = (worker, code, signal) => {
    const exitInfo = {
        workerId: worker.id,
        pid: worker.process.pid,
        code,
        signal,
    };

    if (signal) {
        logger.info('Worker killed by signal', exitInfo);
    } else if (code !== 0) {
        logger.error('Worker exited with error', exitInfo);
    } else {
        logger.info('Worker gracefully exited', exitInfo);
    }

    // Restart worker if it crashed (not graceful shutdown)
    if (code !== 0 && !worker.exitedAfterDisconnect) {
        restartsInLastMinute++;

        if (restartsInLastMinute > MAX_RESTARTS_PER_MINUTE) {
            logger.error('Too many worker restarts, not restarting', {
                restarts: restartsInLastMinute,
                maxAllowed: MAX_RESTARTS_PER_MINUTE,
            });
            return;
        }

        logger.info('Restarting worker', {
            afterMs: RESTART_DELAY_MS,
            restartsInLastMinute,
        });

        setTimeout(() => {
            const newWorker = cluster.fork();
            logger.info('Worker restarted', {
                newWorkerId: newWorker.id,
                newPid: newWorker.process.pid,
            });
        }, RESTART_DELAY_MS);
    }
};

/**
 * Gracefully shutdown all workers
 */
const gracefulShutdown = () => {
    logger.info('Master: Initiating graceful shutdown');

    // Disconnect all workers
    for (const id in cluster.workers) {
        const worker = cluster.workers[id];
        if (worker) {
            worker.send('shutdown');
            worker.disconnect();
        }
    }

    // Force exit after timeout
    setTimeout(() => {
        logger.warn('Master: Force exiting after timeout');
        process.exit(0);
    }, 30000);
};

/**
 * Start the cluster master
 */
const startMaster = () => {
    logger.info('Cluster master starting', {
        pid: process.pid,
        workerCount: WORKER_COUNT,
        cpus: os.cpus().length,
        platform: process.platform,
        nodeVersion: process.version,
    });

    // Fork workers
    for (let i = 0; i < WORKER_COUNT; i++) {
        const worker = cluster.fork();
        logger.info('Worker started', {
            workerId: worker.id,
            pid: worker.process.pid,
        });
    }

    // Handle worker messages
    cluster.on('message', (worker, message) => {
        if (message.type === 'log') {
            logger.info(`Worker ${worker.id}: ${message.data}`);
        }
    });

    // Handle worker exit
    cluster.on('exit', handleWorkerExit);

    // Handle worker online
    cluster.on('online', (worker) => {
        logger.info('Worker online', {
            workerId: worker.id,
            pid: worker.process.pid,
        });
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    logger.info('Cluster master ready', {
        workers: Object.keys(cluster.workers).length,
    });
};

/**
 * Start a worker process
 */
const startWorker = async () => {
    logger.info('Worker starting', {
        workerId: cluster.worker?.id,
        pid: process.pid,
    });

    // Import and start the server
    try {
        await import('./server.js');

        // Listen for shutdown message from master
        process.on('message', (message) => {
            if (message === 'shutdown') {
                logger.info('Worker received shutdown signal');
                process.exit(0);
            }
        });
    } catch (error) {
        logger.error('Worker failed to start', {
            error: error.message,
            stack: error.stack,
        });
        process.exit(1);
    }
};

/**
 * Main entry point
 */
const main = () => {
    if (!ENABLE_CLUSTERING) {
        logger.info('Clustering disabled, starting single process');
        import('./server.js');
        return;
    }

    if (cluster.isPrimary) {
        startMaster();
    } else {
        startWorker();
    }
};

// Run main
main();

export { startMaster, startWorker, gracefulShutdown };
