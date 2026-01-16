import asyncHandler from '../middleware/asyncHandler.js';
import chatbotService from '../services/chatbotService.js';
import logger from '../utils/logger.js';

/**
 * Chatbot Controller - API endpoints for chatbot functionality
 */

/**
 * Process a chatbot message
 * @route POST /api/chatbot/message
 * @access Public (with optional authentication for personalized features)
 */
export const processMessage = asyncHandler(async (req, res) => {
    const { message, phone } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Message is required'
        });
    }

    // Build context from request
    const context = {
        userId: req.user?.id || null,
        phone: phone || null,
        isAuthenticated: !!req.user
    };

    logger.debug('Processing chatbot message', {
        messageLength: message.length,
        isAuthenticated: context.isAuthenticated
    });

    const result = await chatbotService.processMessage(message.trim(), context);

    res.json({
        success: result.success,
        data: {
            intent: result.intent,
            confidence: result.confidence,
            response: result.response
        }
    });
});

/**
 * Search books via chatbot
 * @route GET /api/chatbot/search
 * @access Public
 */
export const searchBooks = asyncHandler(async (req, res) => {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Search query (q) is required'
        });
    }

    const result = await chatbotService.searchBooks(q.trim(), parseInt(limit));

    res.json({
        success: result.success,
        data: {
            query: q,
            count: result.count,
            books: result.books
        }
    });
});

/**
 * Track order via chatbot
 * @route GET /api/chatbot/track/:orderId
 * @access Public (with phone verification for guests)
 */
export const trackOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { phone } = req.query;

    const result = await chatbotService.trackOrder(
        orderId,
        phone || null,
        req.user?.id || null
    );

    if (!result.success) {
        const statusCode = result.error === 'not_found' ? 404
            : result.error === 'unauthorized' ? 401
                : 400;
        return res.status(statusCode).json({
            success: false,
            error: result.error,
            message: result.message
        });
    }

    res.json({
        success: true,
        data: result.order
    });
});

/**
 * Get book recommendations via chatbot
 * @route GET /api/chatbot/recommendations
 * @access Public (personalized if authenticated)
 */
export const getRecommendations = asyncHandler(async (req, res) => {
    const result = await chatbotService.getRecommendations(req.user?.id || null);

    res.json({
        success: result.success,
        data: {
            personalized: result.hasPersonalized || false,
            books: result.books
        }
    });
});

/**
 * Get books by category via chatbot
 * @route GET /api/chatbot/category/:category
 * @access Public
 */
export const getBooksByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { limit = 5 } = req.query;

    const result = await chatbotService.getBooksByCategory(category, parseInt(limit));

    res.json({
        success: result.success,
        data: {
            category: result.category,
            count: result.count,
            books: result.books
        }
    });
});

/**
 * Get intents list (for debugging/testing)
 * @route GET /api/chatbot/intents
 * @access Public
 */
export const getIntents = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: {
            intents: [
                'greeting',
                'search_book',
                'browse_category',
                'track_order',
                'order_history',
                'recommend_books',
                'faq_shipping',
                'faq_payment',
                'faq_returns',
                'faq_contact',
                'faq_categories',
                'faq_language',
                'thanks',
                'goodbye',
                'fallback'
            ],
            examples: {
                greeting: ['hi', 'hello', 'hey'],
                search_book: ['search for novels', 'find books by Fakir Mohan'],
                track_order: ['track my order', 'where is my order 507f1f77bcf86cd799439011'],
                recommend_books: ['recommend books', 'popular books', 'suggest something'],
                faq_shipping: ['shipping info', 'delivery time', 'how long to deliver']
            }
        }
    });
});

export default {
    processMessage,
    searchBooks,
    trackOrder,
    getRecommendations,
    getBooksByCategory,
    getIntents
};
