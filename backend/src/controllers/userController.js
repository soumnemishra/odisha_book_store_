import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logger from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Get all users (Admin only)
 * @route GET /api/users
 * @access Private/Admin
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getUsers = asyncHandler(async (req, res) => {
  logger.debug('Fetching all users', { adminId: req.user.id });
  const users = await User.find().select('-password');

  logger.info('All users fetched successfully', { count: users.length });
  res.json({
    success: true,
    data: users,
  });
});

/**
 * Get single user by ID
 * @route GET /api/users/:id
 * @access Private
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.debug('Fetching user', { userId: id });

  const user = await User.findById(id).select('-password');

  if (!user) {
    logger.warn('User not found', { userId: id });
    throw new NotFoundError('User not found');
  }

  logger.info('User fetched successfully', { userId: id });
  res.json({
    success: true,
    data: user,
  });
});

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info('Updating user', { userId: id, updaterId: req.user.id });

  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    logger.warn('User not found for update', { userId: id });
    throw new NotFoundError('User not found');
  }

  logger.info('User updated successfully', { userId: id });
  res.json({
    success: true,
    data: user,
  });
});

/**
 * Delete user (Admin only)
 * @route DELETE /api/users/:id
 * @access Private/Admin
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info('Deleting user', { userId: id, adminId: req.user.id });

  const user = await User.findById(id);

  if (!user) {
    logger.warn('User not found for deletion', { userId: id });
    throw new NotFoundError('User not found');
  }

  await user.deleteOne();

  logger.info('User deleted successfully', { userId: id });
  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});
