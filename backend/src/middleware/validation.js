import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Middleware to check validation results from express-validator
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      url: req.originalUrl,
      method: req.method,
      errors: errors.array(),
    });

    const firstError = errors.array()[0].msg;
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: errors.array(),
    });
  }

  next();
};

export default validate;
