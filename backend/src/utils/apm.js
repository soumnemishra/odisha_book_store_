import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import logger from './logger.js';

/**
 * Application Performance Monitoring (APM) Configuration
 * Uses Sentry for error tracking and performance monitoring.
 * 
 * Usage:
 * Call `initAPM()` at the start of your application.
 */

let isInitialized = false;

export const initAPM = (app) => {
    if (process.env.NODE_ENV !== 'production') {
        logger.info('APM skipped in non-production environment');
        return;
    }

    if (!process.env.SENTRY_DSN) {
        logger.warn('SENTRY_DSN not found. APM disabled.');
        return;
    }

    try {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            integrations: [
                // Enable HTTP calls tracing
                new Sentry.Integrations.Http({ tracing: true }),
                // Enable Express.js tracing
                new Sentry.Integrations.Express({ app }),
                nodeProfilingIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0, // Capture 100% of the transactions
            // Set sampling rate for profiling - this is relative to tracesSampleRate
            profilesSampleRate: 1.0,
        });

        // The request handler must be the first middleware on the app
        app.use(Sentry.Handlers.requestHandler());
        // TracingHandler creates a trace for every incoming request
        app.use(Sentry.Handlers.tracingHandler());

        // The error handler must be before any other error middleware and after all controllers
        // We export a setupErrorMonitoring function to be called later

        isInitialized = true;
        logger.info('APM (Sentry) initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize APM', error);
    }
};

/**
 * Setup Sentry error handler middleware
 * Must be called *after* all routes and *before* global error handler
 */
export const setupAPMErrorHandler = (app) => {
    if (isInitialized) {
        app.use(Sentry.Handlers.errorHandler());
    }
};

export default { initAPM, setupAPMErrorHandler };
