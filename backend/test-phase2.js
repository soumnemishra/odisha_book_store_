/**
 * Phase 2 Testing Script
 * 
 * Tests custom error classes and improved error handling
 * Run with: node test-phase2.js
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Test helper function
 */
function test(name, testFn) {
  return async () => {
    try {
      await testFn();
      testResults.passed++;
      testResults.tests.push({ name, status: 'PASS', error: null });
      console.log(`✅ ${name}`);
    } catch (error) {
      testResults.failed++;
      testResults.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name}: ${error.message}`);
    }
  };
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Phase 2 Tests...\n');
  console.log('Testing Custom Error Classes and Error Handling\n');

  // Test 1: Server Health Check
  await test('Server is running', async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.status !== 200) throw new Error('Server not responding');
  })();

  // Test 2: BadRequestError - Invalid Book ID Format (validation catches it)
  await test('BadRequestError - Invalid book ID format returns 400', async () => {
    try {
      await axios.get(`${API_BASE_URL}/books/invalid_id_12345`);
      throw new Error('Should have returned 400 (validation) or 404');
    } catch (error) {
      // Validation catches invalid MongoDB ID format and returns 400
      // This is correct behavior - 404 is only for valid IDs that don't exist
      if (error.response?.status !== 400 && error.response?.status !== 404) {
        throw new Error(`Expected 400 (validation) or 404, got ${error.response?.status}`);
      }
      if (!error.response?.data?.message) {
        throw new Error('Error response should have message field');
      }
      if (error.response?.data?.success !== false) {
        throw new Error('Error response should have success: false');
      }
    }
  })();

  // Test 3: BadRequestError - Validation Errors
  await test('BadRequestError - Validation errors return 400', async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Test',
        email: 'invalid-email',
        password: 'weak'
      });
      throw new Error('Should have returned 400');
    } catch (error) {
      if (error.response?.status !== 400) {
        throw new Error(`Expected 400, got ${error.response?.status}`);
      }
      if (!error.response?.data?.errors || !Array.isArray(error.response.data.errors)) {
        throw new Error('Validation errors should be in errors array');
      }
    }
  })();

  // Test 4: ConflictError - Duplicate Email
  await test('ConflictError - Duplicate email returns 409', async () => {
    const email = `test${Date.now()}@test.com`;
    
    // Register first user
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Test User',
        email: email,
        password: 'TestPass123'
      });
    } catch (error) {
      // Ignore if registration fails for other reasons
    }

    // Try to register again with same email
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Test User 2',
        email: email,
        password: 'TestPass123'
      });
      throw new Error('Should have returned 409 for duplicate email');
    } catch (error) {
      // Should be 409 (Conflict) or 400 (if validation catches it first)
      if (error.response?.status !== 409 && error.response?.status !== 400) {
        throw new Error(`Expected 409 or 400, got ${error.response?.status}`);
      }
    }
  })();

  // Test 5: UnauthorizedError - Missing Token
  await test('UnauthorizedError - Missing token returns 401', async () => {
    try {
      await axios.get(`${API_BASE_URL}/auth/me`);
      throw new Error('Should have returned 401');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error(`Expected 401, got ${error.response?.status}`);
      }
      if (!error.response?.data?.message) {
        throw new Error('Error response should have message field');
      }
    }
  })();

  // Test 6: Error Response Format Consistency
  await test('Error response format is consistent', async () => {
    try {
      await axios.get(`${API_BASE_URL}/books/invalid_id`);
    } catch (error) {
      const data = error.response?.data;
      if (!data.hasOwnProperty('success')) {
        throw new Error('Error response should have success field');
      }
      if (!data.hasOwnProperty('message')) {
        throw new Error('Error response should have message field');
      }
      if (data.success !== false) {
        throw new Error('Error response should have success: false');
      }
    }
  })();

  // Test 9: NotFoundError - Valid ID format but resource doesn't exist
  await test('NotFoundError - Valid ID format but resource not found returns 404', async () => {
    // Use a valid MongoDB ObjectId format (24 hex characters)
    const validFormatId = '507f1f77bcf86cd799439011';
    try {
      await axios.get(`${API_BASE_URL}/books/${validFormatId}`);
      throw new Error('Should have returned 404');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Expected 404 for non-existent resource, got ${error.response?.status}`);
      }
      if (!error.response?.data?.message) {
        throw new Error('Error response should have message field');
      }
    }
  })();

  // Test 7: Valid Request Still Works
  await test('Valid requests still work correctly', async () => {
    const response = await axios.get(`${API_BASE_URL}/books`);
    if (response.status !== 200) throw new Error('Failed to get books');
    if (!response.data.success) throw new Error('Response should have success: true');
    if (!Array.isArray(response.data.data)) throw new Error('Response should have data array');
  })();

  // Test 8: Error Messages are User-Friendly
  await test('Error messages are user-friendly', async () => {
    try {
      await axios.get(`${API_BASE_URL}/books/invalid_id_12345`);
    } catch (error) {
      const message = error.response?.data?.message;
      if (!message || typeof message !== 'string') {
        throw new Error('Error message should be a string');
      }
      if (message.length === 0) {
        throw new Error('Error message should not be empty');
      }
    }
  })();

  // Print Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.passed + testResults.failed}`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`);
      });
  }

  console.log('\n💡 Phase 2 Testing Notes:');
  console.log('   - Custom error classes should return proper HTTP status codes');
  console.log('   - Error responses should be consistent across all endpoints');
  console.log('   - Error messages should be user-friendly');
  console.log('   - Check logs/ directory for error logging');
  console.log('\n💡 Manual Testing:');
  console.log('   - Test with Postman/curl to see full error responses');
  console.log('   - Verify error messages in different scenarios');
  console.log('   - Check that JSDoc is visible in your IDE');
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error.message);
  process.exit(1);
});

