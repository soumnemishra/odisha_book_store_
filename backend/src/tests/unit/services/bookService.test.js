import { connectTestDB, disconnectTestDB, clearTestDB } from '../../helpers/mockDatabase.js';
import {
  findBooksByCategory,
  findBooksByAuthor,
  updateStock,
} from '../../../services/bookService.js';
import { createTestBook, createTestBooks } from '../../helpers/factories.js';

describe('BookService', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('findBooksByCategory', () => {
    beforeEach(async () => {
      await createTestBooks(10);
    });

    it('should find books by category', async () => {
      const books = await findBooksByCategory('Fiction');

      expect(books.length).toBeGreaterThan(0);
      books.forEach((book) => {
        expect(book.category).toBe('Fiction');
      });
    });

    it('should return empty array for category with no books', async () => {
      const books = await findBooksByCategory('NonExistentCategory');

      expect(books).toEqual([]);
    });

    it('should throw error for invalid category', async () => {
      await expect(findBooksByCategory('')).rejects.toThrow();
      await expect(findBooksByCategory(null)).rejects.toThrow();
    });
  });

  describe('findBooksByAuthor', () => {
    beforeEach(async () => {
      await createTestBook({ author: 'Unique Author Name' });
      await createTestBooks(5);
    });

    it('should find books by author (case-insensitive)', async () => {
      const books = await findBooksByAuthor('unique author');

      expect(books.length).toBeGreaterThan(0);
      expect(books[0].author).toBe('Unique Author Name');
    });

    it('should find books by partial author name', async () => {
      const books = await findBooksByAuthor('Unique');

      expect(books.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent author', async () => {
      const books = await findBooksByAuthor('NonExistentAuthor');

      expect(books).toEqual([]);
    });

    it('should throw error for invalid author', async () => {
      await expect(findBooksByAuthor('')).rejects.toThrow();
      await expect(findBooksByAuthor(null)).rejects.toThrow();
    });
  });

  describe('updateStock', () => {
    it('should update book stock successfully', async () => {
      const testBook = await createTestBook({ stock: 10 });

      const updatedBook = await updateStock(testBook._id.toString(), 3);

      expect(updatedBook.stock).toBe(7);
    });

    it('should throw error for insufficient stock', async () => {
      const testBook = await createTestBook({ stock: 5 });

      await expect(updateStock(testBook._id.toString(), 10)).rejects.toThrow();
    });

    it('should throw error for invalid book ID', async () => {
      const invalidId = '507f1f77bcf86cd799439011';

      await expect(updateStock(invalidId, 1)).rejects.toThrow();
    });

    it('should throw error for invalid quantity', async () => {
      const testBook = await createTestBook({ stock: 10 });

      await expect(updateStock(testBook._id.toString(), 0)).rejects.toThrow();
      await expect(updateStock(testBook._id.toString(), -1)).rejects.toThrow();
    });
  });
});
