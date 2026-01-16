import request from 'supertest';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../../helpers/mockDatabase.js';
import { createTestAdmin, createTestUser } from '../../helpers/authHelpers.js';
import { createTestBook, createTestBooks } from '../../helpers/factories.js';
import app from '../../../server.js';

describe('BookController', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      await createTestBooks(15);
    });

    it('should get all books with pagination', async () => {
      const response = await request(app).get('/api/books?page=1&limit=10').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toHaveProperty('total', 15);
      expect(response.body.pagination).toHaveProperty('pages', 2);
    });

    it('should filter books by category', async () => {
      const response = await request(app).get('/api/books?category=Fiction').expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((book) => {
        expect(book.category).toBe('Fiction');
      });
    });

    it('should search books by title', async () => {
      await createTestBook({ title: 'Unique Search Title' });

      const response = await request(app).get('/api/books?search=Unique').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain('Unique');
    });

    it('should sort books by price ascending', async () => {
      const response = await request(app).get('/api/books?sortBy=price&sortOrder=asc').expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.data.map((b) => b.price);
      for (let i = 0; i < prices.length - 1; i += 1) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    it('should sort books by price descending', async () => {
      const response = await request(app).get('/api/books?sortBy=price&sortOrder=desc').expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.data.map((b) => b.price);
      for (let i = 0; i < prices.length - 1; i += 1) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    });
  });

  describe('GET /api/books/categories', () => {
    beforeEach(async () => {
      await createTestBooks(10);
    });

    it('should get all unique categories', async () => {
      const response = await request(app).get('/api/books/categories').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return sorted categories', async () => {
      const response = await request(app).get('/api/books/categories').expect(200);

      const categories = response.body.data;
      for (let i = 0; i < categories.length - 1; i += 1) {
        expect(categories[i].localeCompare(categories[i + 1])).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('GET /api/books/:id', () => {
    it('should get a book by valid ID', async () => {
      const book = await createTestBook({ title: 'Test Book' });

      const response = await request(app).get(`/api/books/${book._id}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Book');
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app).get(`/api/books/${fakeId}`).expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid book ID', async () => {
      const response = await request(app).get('/api/books/invalid-id').expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/books', () => {
    let adminToken;

    beforeEach(async () => {
      const admin = await createTestAdmin();
      adminToken = admin.token;
    });

    it('should create a book as admin', async () => {
      const bookData = {
        title: 'New Test Book',
        author: 'Test Author',
        description: 'A test book',
        price: 499,
        category: 'Fiction',
        language: 'English',
        publisher: 'Test Publisher',
        isbn: '9780111111111',
        pages: 300,
        stock: 25,
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(bookData.title);
      expect(response.body.data.price).toBe(bookData.price);
    });

    it('should return 401 without authentication', async () => {
      const bookData = {
        title: 'Unauthorized Book',
        author: 'Author',
        price: 299,
      };

      const response = await request(app).post('/api/books').send(bookData).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 as non-admin user', async () => {
      const { token: userToken } = await createTestUser();

      const bookData = {
        title: 'Non-Admin Book',
        author: 'Author',
        price: 299,
        category: 'Fiction',
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/books/:id', () => {
    let adminToken;
    let testBook;

    beforeEach(async () => {
      const admin = await createTestAdmin();
      adminToken = admin.token;
      testBook = await createTestBook({ price: 299 });
    });

    it('should update a book as admin', async () => {
      const updateData = {
        price: 399,
        stock: 50,
      };

      const response = await request(app)
        .put(`/api/books/${testBook._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(399);
      expect(response.body.data.stock).toBe(50);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/books/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 399 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/books/${testBook._id}`)
        .send({ price: 399 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 as non-admin user', async () => {
      const { token: userToken } = await createTestUser();

      const response = await request(app)
        .put(`/api/books/${testBook._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 399 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/books/:id', () => {
    let adminToken;
    let testBook;

    beforeEach(async () => {
      const admin = await createTestAdmin();
      adminToken = admin.token;
      testBook = await createTestBook();
    });

    it('should delete a book as admin', async () => {
      const response = await request(app)
        .delete(`/api/books/${testBook._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify book is deleted
      await request(app).get(`/api/books/${testBook._id}`).expect(404);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/books/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).delete(`/api/books/${testBook._id}`).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 as non-admin user', async () => {
      const { token: userToken } = await createTestUser();

      const response = await request(app)
        .delete(`/api/books/${testBook._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
