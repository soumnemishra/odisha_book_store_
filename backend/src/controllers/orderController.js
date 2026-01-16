import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logger from '../utils/logger.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors.js';

/**
 * Create new order with guest support, price validation, and atomic stock updates
 * @route POST /api/orders
 * @access Public (supports both guest and authenticated users)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * 
 * Request body:
 * {
 *   customerName: string (required),
 *   customerPhone: string (required),
 *   customerAddress: string (required),
 *   items: [{ bookId, quantity, price }] (required),
 *   shippingCost: number (optional, default: 50),
 *   notes: string (optional)
 * }
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, customerAddress, items, shippingCost = 50, notes } =
    req.body;

  // Validation: Check for required fields
  if (!customerName || !customerPhone || !customerAddress) {
    throw new BadRequestError('Customer name, phone, and address are required');
  }

  if (!items || items.length === 0) {
    throw new BadRequestError('Order must contain at least one item');
  }

  // Validate all items have required fields
  for (const item of items) {
    if (!item.bookId || !item.quantity) {
      throw new BadRequestError('Each item must have bookId and quantity');
    }
    if (item.quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }
  }

  // Start MongoDB session for atomic transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    logger.info('Order creation started', {
      customerName,
      itemCount: items.length,
      userId: req.user?.id || 'guest',
    });

    // SECURITY CHECK: Validate prices from database, don't trust client
    // Also validate stock and prepare items with validated data
    const validatedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      // Fetch book from database within transaction
      const book = await Book.findById(item.bookId).session(session);

      if (!book) {
        throw new NotFoundError(`Book with ID ${item.bookId} not found`);
      }

      // Check stock availability
      if (book.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for "${book.title?.display || book.titleDisplay}". Available: ${book.stock}, Requested: ${item.quantity}`
        );
      }

      // CRITICAL: Use server-side price, ignore client-sent price
      const validatedPrice = book.finalPrice; // Uses virtual from Book model
      const itemTotal = validatedPrice * item.quantity;
      calculatedTotal += itemTotal;

      // Prepare validated item
      validatedItems.push({
        bookId: book._id,
        quantity: item.quantity,
        price: validatedPrice,
        title: book.title?.display || book.titleDisplay,
      });

      // Atomically update stock within transaction
      book.stock -= item.quantity;
      await book.save({ session });

      logger.debug('Book stock updated', {
        bookId: book._id,
        title: book.title?.display,
        newStock: book.stock,
        quantityOrdered: item.quantity,
      });
    }

    // Calculate total amount (subtotal + shipping)
    const totalAmount = calculatedTotal + shippingCost;

    // Create order within transaction
    const [order] = await Order.create(
      [
        {
          user: req.user?.id || null, // null for guest orders
          customerName,
          customerPhone,
          customerAddress,
          items: validatedItems,
          totalAmount,
          shippingCost,
          notes,
          status: 'Pending',
        },
      ],
      { session }
    );

    // Commit transaction - all changes are applied atomically
    await session.commitTransaction();

    // Populate book details for response (outside transaction)
    await order.populate('items.bookId', 'title author category image');

    logger.info('Order created successfully', {
      orderId: order._id,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully',
    });
  } catch (error) {
    // Abort transaction on any error - all changes are rolled back
    await session.abortTransaction();
    logger.error('Order creation failed', {
      error: error.message,
      customerName,
      stack: error.stack,
    });
    throw error;
  } finally {
    // Always end the session
    session.endSession();
  }
});

/**
 * Get user's orders (authenticated users only)
 * @route GET /api/orders/myorders
 * @access Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  logger.debug('Fetching user orders', { userId: req.user.id });
  const orders = await Order.find({ user: req.user.id })
    .populate('items.bookId', 'title author category image')
    .sort({ createdAt: -1 });

  logger.info('User orders fetched successfully', { userId: req.user.id, count: orders.length });
  res.json({
    success: true,
    data: orders,
  });
});

/**
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private (user can view own orders, admin can view all)
 */
export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.debug('Fetching order', { orderId: id, userId: req.user?.id });

  const order = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.bookId', 'title author category image price');

  if (!order) {
    logger.warn('Order not found', { orderId: id });
    throw new NotFoundError('Order not found');
  }

  // Authorization: user can only view their own orders unless admin
  if (order.user && order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    logger.warn('Unauthorized order access attempt', { orderId: id, userId: req.user.id });
    throw new UnauthorizedError('Not authorized to view this order');
  }

  logger.info('Order fetched successfully', { orderId: id });
  res.json({
    success: true,
    data: order,
  });
});

/**
 * Get all orders (Admin only)
 * @route GET /api/orders
 * @access Private/Admin
 */
export const getOrders = asyncHandler(async (req, res) => {
  logger.debug('Fetching all orders', { adminId: req.user.id });

  const { status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.bookId', 'title author category')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  logger.info('All orders fetched successfully', { count: orders.length, total });
  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Update order status (Admin only)
 * @route PUT /api/orders/:id/status
 * @access Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  logger.info('Updating order status', { orderId: id, newStatus: status, adminId: req.user.id });

  const order = await Order.findById(id);

  if (!order) {
    logger.warn('Order not found for status update', { orderId: id });
    throw new NotFoundError('Order not found');
  }

  order.status = status;

  // Auto-update delivery status when marked as delivered
  if (status === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();

  logger.info('Order status updated successfully', { orderId: id, newStatus: status });
  res.json({
    success: true,
    data: updatedOrder,
    message: `Order status updated to ${status}`,
  });
});

/**
 * Update order to paid status
 * @route PUT /api/orders/:id/pay
 * @access Private
 */
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info('Updating order to paid', { orderId: id, userId: req.user.id });

  const order = await Order.findById(id);

  if (!order) {
    logger.warn('Order not found for payment update', { orderId: id });
    throw new NotFoundError('Order not found');
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  // Update status to Confirmed if still Pending
  if (order.status === 'Pending') {
    order.status = 'Confirmed';
  }

  const updatedOrder = await order.save();

  logger.info('Order updated to paid successfully', { orderId: id });
  res.json({
    success: true,
    data: updatedOrder,
    message: 'Payment confirmed',
  });
});

/**
 * Update order to delivered status (Admin only)
 * @route PUT /api/orders/:id/deliver
 * @access Private/Admin
 */
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info('Updating order to delivered', { orderId: id, adminId: req.user.id });

  const order = await Order.findById(id);

  if (!order) {
    logger.warn('Order not found for delivery update', { orderId: id });
    throw new NotFoundError('Order not found');
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = 'Delivered';

  const updatedOrder = await order.save();

  logger.info('Order updated to delivered successfully', { orderId: id });
  res.json({
    success: true,
    data: updatedOrder,
    message: 'Order marked as delivered',
  });
});
