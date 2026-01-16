/**
 * Backend Setup Verification Script
 * Run this to verify your backend is set up correctly
 */

require('dotenv').config();
const config = require('./src/config/env');

console.log('\n=== Odisha Book Store Backend Setup Verification ===\n');

// Check environment variables
console.log('1. Checking Environment Variables:');
const requiredVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
let allVarsPresent = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    if (varName === 'JWT_SECRET') {
      console.log(`   ✓ ${varName}: ${value.length > 10 ? '***SET***' : 'TOO SHORT (minimum 10 characters)'}`);
      if (value.length <= 10) allVarsPresent = false;
    } else {
      console.log(`   ✓ ${varName}: ${value}`);
    }
  } else {
    console.log(`   ✗ ${varName}: MISSING`);
    allVarsPresent = false;
  }
});

// Check MongoDB URI format
console.log('\n2. Checking MongoDB Connection String:');
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
    console.log('   ✓ MongoDB URI format is correct');
  } else {
    console.log('   ✗ MongoDB URI format is invalid (should start with mongodb:// or mongodb+srv://)');
    allVarsPresent = false;
  }
}

// Check dependencies
console.log('\n3. Checking Dependencies:');
try {
  require('express');
  require('mongoose');
  require('dotenv');
  require('bcryptjs');
  require('jsonwebtoken');
  require('cors');
  console.log('   ✓ All required packages are installed');
} catch (error) {
  console.log(`   ✗ Missing package: ${error.message}`);
  allVarsPresent = false;
}

// Final summary
console.log('\n=== Setup Verification Summary ===');
if (allVarsPresent) {
  console.log('✓ All checks passed! Your backend is ready to run.');
  console.log('\nNext steps:');
  console.log('1. Make sure MongoDB is running');
  console.log('2. Run: npm run dev (for development)');
  console.log('3. Or run: npm start (for production)');
  console.log('\nServer will start on: http://localhost:' + config.PORT);
} else {
  console.log('✗ Some checks failed. Please fix the issues above.');
  console.log('\nRequired .env file content (backend/.env):');
  console.log('NODE_ENV=development');
  console.log('PORT=5000');
  console.log('MONGODB_URI=mongodb://localhost:27017/odisha_book_store');
  console.log('JWT_SECRET=your_super_secret_jwt_key_minimum_10_characters');
  console.log('JWT_EXPIRE=30d');
  console.log('API_BASE_URL=http://localhost:5000');
}

console.log('\n');

