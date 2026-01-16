import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validation.js';
import { registerRules, loginRules } from '../validators/authValidator.js';
import { registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', registerLimiter, registerRules, validate, registerUser);
router.post('/login', loginRules, validate, loginUser);

// Private routes (protected by authMiddleware)
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.get('/profile', protect, getUserProfile);

export default router;
