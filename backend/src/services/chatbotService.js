import Book from '../models/Book.js';
import Order from '../models/Order.js';
import logger from '../utils/logger.js';

/**
 * Chatbot Service - Intent detection and response generation
 * Handles book search, order tracking, FAQs, and LLM integration
 */

// Intent patterns for classification
const INTENT_PATTERNS = {
    greeting: {
        patterns: [/^(hi|hello|hey|hii+|good\s*(morning|afternoon|evening))/i],
        priority: 10
    },
    search_book: {
        patterns: [
            /(?:search|find|looking for|show me|get|want)\s+(?:books?|titles?)\s+(?:about|on|by|called|named)?\s*(.+)/i,
            /(?:books?|novels?)\s+(?:about|on|by)\s+(.+)/i,
            /(?:do you have|any)\s+(.+)\s+books?/i,
            /search\s+(.+)/i
        ],
        priority: 8
    },
    browse_category: {
        patterns: [
            /(?:show|browse|list|see)\s+(?:all\s+)?(\w+)\s+books?/i,
            /(?:odia|english|hindi|educational|novel|poetry|biography|children|history|travel)\s*books?/i,
            /books?\s+(?:in|for)\s+(\w+)/i
        ],
        priority: 7
    },
    track_order: {
        patterns: [
            /(?:track|where is|status of|check)\s+(?:my\s+)?order\s*#?\s*(\w+)?/i,
            /order\s+(?:status|tracking)\s*#?\s*(\w+)?/i,
            /(?:my\s+)?order\s*#?\s*([a-f0-9]{24})/i
        ],
        priority: 9
    },
    order_history: {
        patterns: [
            /(?:my|show|list)\s+orders?/i,
            /order\s+history/i,
            /past\s+orders?/i
        ],
        priority: 8
    },
    recommend_books: {
        patterns: [
            /(?:recommend|suggest|popular|best|top)\s+(?:me\s+)?(?:some\s+)?books?/i,
            /what\s+(?:should|can)\s+I\s+read/i,
            /any\s+(?:good|nice)\s+books?/i,
            /suggest\s+(?:me\s+)?(?:some\s+)?(?:good\s+)?books?/i,
            /give\s+me\s+(?:book\s+)?(?:recommendations?|suggestions?)/i,
            /(?:book\s+)?recommendations?/i
        ],
        priority: 7
    },
    faq_shipping: {
        patterns: [
            /(?:shipping|delivery|ship|deliver|courier|how long|days)/i,
            /(?:when|how)\s+(?:will|does)\s+(?:it|order)\s+(?:arrive|come|deliver)/i
        ],
        priority: 5
    },
    faq_payment: {
        patterns: [
            /(?:payment|pay|cod|cash|upi|card|debit|credit|net banking)/i,
            /(?:how|can)\s+(?:to|I)\s+pay/i
        ],
        priority: 5
    },
    faq_returns: {
        patterns: [
            /(?:return|refund|exchange|money back|cancel)/i
        ],
        priority: 5
    },
    faq_contact: {
        patterns: [
            /(?:contact|phone|email|call|reach|support|help|customer care)/i
        ],
        priority: 5
    },
    faq_categories: {
        patterns: [
            /(?:categories|genres?|types?\s+of\s+books|what\s+kind)/i
        ],
        priority: 9
    },
    faq_language: {
        patterns: [
            /(?:language|odia|oriya|english|hindi)\s+(?:books?|available)/i,
            /(?:books?\s+in)\s+(?:odia|oriya|english|hindi)/i
        ],
        priority: 5
    },
    thanks: {
        patterns: [/(?:thank|thanks|thx|tysm)/i],
        priority: 3
    },
    goodbye: {
        patterns: [/(?:bye|goodbye|see you|take care)/i],
        priority: 3
    }
};

