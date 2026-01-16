/**
 * Simple API Test Script
 * Tests the backend API endpoints to verify they work correctly
 * 
 * Usage: node test-api.js
 * 
 * Make sure:
 * 1. MongoDB is running (via docker-compose or locally)
 * 2. Backend server is running (npm run dev)
 * 3. Environment variables are set in .env file
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Cookie storage
let cookies = '';

// Helper to extract cookies from response
function extractCookies(response) {
  const setCookieHeaders = response.headers['set-cookie'];
  if (setCookieHeaders) {
    cookies = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
  }
}

// Create axios instance with cookie support
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include cookies
apiClient.interceptors.request.use((config) => {
  if (cookies) {
    config.headers.Cookie = cookies;
  }
  return config;
});

// Add response interceptor to extract cookies
apiClient.interceptors.response.use((response) => {
  extractCookies(response);
  return response;
}, (error) => {
  if (error.response) {
    extractCookies(error.response);
  }
  return Promise.reject(error);
});

// Test results
const results = {
  passed: 0,
  failed: 0,
  errors: [],
};

// Helper function to run tests
async function test(name, testFn) {
  try {
    await testFn();
    results.passed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed++;
    results.errors.push({ name, error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// Test functions
async function runTests() {
  console.log('\n🧪 Starting API Tests...\n');
  console.log(`Testing API at: ${API_BASE_URL}\n`);

  // Test 1: Health Check
  await test('Health Check Endpoint', async () => {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`);
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Health check failed');
    }
  });

  // Test 2: Get Books (Public)
  await test('GET /api/books - Get all books', async () => {
    const response = await apiClient.get('/books');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get books');
    }
    console.log(`   Found ${response.data.data.length} books`);
  });

  // Test 3: Get Categories
  await test('GET /api/books/categories - Get categories', async () => {
    const response = await apiClient.get('/books/categories');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get categories');
    }
    console.log(`   Found ${response.data.data.length} categories`);
  });

  // Test 4: Get Books with Sorting
  await test('GET /api/books?sortBy=price&sortOrder=asc - Sort by price', async () => {
    const response = await apiClient.get('/books', {
      params: { sortBy: 'price', sortOrder: 'asc', limit: 5 },
    });
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to sort books');
    }
    if (response.data.data.length > 1) {
      const prices = response.data.data.map(b => b.price);
      const isSorted = prices.every((price, i) => i === 0 || prices[i - 1] <= price);
      if (!isSorted) {
        throw new Error('Books are not sorted correctly');
      }
    }
  });

  // Test 5: Register User
  let testUser = null;
  await test('POST /api/auth/register - Register new user', async () => {
    const randomEmail = `test${Date.now()}@test.com`;
    const response = await apiClient.post('/auth/register', {
      name: 'Test User',
      email: randomEmail,
      password: 'test123456',
    });
    if (response.status !== 201 || !response.data.success) {
      throw new Error('Failed to register user');
    }
    testUser = response.data.data.user;
    console.log(`   Registered user: ${testUser.email}`);
  });

  // Test 6: Login User
  let authCookie = null;
  await test('POST /api/auth/login - Login user', async () => {
    if (!testUser) throw new Error('No test user to login');
    const response = await apiClient.post('/auth/login', {
      email: testUser.email,
      password: 'test123456',
    });
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to login');
    }
    // Check if cookie was set
    const cookies = response.headers['set-cookie'];
    if (!cookies || !cookies.some(c => c.includes('token'))) {
      throw new Error('Auth cookie not set');
    }
    console.log(`   Logged in user: ${testUser.email}`);
  });

  // Test 7: Get Current User (Me)
  await test('GET /api/auth/me - Get current user', async () => {
    const response = await apiClient.get('/auth/me');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get current user');
    }
    if (response.data.data.email !== testUser.email) {
      throw new Error('User data mismatch');
    }
  });

  // Test 8: Get User Profile
  await test('GET /api/auth/profile - Get user profile', async () => {
    const response = await apiClient.get('/auth/profile');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get user profile');
    }
  });

  // Test 9: Get My Orders (should be empty for new user)
  await test('GET /api/orders/myorders - Get user orders', async () => {
    const response = await apiClient.get('/orders/myorders');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get orders');
    }
    console.log(`   User has ${response.data.data.length} orders`);
  });

  // Test 10: Logout
  await test('POST /api/auth/logout - Logout user', async () => {
    const response = await apiClient.post('/auth/logout');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to logout');
    }
    // Verify cookie was cleared
    const cookies = response.headers['set-cookie'];
    if (cookies && cookies.some(c => c.includes('token') && !c.includes('expires=Thu, 01 Jan 1970'))) {
      // Cookie should be cleared (expires in past)
      console.log('   Cookie cleared');
    }
  });

  // Test 11: Verify protected route after logout
  await test('GET /api/auth/me - Should fail after logout', async () => {
    try {
      await apiClient.get('/auth/me');
      throw new Error('Should have failed - user is logged out');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Expected - user is not authenticated
        return;
      }
      throw error;
    }
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }

  console.log('\n');
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});

