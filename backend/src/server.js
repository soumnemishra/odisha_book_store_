import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Configuration
import connectDB, { disconnectDB } from './config/db.js';
import { config } from './config/env.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';
import requestContext from './middleware/requestContext.js';
import { apiLimiter, authLimiter, orderLimiter } from './middleware/rateLimiter.js';
import { defaultTimeout } from './middleware/timeoutHandler.js';

// Utils
import logger, { logError, startTimer } from './utils/logger.js';
import { startHealthMonitoring, stopHealthMonitoring } from './utils/dbHealthMonitor.js';
import { getCache } from './utils/cacheManager.js';
import { initAPM, setupAPMErrorHandler } from './utils/apm.js';

// Routes
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

// Connect to database only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    const dbTimer = startTimer('Database Connection');
    connectDB().then(() => {
        dbTimer.end({ status: 'connected' });
        startHealthMonitoring();
    }).catch((err) => {
        logError('Database connection failed', err);
    });
}

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================

const app = express();
app.set('trust proxy', 1);

// Initialize APM (Sentry)
initAPM(app);

// ============================================================================
// SWAGGER DOCUMENTATION CONFIG
// ============================================================================

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Odisha Book Store API',
            version: '1.0.0',
            description: 'Enterprise-grade E-commerce API for Odisha Book Store',
            contact: {
                name: 'API Support',
                email: 'support@odishabookstore.com',
            },
        },
        servers: [
            {
                url: '/api/v1',
                description: 'Production API v1',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js', './src/models/*.js'], // Files containing annotations
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    config.CLIENT_URL,
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                logger.warn('CORS blocked request', { origin });
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
        exposedHeaders: ['X-Request-Id', 'RateLimit-Limit', 'RateLimit-Remaining'],
    })
);

// ============================================================================
// PERFORMANCE MIDDLEWARE
// ============================================================================

if (process.env.ENABLE_COMPRESSION !== 'false') {
    app.use(compression({
        level: 6,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) return false;
            return compression.filter(req, res);
        },
    }));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// DATA SANITIZATION
// ============================================================================

app.use(mongoSanitize({ replaceWith: '_' }));
app.use(xss());

// ============================================================================
// REQUEST PROCESSING
// ============================================================================

app.use(cookieParser());
app.use(requestContext);
app.use(requestLogger);
app.use(defaultTimeout);

// ============================================================================
// API DOCUMENTATION ROUTE
// ============================================================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Odisha Book Store API Docs"
}));

// ============================================================================
// API ROUTES (VERSION 1)
// ============================================================================

// Rate Limiters
app.use('/api/v1/', apiLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/orders', orderLimiter);

// Routes
const apiRouter = express.Router();
apiRouter.use('/health', healthRoutes);
apiRouter.use('/books', bookRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/chatbot', chatbotRoutes);
apiRouter.use('/admin', adminRoutes);

// Mount v1 Router
app.use('/api/v1', apiRouter);

// BACKWARD COMPATIBILITY (Legacy Routes - redirect or alias to v1)
// useful for existing frontend code that hasn't migrated yet
app.use('/api', apiRouter);

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
});

// APM Error Handler (must be before global error handler)
setupAPMErrorHandler(app);

app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

let server;

// Start server if not testing
if (process.env.NODE_ENV !== 'test') {
    const { PORT } = config;

    server = app.listen(PORT, () => {
        logger.info(`Server running`, {
            mode: config.NODE_ENV,
            port: PORT,
            docs: `http://localhost:${PORT}/api-docs`
        });
    });

    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
        logger.info(`${signal} received. Shutdown initiated.`);
        stopHealthMonitoring();

        server.close(async () => {
            logger.info('HTTP server closed.');
            try {
                await disconnectDB();
                getCache().stop();
                logger.info('Resources cleaned up.');
                process.exit(0);
            } catch (err) {
                logger.error('Error during shutdown', err);
                process.exit(1);
            }
        });

        // Force exit if hanging
        setTimeout(() => {
            logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
        logError('Unhandled Rejection', err, { fatal: false });
    });

    process.on('uncaughtException', (err) => {
        logError('Uncaught Exception', err, { fatal: true });
        process.exit(1);
    });
}

export default app;
