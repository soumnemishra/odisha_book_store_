import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating a book
 * @returns {Array} Array of validation middleware
 */
export const createBookRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),

  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),

  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('isbn')
    .optional()
    .trim()
    .matches(/^(?:\d{10}|\d{13})$/)
    .withMessage('ISBN must be 10 or 13 digits'),

  body('image').optional().trim().isURL().withMessage('Image must be a valid URL'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
];

/**
 * Validation rules for updating a book
 * @returns {Array} Array of validation middleware
 */
export const updateBookRules = [
  param('id').isMongoId().withMessage('Invalid book ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),

  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),

  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('isbn')
    .optional()
    .trim()
    .matches(/^(?:\d{10}|\d{13})$/)
    .withMessage('ISBN must be 10 or 13 digits'),

  body('image').optional().trim().isURL().withMessage('Image must be a valid URL'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
];

/**
 * Validation rules for query parameters when getting books
 * @returns {Array} Array of validation middleware
 */
export const getBooksQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be less than 100 characters')
    .escape(),

  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters')
    .escape(),

  query('sortBy')
    .optional()
    .isIn(['title', 'author', 'price', 'createdAt', 'rating'])
    .withMessage('sortBy must be one of: title, author, price, createdAt, rating'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either "asc" or "desc"'),
];

/**
 * Validation rules for getting a single book by ID
 * @returns {Array} Array of validation middleware
 */
export const getBookByIdRules = [param('id').isMongoId().withMessage('Invalid book ID')];
