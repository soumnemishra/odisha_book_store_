// API Configuration for Odisha Book Store Backend
import { Platform } from 'react-native';

// 🚀 PRODUCTION BACKEND URL
// Replace this with your Railway URL after deployment
// Example: 'https://odisha-bookstore.up.railway.app/api'
const PRODUCTION_URL = 'YOUR_RAILWAY_URL_HERE/api';

// 🛠️ LOCAL DEVELOPMENT URL
const LOCAL_URL = Platform.OS !== 'web'
    ? 'http://192.168.22.228:5000/api'  // Mobile device
    : 'http://localhost:5000/api';      // Web browser

/**
 * Toggle between production and local backend
 * 
 * SET TO true WHEN:
 * - Publishing to Expo for client testing
 * - Testing production deployment
 * 
 * SET TO false WHEN:
 * - Developing locally
 * - Testing with local backend
 */
const USE_PRODUCTION = false;  // ← TOGGLE THIS

const getApiUrl = () => {
    if (USE_PRODUCTION) {
        if (PRODUCTION_URL === 'YOUR_RAILWAY_URL_HERE/api') {
            console.error('⚠️  PRODUCTION_URL not configured! Update api.js with your Railway URL');
        }
        return PRODUCTION_URL;
    }
    return LOCAL_URL;
};

const API_URL = getApiUrl();

console.log('📡 API Configuration:', {
    mode: USE_PRODUCTION ? 'PRODUCTION' : 'LOCAL',
    url: API_URL,
    platform: Platform.OS
});

export { API_URL };
export default { API_URL };
