import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/db.js';
import Book from '../models/Book.js';

// Get the directory path of the current module
/* eslint-disable no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/* eslint-enable no-underscore-dangle */

// Read and import books.json file
const booksPath = join(__dirname, 'books.json');
const booksData = JSON.parse(readFileSync(booksPath, 'utf-8'));

// Map books.json fields to Book model schema
const mapBooksData = (books) =>
  books.map((book) => {
    const isbn = book.ISBN || book.isbn || '';
    return {
      title: book.Title || book.title || 'Untitled',
      author: book.Author || book.author || 'Unknown Author',
      description:
        book.Description ||
        book.description ||
        `A book by ${book.Author || book.author || 'Unknown Author'}`,
      price: book['Price (INR)'] || book.Price || book.price || 0,
      category: book.Category || book.category || 'General',
      stock: book.Stock || book.stock || 10, // Default stock
      isbn: isbn.trim() || undefined, // Set to undefined if empty (sparse unique index allows multiple undefined values)
      image: book.Image || book.image || '',
      rating: book.Rating || book.rating || 0,
    };
  });

const importBooks = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing books
    await Book.deleteMany();
    console.log('✓ Books cleared from database');

    // Map and insert books
    const mappedBooks = mapBooksData(booksData);
    await Book.insertMany(mappedBooks);

    console.log(`✓ Successfully imported ${mappedBooks.length} books into database`);

    // Close database connection
    await mongoose.connection.close();
    console.log('✓ Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error importing books:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the import function
importBooks();

export default importBooks;
