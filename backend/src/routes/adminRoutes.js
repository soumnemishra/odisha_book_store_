import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUserRole,
    getAllOrders,
    updateOrderStatus,
    getAnalyticsSales,
    getTopProducts,
    getAllBooks,
    getInventorySummary,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Books/Products Management
router.get('/books', getAllBooks);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);

// Order Management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Inventory
router.get('/inventory', getInventorySummary);

// Analytics
router.get('/analytics/sales', getAnalyticsSales);
router.get('/analytics/top-products', getTopProducts);

export default router;
