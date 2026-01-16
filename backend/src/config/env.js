import 'dotenv/config';

/**
 * Required environment variables
 * @type {Array<string>}
 */
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];

/**
 * Validate that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
const validateEnvVars = () => {
  const missing = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file.'
    );
  }
};

// Validate on import
validateEnvVars();

/**
 * Application configuration from environment variables
 * @type {Object}
 */
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

/**
 * Validate configuration values
 * @throws {Error} If configuration is invalid
 */
export const validateConfig = () => {
  if (config.PORT < 1 || config.PORT > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }

  if (!config.MONGODB_URI || !config.MONGODB_URI.startsWith('mongodb')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string');
  }

  if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
};

// Validate configuration
validateConfig();
