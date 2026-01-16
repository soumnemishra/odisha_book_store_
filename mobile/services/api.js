// services/api.js - Production-grade API service layer
import axios from 'axios';
import { Platform } from 'react-native';

// Base URL configuration for different platforms
// Android Emulator: 10.0.2.2 (maps to localhost on host machine)
// iOS Simulator: localhost works directly
// Physical device: Use your computer's IP address (192.168.22.228)
const getBaseURL = () => {
    if (__DEV__) {
        // Development mode
        // For physical device, use your computer's local network IP
        return 'http://192.168.22.228:5000/api'; // Works for both Android & iOS physical devices

        // Uncomment below if using emulator/simulator:
        // if (Platform.OS === 'android') {
        //     return 'http://10.0.2.2:5000/api'; // Android Emulator
        // }
        // return 'http://localhost:5000/api'; // iOS Simulator
    }
    // Production mode - replace with your production API URL
    return 'https://your-production-api.com/api';
};

// Log configuration for debugging
console.log('📡 API Configuration:', {
    mode: __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION',
    platform: Platform.OS,
    baseURL: getBaseURL(),
});

// Create axios instance with default configuration
const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token if available
api.interceptors.request.use(
    (config) => {
        // TODO: Add authentication token from AsyncStorage/SecureStore
        // const token = await SecureStore.getItemAsync('userToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response.data, // Unwrap data automatically
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - token expired or invalid
                    console.error('401 Unauthorized - redirecting to login');
                    // TODO: Navigate to login screen
                    // navigationRef.navigate('Login');
                    break;
                case 403:
                    console.error('403 Forbidden - insufficient permissions');
                    break;
                case 404:
                    console.error('404 Not Found:', data.message);
                    break;
                case 500:
                    console.error('500 Server Error:', data.message);
                    break;
                default:
                    console.error(`Error ${status}:`, data.message);
            }

            return Promise.reject(data);
        } else if (error.request) {
            // Request made but no response received
            console.error('Network error - no response from server');
            return Promise.reject({
                success: false,
                message: 'Network error. Please check your internet connection.',
            });
        } else {
            // Something else happened
            console.error('Request error:', error.message);
            return Promise.reject({
                success: false,
                message: error.message,
            });
        }
    }
);

/**
 * Clean undefined/null values from params object
 * Only sends defined query parameters to server
 */
const cleanParams = (params) => {
    const cleaned = {};
    Object.keys(params || {}).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            cleaned[key] = params[key];
        }
    });
    return cleaned;
};

// ============================================================================
// BOOK API FUNCTIONS
// ============================================================================

/**
 * Get paginated list of books with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.language - Filter by language ('Odia', 'English', 'Hindi')
 * @param {string} params.category - Filter by category
 * @param {string} params.grade - Filter by academic grade
 * @param {string} params.search - Search query
 * @param {number} params.minPrice - Minimum price
 * @param {number} params.maxPrice - Maximum price
 * @param {string} params.sortBy - Sort field (title, price, createdAt, rating)
 * @param {string} params.sortOrder - Sort order (asc, desc)
 * @returns {Promise} Response with books array and pagination info
 */
export const getBooks = async (params = {}) => {
    try {
        const cleanedParams = cleanParams(params);
        const response = await api.get('/books', { params: cleanedParams });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get single book by ID
 * @param {string} id - Book ID
 * @returns {Promise} Response with book data
 */
export const getOneBook = async (id) => {
    try {
        const response = await api.get(`/books/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get available filter options (languages and categories)
 * @returns {Promise} Object with languages and categories arrays
 */
export const getFilters = async () => {
    try {
        const [languagesRes, categoriesRes] = await Promise.all([
            api.get('/books/languages'),
            api.get('/books/categories'),
        ]);

        return {
            languages: languagesRes.data || [],
            categories: categoriesRes.data || [],
        };
    } catch (error) {
        console.error('Error fetching filters:', error);
        throw error;
    }
};

/**
 * Get available academic grades
 * @returns {Promise} Response with grades array
 */
export const getGrades = async () => {
    try {
        const response = await api.get('/books/grades');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Search books (convenience wrapper around getBooks)
 * @param {string} query - Search query
 * @param {Object} additionalParams - Additional filter params
 * @returns {Promise} Response with search results
 */
export const searchBooks = async (query, additionalParams = {}) => {
    return getBooks({ search: query, ...additionalParams });
};

// ============================================================================
// ORDER API FUNCTIONS
// ============================================================================

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @param {string} orderData.customerName - Customer name
 * @param {string} orderData.customerPhone - Customer phone (10 digits)
 * @param {string} orderData.customerAddress - Customer address
 * @param {Array} orderData.items - Array of { bookId, quantity }
 * @param {number} orderData.shippingCost - Shipping cost (optional, default: 50)
 * @param {string} orderData.notes - Optional notes
 * @returns {Promise} Response with order data
 */
export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders', orderData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get user's orders (requires authentication)
 * @returns {Promise} Response with orders array
 */
export const getMyOrders = async () => {
    try {
        const response = await api.get('/orders/myorders');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get order by ID (requires authentication)
 * @param {string} orderId - Order ID
 * @returns {Promise} Response with order data
 */
export const getOrderById = async (orderId) => {
    try {
        const response = await api.get(`/orders/${orderId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

// ============================================================================
// AUTH API FUNCTIONS (for future use)
// ============================================================================

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} Response with user data and token
 */
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        // TODO: Store token in SecureStore
        // await SecureStore.setItemAsync('userToken', response.token);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Register new user
 * @param {Object} userData - Registration data
 * @returns {Promise} Response with user data
 */
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout user
 */
export const logout = async () => {
    try {
        // TODO: Clear token from SecureStore
        // await SecureStore.deleteItemAsync('userToken');
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Export api instance for custom requests
export default api;
