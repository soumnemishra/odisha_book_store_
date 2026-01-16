import express from 'express';
import {
    processMessage,
    searchBooks,
    trackOrder,
    getRecommendations,
    getBooksByCategory,
    getIntents
} from '../controllers/chatbotController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Chatbot API Routes
 * All routes support optional authentication for personalized features
 */

// Main message processing endpoint
// POST /api/chatbot/message
router.post('/message', optionalAuth, processMessage);

// Book search
// GET /api/chatbot/search?q=query&limit=5
router.get('/search', searchBooks);

// Order tracking (supports both auth and guest with phone)
// GET /api/chatbot/track/:orderId?phone=1234567890
router.get('/track/:orderId', optionalAuth, trackOrder);

// Book recommendations (personalized if logged in)
// GET /api/chatbot/recommendations
router.get('/recommendations', optionalAuth, getRecommendations);

// Books by category
// GET /api/chatbot/category/:category?limit=5
router.get('/category/:category', getBooksByCategory);

// List available intents (for testing/debugging)
// GET /api/chatbot/intents
router.get('/intents', getIntents);

export default router;
