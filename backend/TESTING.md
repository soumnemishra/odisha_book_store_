# Testing Guide

## Overview

This backend uses **Jest** for testing with the following structure:
- **Unit tests**: Test individual services and functions
- **Integration tests**: Test API endpoints end-to-end
- **Test coverage**: Minimum 70% threshold enforced

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Structure

```
src/tests/
├── setup.js                  # Test environment setup
├── helpers/
│   ├── mockDatabase.js       # MongoDB Memory Server utilities
│   ├── authHelpers.js        # Authentication test helpers
│   └── factories.js          # Test data factories
├── unit/
│   ├── services/             # Service layer tests
│   └── controllers/          # Controller tests (TODO)
└── integration/
    ├── auth.test.js          # Authentication flow tests
    └── books.test.js         # Books API tests
```

## Test Helpers

### Mock Database
```javascript
import { connectTestDB, disconnectTestDB, clearTestDB } from './helpers/mockDatabase.js';

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB(); // Clear data between tests
});
```

### Auth Helpers
```javascript
import { createTestUser, createTestAdmin, generateTestToken } from './helpers/authHelpers.js';

// Create a regular test user
const { user, token } = await createTestUser();

// Create an admin user
const admin = await createTestAdmin();

// Generate a token for a user ID
const token = generateTestToken(userId);
```

### Data Factories
```javascript
import { createTestBook, createTestBooks, createTestOrder } from './helpers/factories.js';

// Create a single book
const book = await createTestBook({ title: 'My Book', price: 399 });

// Create multiple books
const books = await createTestBooks(10);

// Create an order
const order = await createTestOrder(userId, items);
```

## Writing Tests

### Unit Test Example
```javascript
import { connectTestDB, disconnectTestDB, clearTestDB } from '../../helpers/mockDatabase.js';
import * as bookService from '../../../services/bookService.js';

describe('BookService', () => {
  beforeAll(async () => await connectTestDB());
  afterAll(async () => await disconnectTestDB());
  beforeEach(async () => await clearTestDB());

  it('should create a book', async () => {
    const bookData = { title: 'Test Book', price: 299 };
    const book = await bookService.createBook(bookData);
    expect(book.title).toBe('Test Book');
  });
});
```

### Integration Test Example
```javascript
import request from 'supertest';
import app from '../../../server.js';

describe('GET /api/books', () => {
  it('should return all books', async () => {
    const response = await request(app)
      .get('/api/books')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.books).toBeDefined();
  });
});
```

## Coverage Requirements

The following coverage thresholds are enforced:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

View coverage report after running `npm run test:coverage` in the `coverage/` directory.

## Troubleshooting

### MongoDB Memory Server Issues
If you encounter MongoDB Memory Server download issues:
```bash
# Set download URL
export MONGOMS_DOWNLOAD_URL=https://fastdl.mongodb.org/linux
npm install
```

### ESM Module Issues
We use `NODE_OPTIONS=--experimental-vm-modules` for ESM support in Jest.

### Timeout Errors
Default timeout is 10 seconds. Increase if needed:
```javascript
jest.setTimeout(30000); // 30 seconds
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clean up**: Clear database between tests
3. **Realistic data**: Use factories for consistent test data
4. **Descriptive names**: Test names should clearly describe what they test
5. **AAA pattern**: Arrange, Act, Assert
6. **Edge cases**: Test both happy path and error scenarios
