import apiClient from './apiClient';

/**
 * Chatbot Service - Frontend API communication for chatbot
 */

/**
 * Send a message to the chatbot and get response
 * @param {string} message - User's message
 * @param {string} phone - Optional phone for guest order tracking
 * @returns {Promise<object>} - Chatbot response
 */
export const sendMessage = async (message, phone = null) => {
    try {
        const response = await apiClient.post('/chatbot/message', {
            message,
            phone
        });
        return response.data;
    } catch (error) {
        console.error('Chatbot message error:', error);
        return {
            success: false,
            data: {
                intent: 'error',
                confidence: 0,
                response: {
                    type: 'error',
                    text: 'Unable to connect to the assistant. Please try again.',
                    quickActions: ['Try Again', 'Contact Support']
                }
            }
        };
    }
};

/**
 * Search books via chatbot API
 * @param {string} query - Search query
 * @param {number} limit - Max results
 */
export const searchBooks = async (query, limit = 5) => {
    try {
        const response = await apiClient.get('/chatbot/search', {
            params: { q: query, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Chatbot search error:', error);
        return { success: false, data: { books: [] } };
    }
};

/**
 * Track order via chatbot API
 * @param {string} orderId - Order ID
 * @param {string} phone - Phone for guest verification
 */
export const trackOrder = async (orderId, phone = null) => {
    try {
        const response = await apiClient.get(`/chatbot/track/${orderId}`, {
            params: phone ? { phone } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Chatbot track order error:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Unable to track order'
        };
    }
};

/**
 * Get book recommendations
 */
export const getRecommendations = async () => {
    try {
        const response = await apiClient.get('/chatbot/recommendations');
        return response.data;
    } catch (error) {
        console.error('Chatbot recommendations error:', error);
        return { success: false, data: { books: [] } };
    }
};

/**
 * Get books by category
 * @param {string} category - Category name
 * @param {number} limit - Max results
 */
export const getBooksByCategory = async (category, limit = 5) => {
    try {
        const response = await apiClient.get(`/chatbot/category/${category}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Chatbot category error:', error);
        return { success: false, data: { books: [] } };
    }
};

export default {
    sendMessage,
    searchBooks,
    trackOrder,
    getRecommendations,
    getBooksByCategory
};
