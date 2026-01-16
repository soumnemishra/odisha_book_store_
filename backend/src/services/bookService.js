import Book from '../models/Book.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

/**
 * Find books by category
 * @param {string} category - Book category name
 * @returns {Promise<Array<import('../models/Book.js').default>>} Array of books matching the category
 * @throws {Error} If database query fails
 */
export const findBooksByCategory = async (category) => {
  if (!category || typeof category !== 'string') {
    throw new BadRequestError('Category must be a non-empty string');
  }
  return Book.find({ category });
};

/**
 * Find books by author (case-insensitive search)
 * @param {string} author - Author name to search for
 * @returns {Promise<Array<import('../models/Book.js').default>>} Array of books by the author
 * @throws {BadRequestError} If author is not provided or invalid
 * @throws {Error} If database query fails
 */
export const findBooksByAuthor = async (author) => {
  if (!author || typeof author !== 'string') {
    throw new BadRequestError('Author must be a non-empty string');
  }
  return Book.find({ author: { $regex: author, $options: 'i' } });
};

/**
 * Update book stock (decrease by quantity)
 * @param {string} bookId - MongoDB ID of the book
 * @param {number} quantity - Quantity to decrease stock by
 * @returns {Promise<import('../models/Book.js').default>} Updated book object
 * @throws {NotFoundError} If book with ID doesn't exist
 * @throws {BadRequestError} If insufficient stock available
 * @throws {Error} If database operation fails
 */
export const updateStock = async (bookId, quantity) => {
  if (!bookId) {
    throw new BadRequestError('Book ID is required');
  }

  if (typeof quantity !== 'number' || quantity <= 0) {
    throw new BadRequestError('Quantity must be a positive number');
  }

  const book = await Book.findById(bookId);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  if (book.stock < quantity) {
    throw new BadRequestError(
      `Insufficient stock. Available: ${book.stock}, Requested: ${quantity}`
    );
  }

  book.stock -= quantity;
  await book.save();

  return book;
};