// FAQ Responses
const FAQ_RESPONSES = {
    faq_shipping: {
        text: '🚚 **Shipping & Delivery**\n\n• Free shipping on orders over ₹500\n• Standard delivery: 3-5 business days\n• Express delivery (₹99): 1-2 days\n• We deliver across India!',
        quickActions: ['Track Order', 'Contact Support']
    },
    faq_payment: {
        text: '💳 **Payment Options**\n\n• All major Credit/Debit cards\n• UPI (Google Pay, PhonePe, Paytm)\n• Net Banking\n• Cash on Delivery (COD)\n\nAll transactions are 100% secure!',
        quickActions: ['Browse Books', 'Help']
    },
    faq_returns: {
        text: '↩️ **Returns & Refunds**\n\n• 7-day return policy\n• Books must be in original condition\n• Refunds processed in 5-7 business days\n• Contact us for return pickup',
        quickActions: ['Contact Support', 'Track Order']
    },
    faq_contact: {
        text: '📞 **Contact Us**\n\n• Email: **support@odishabookstore.com**\n• Phone: **+91 9876543210**\n• Hours: Mon-Sat, 9 AM - 6 PM\n\nWe typically respond within 24 hours!',
        quickActions: ['FAQ', 'Browse Books']
    },
    faq_categories: {
        text: '📚 **Available Categories**\n\n• Educational & Academic\n• Novels & Fiction\n• Poetry\n• Biography & Memoir\n• History\n• Travel\n• Children\'s Books\n• Religious & Spiritual',
        quickActions: ['Browse Educational', 'Browse Novels']
    },
    faq_language: {
        text: '🌐 **Available Languages**\n\n• **Odia (ଓଡ଼ିଆ)** - Our specialty!\n• English\n• Hindi\n\nMost of our collection features authentic Odia literature.',
        quickActions: ['Odia Books', 'English Books']
    }
};

/**
 * Detect intent from user message
 * @param {string} message - User's message
 * @returns {object} - { intent, confidence, entities }
 */
export const detectIntent = (message) => {
    const normalizedMsg = message.toLowerCase().trim();
    let bestMatch = { intent: 'fallback', confidence: 0, entities: {} };

    for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
        for (const pattern of config.patterns) {
            const match = normalizedMsg.match(pattern);
            if (match) {
                const confidence = config.priority / 10;
                if (confidence > bestMatch.confidence) {
                    bestMatch = {
                        intent,
                        confidence,
                        entities: {
                            query: match[1] || null,
                            fullMessage: message
                        }
                    };
                }
            }
        }
    }

    logger.debug('Intent detected', { message, intent: bestMatch.intent, confidence: bestMatch.confidence });
    return bestMatch;
};

/**
 * Search books by query
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<object>} - Search results
 */
