import { body, param } from 'express-validator';

/**
 * Validation rules for creating an order (supports guest checkout)
 * @returns {Array} Array of validation middleware
 */
export const createOrderRules = [
  // Customer details (required for guest checkout)
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),

  body('customerPhone')
    .trim()
    .notEmpty()
    .withMessage('Customer phone is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),

  body('customerAddress')
    .trim()
    .notEmpty()
    .withMessage('Customer address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),

  // Order items validation
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),

  body('items.*.bookId')
    .isMongoId()
    .withMessage('Each order item must have a valid book ID'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each order item must have a quantity of at least 1'),

  // Shipping cost (optional, defaults to 50)
  body('shippingCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost must be a non-negative number'),

  // Optional notes
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];

/**
 * Validation rules for updating order status
 * @returns {Array} Array of validation middleware
 */
export const updateOrderStatusRules = [
  param('id').isMongoId().withMessage('Invalid order ID'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
    .withMessage('Invalid status value'),
];

/**
 * Validation rules for updating order payment
 * @returns {Array} Array of validation middleware
 */
export const updateOrderPaymentRules = [
  param('id').isMongoId().withMessage('Invalid order ID'),

  body('paymentResult').optional().isObject().withMessage('Payment result must be an object'),
];

/**
 * Validation rules for getting order by ID
 * @returns {Array} Array of validation middleware
 */
export const getOrderByIdRules = [param('id').isMongoId().withMessage('Invalid order ID')];
