import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import validate from '../middleware/validation.js';
import {
  createOrderRules,
  getOrderByIdRules,
  updateOrderPaymentRules,
  updateOrderStatusRules,
} from '../validators/orderValidator.js';

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order (supports guest checkout)
 * @access  Public
 * 
 * @route   GET /api/orders
 * @desc    Get all orders (admin only)
 * @access  Private/Admin
 */
router
  .route('/')
  .post(createOrderRules, validate, createOrder) // Public - no auth required
  .get(protect, admin, getOrders); // Admin only

/**
 * @route   GET /api/orders/myorders
 * @desc    Get logged-in user's orders
 * @access  Private
 */
router.route('/myorders').get(protect, getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private (user can view own orders, admin can view all)
 */
router.route('/:id').get(protect, getOrderByIdRules, validate, getOrder);

/**
 * @route   PUT /api/orders/:id/pay
 * @desc    Update order to paid
 * @access  Private
 */
router.route('/:id/pay').put(protect, updateOrderPaymentRules, validate, updateOrderToPaid);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
router
  .route('/:id/status')
  .put(protect, admin, updateOrderStatusRules, validate, updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/deliver
 * @desc    Update order to delivered
 * @access  Private/Admin
 */
router
  .route('/:id/deliver')
  .put(protect, admin, getOrderByIdRules, validate, updateOrderToDelivered);

export default router;