export const searchBooks = async (query, limit = 5) => {
    try {
        const searchRegex = new RegExp(query, 'i');

        const books = await Book.find({
            $or: [
                { 'title.english': searchRegex },
                { 'title.odia': searchRegex },
                { 'title.display': searchRegex },
                { author: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ]
        })
            .select('title author price category coverImage stock rating')
            .limit(limit)
            .lean();

        return {
            success: true,
            count: books.length,
            books: books.map(book => ({
                id: book._id,
                title: book.title?.display || book.title?.english || 'Untitled',
                author: book.author,
                price: book.price?.discounted || book.price?.original,
                originalPrice: book.price?.original,
                category: book.category,
                coverImage: book.coverImage,
                inStock: book.stock > 0,
                rating: book.rating
            }))
        };
    } catch (error) {
        logger.error('Book search failed', { query, error: error.message });
        return { success: false, count: 0, books: [], error: error.message };
    }
};

/**
 * Get books by category
 * @param {string} category - Category name
 * @param {number} limit - Max results
 */
export const getBooksByCategory = async (category, limit = 5) => {
    try {
        const categoryMap = {
            'novel': 'Novels',
            'novels': 'Novels',
            'educational': 'Educational',
            'poetry': 'Poetry',
            'biography': 'Biography',
            'history': 'History',
            'travel': 'Travel',
            'children': "Children's",
            'kids': "Children's"
        };

        const normalizedCategory = categoryMap[category.toLowerCase()] || category;

        const books = await Book.find({
            category: new RegExp(normalizedCategory, 'i')
        })
            .select('title author price category coverImage stock')
            .limit(limit)
            .lean();

        return {
            success: true,
            category: normalizedCategory,
            count: books.length,
            books: books.map(book => ({
                id: book._id,
                title: book.title?.display || book.title?.english,
                author: book.author,
                price: book.price?.discounted || book.price?.original,
                inStock: book.stock > 0
            }))
        };
    } catch (error) {
        logger.error('Category fetch failed', { category, error: error.message });
        return { success: false, category, count: 0, books: [] };
    }
};

/**
 * Track order by ID (with optional phone verification for guests)
 * @param {string} orderId - Order ID
 * @param {string} phone - Phone number for guest verification
 * @param {string} userId - User ID if authenticated
 */
export const trackOrder = async (orderId, phone = null, userId = null) => {
    try {
        if (!orderId || orderId.length !== 24) {
            return {
                success: false,
                error: 'invalid_id',
                message: 'Please provide a valid 24-character order ID. You can find it in your order confirmation email.'
            };
        }

        const order = await Order.findById(orderId)
            .populate('items.bookId', 'title')
            .lean();

        if (!order) {
            return {
                success: false,
                error: 'not_found',
                message: 'Order not found. Please check your order ID and try again.'
            };
        }

        // Verify access: either authenticated user owns it OR guest provides matching phone
        const isOwner = userId && order.user?.toString() === userId;
        const isGuestWithPhone = phone && order.customerPhone === phone;

        if (!isOwner && !isGuestWithPhone && order.user) {
            return {
                success: false,
                error: 'unauthorized',
                message: 'To track this order, please log in or provide your phone number.'
            };
        }

        const statusEmoji = {
            'Pending': '⏳',
            'Confirmed': '✅',
            'Processing': '📦',
            'Shipped': '🚚',
            'Delivered': '🎉',
            'Cancelled': '❌'
        };

        return {
            success: true,
            order: {
                id: order._id,
                status: order.status,
                statusEmoji: statusEmoji[order.status] || '📋',
                customerName: order.customerName,
                totalAmount: order.totalAmount,
                itemCount: order.items.length,
                items: order.items.map(item => ({
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price
                })),
                createdAt: order.createdAt,
                isPaid: order.isPaid,
                isDelivered: order.isDelivered,
                deliveredAt: order.deliveredAt
            }
        };
    } catch (error) {
        logger.error('Order tracking failed', { orderId, error: error.message });
        return {
            success: false,
            error: 'system_error',
            message: 'Unable to track order. Please try again later.'
        };
    }
};

/**
 * Get user's order history
 * @param {string} userId - Authenticated user ID
 */
export const getOrderHistory = async (userId) => {
    try {
        if (!userId) {
            return {
                success: false,
                requiresAuth: true,
                message: 'Please log in to view your order history.'
            };
        }

        const orders = await Order.find({ user: userId })
            .select('status totalAmount items createdAt')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return {
            success: true,
            count: orders.length,
            orders: orders.map(order => ({
                id: order._id,
                status: order.status,
                total: order.totalAmount,
                itemCount: order.items.length,
                date: order.createdAt
            }))
        };
    } catch (error) {
        logger.error('Order history fetch failed', { userId, error: error.message });
        return { success: false, count: 0, orders: [] };
    }
};

/**
 * Get book recommendations (popular + optionally personalized)
 * @param {string} userId - Optional user ID for personalized recommendations
 */
export const getRecommendations = async (userId = null) => {
    try {
        // Get popular books (highest rated, most recent)
        const popularBooks = await Book.find({ stock: { $gt: 0 } })
            .sort({ rating: -1, createdAt: -1 })
            .select('title author price category coverImage rating')
            .limit(5)
            .lean();

        let personalizedBooks = [];

        // If user is logged in, get recommendations based on their order history
        if (userId) {
            const userOrders = await Order.find({ user: userId })
                .select('items')
                .lean();

            if (userOrders.length > 0) {
                // Get categories from user's past purchases
                const purchasedBookIds = userOrders.flatMap(o => o.items.map(i => i.bookId));
                const purchasedBooks = await Book.find({ _id: { $in: purchasedBookIds } })
                    .select('category')
                    .lean();

                const userCategories = [...new Set(purchasedBooks.map(b => b.category))];

                if (userCategories.length > 0) {
                    personalizedBooks = await Book.find({
                        category: { $in: userCategories },
                        _id: { $nin: purchasedBookIds },
                        stock: { $gt: 0 }
                    })
                        .sort({ rating: -1 })
                        .select('title author price category coverImage rating')
                        .limit(3)
                        .lean();
                }
            }
        }

        const allBooks = [...personalizedBooks, ...popularBooks]
            .filter((book, idx, self) =>
                idx === self.findIndex(b => b._id.toString() === book._id.toString())
            )
            .slice(0, 5);

        return {
            success: true,
            hasPersonalized: personalizedBooks.length > 0,
            books: allBooks.map(book => ({
                id: book._id,
                title: book.title?.display || book.title?.english,
                author: book.author,
                price: book.price?.discounted || book.price?.original,
                category: book.category,
                rating: book.rating
            }))
        };
    } catch (error) {
        logger.error('Recommendations fetch failed', { error: error.message });
        return { success: false, books: [] };
    }
};

/**
 * Generate chatbot response based on intent
 * @param {object} intentResult - Result from detectIntent
 * @param {object} context - User context (userId, etc.)
 */
export const generateResponse = async (intentResult, context = {}) => {
    const { intent, entities } = intentResult;
    const { userId, phone } = context;

    try {
        switch (intent) {
            case 'greeting':
                return {
                    type: 'text',
                    text: "👋 Hi! I'm your Book Store Assistant. Ask me about books, orders, or support!",
                    quickActions: ['Search Books', 'Track Order', 'Recommendations', 'Help']
                };

            case 'search_book': {
                // Clean up the query by removing common filler words
                let query = entities.query || entities.fullMessage;
                query = query
                    .replace(/^(search|find|looking for|show me|get|want|i want to|can you)\s*/i, '')
                    .replace(/\s*(books?|titles?)\s*/gi, ' ')
                    .replace(/\s*(about|on|by|called|named|for)\s*/gi, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                // If query is empty after cleanup, try category-based search
                if (!query || query.length < 2) {
                    return {
                        type: 'text',
                        text: '🔍 What would you like to search for? You can search by:\n\n• Book title\n• Author name\n• Genre (novels, poetry, etc.)\n• Topic',
                        quickActions: ['Browse Novels', 'Browse Educational', 'Recommendations']
                    };
                }

                const results = await searchBooks(query);

                if (results.success && results.count > 0) {
                    return {
                        type: 'book_list',
                        text: `📚 Found ${results.count} book(s) for "${query}":`,
                        books: results.books,
                        quickActions: ['Search Again', 'Browse Categories']
                    };
                } else {
                    return {
                        type: 'text',
                        text: `😕 No books found for "${query}". Try a different search term or browse our categories.`,
                        quickActions: ['Browse Categories', 'Recommendations']
                    };
                }
            }

            case 'browse_category': {
                const category = entities.query || entities.fullMessage.match(/(\w+)\s*books?/i)?.[1] || 'novels';
                const results = await getBooksByCategory(category);

                if (results.success && results.count > 0) {
                    return {
                        type: 'book_list',
                        text: `📖 ${results.category} Books (${results.count}):`,
                        books: results.books,
                        quickActions: ['More Categories', 'Search Books']
                    };
                } else {
                    return {
                        type: 'text',
                        text: `No books found in ${category} category right now. Check out our other categories!`,
                        quickActions: ['Browse Categories', 'Recommendations']
                    };
                }
            }

            case 'track_order': {
                const orderId = entities.query || entities.fullMessage.match(/([a-f0-9]{24})/i)?.[1];

                if (!orderId) {
                    return {
                        type: 'input_required',
                        text: '📦 To track your order, please provide your **Order ID** (24 characters).\n\nYou can find it in your order confirmation email.',
                        inputType: 'order_id',
                        quickActions: ['My Orders', 'Help']
                    };
                }

                const result = await trackOrder(orderId, phone, userId);

                if (result.success) {
                    const o = result.order;
                    return {
                        type: 'order_status',
                        text: `${o.statusEmoji} **Order Status: ${o.status}**\n\n• Order ID: \`${o.id}\`\n• Items: ${o.itemCount}\n• Total: ₹${o.totalAmount}\n• Placed: ${new Date(o.createdAt).toLocaleDateString()}`,
                        order: o,
                        quickActions: ['Track Another', 'Contact Support']
                    };
                } else {
                    return {
                        type: 'error',
                        text: `❌ ${result.message}`,
                        quickActions: ['Try Again', 'Contact Support']
                    };
                }
            }

            case 'order_history': {
                const result = await getOrderHistory(userId);

                if (result.requiresAuth) {
                    return {
                        type: 'auth_required',
                        text: '🔐 Please log in to view your order history.',
                        quickActions: ['Login', 'Track by Order ID']
                    };
                }

                if (result.success && result.count > 0) {
                    return {
                        type: 'order_list',
                        text: `📋 Your Recent Orders (${result.count}):`,
                        orders: result.orders,
                        quickActions: ['Track Order', 'Browse Books']
                    };
                } else {
                    return {
                        type: 'text',
                        text: "You haven't placed any orders yet. Start browsing our collection!",
                        quickActions: ['Browse Books', 'Recommendations']
                    };
                }
            }

            case 'recommend_books': {
                const results = await getRecommendations(userId);

                if (results.success && results.books.length > 0) {
                    const intro = results.hasPersonalized
                        ? '✨ Based on your reading history:'
                        : '🌟 Popular books you might like:';

                    return {
                        type: 'book_list',
                        text: intro,
                        books: results.books,
                        quickActions: ['More Recommendations', 'Browse Categories']
                    };
                } else {
                    return {
                        type: 'text',
                        text: 'Check out our latest arrivals and bestsellers!',
                        quickActions: ['Browse Books', 'Categories']
                    };
                }
            }

            case 'faq_shipping':
            case 'faq_payment':
            case 'faq_returns':
            case 'faq_contact':
            case 'faq_categories':
            case 'faq_language':
                return {
                    type: 'faq',
                    ...FAQ_RESPONSES[intent]
                };

            case 'thanks':
                return {
                    type: 'text',
                    text: "You're welcome! 😊 Is there anything else I can help you with?",
                    quickActions: ['Browse Books', 'Track Order', 'Help']
                };

            case 'goodbye':
                return {
                    type: 'text',
                    text: 'Goodbye! Happy reading! 📚✨ Come back anytime.',
                    quickActions: ['Browse Books']
                };

            default:
                return {
                    type: 'fallback',
                    text: "I'm not sure I understood that. Here's what I can help with:\n\n• 📚 **Search Books** - Find books by title, author, or topic\n• 📦 **Track Order** - Check your order status\n• 🌟 **Recommendations** - Get personalized suggestions\n• ❓ **FAQs** - Shipping, payment, returns info",
                    quickActions: ['Search Books', 'Track Order', 'Recommendations', 'Help']
                };
        }
    } catch (error) {
        logger.error('Response generation failed', { intent, error: error.message });
        return {
            type: 'error',
            text: 'Oops! Something went wrong. Please try again or contact support.',
            quickActions: ['Try Again', 'Contact Support']
        };
    }
};

/**
 * Main chatbot message handler
 * @param {string} message - User message
 * @param {object} context - User context
 */
export const processMessage = async (message, context = {}) => {
    const startTime = Date.now();

    try {
        const intentResult = detectIntent(message);
        const response = await generateResponse(intentResult, context);

        const duration = Date.now() - startTime;
        logger.info('Chatbot message processed', {
            message: message.substring(0, 50),
            intent: intentResult.intent,
            confidence: intentResult.confidence,
            responseType: response.type,
            durationMs: duration
        });

        return {
            success: true,
            intent: intentResult.intent,
            confidence: intentResult.confidence,
            response
        };
    } catch (error) {
        logger.error('Chatbot processing failed', { message, error: error.message });
        return {
            success: false,
            intent: 'error',
            confidence: 0,
            response: {
                type: 'error',
                text: 'Sorry, I encountered an error. Please try again.',
                quickActions: ['Help', 'Contact Support']
            }
        };
    }
};

export default {
    detectIntent,
    processMessage,
    searchBooks,
    trackOrder,
    getOrderHistory,
    getRecommendations,
    getBooksByCategory
};
