import express from 'express';
import {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    getCategories,
    getLanguages,
    getGrades,
    getFilterStats,
    getSearchSuggestions
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/v1/books/search/suggestions
 * @desc    Get search suggestions (autocomplete)
 * @access  Public
 */
router.get('/search/suggestions', getSearchSuggestions);

/**
 * @route   GET /api/v1/books/categories
 * @desc    Get all book categories
 * @access  Public
 */
router.get('/categories', getCategories);

/**
 * @route   GET /api/v1/books/languages
 * @desc    Get all available languages
 * @access  Public
 */
router.get('/languages', getLanguages);

/**
 * @route   GET /api/v1/books/grades
 * @desc    Get all academic grades
 * @access  Public
 */
router.get('/grades', getGrades);

/**
 * @route   GET /api/v1/books/filters
 * @desc    Get filter statistics
 * @access  Public
 */
router.get('/filters', getFilterStats);

/**
 * @route   GET /api/v1/books
 * @desc    Get all books with filtering and pagination
 * @access  Public
 */
router.get('/', getBooks);

/**
 * @route   GET /api/v1/books/:id
 * @desc    Get single book by ID
 * @access  Public
 */
router.get('/:id', getBook);

/**
 * @route   POST /api/v1/books
 * @desc    Create a new book
 * @access  Private/Admin
 */
router.post('/', protect, admin, createBook);

/**
 * @route   PUT /api/v1/books/:id
 * @desc    Update a book
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, updateBook);

/**
 * @route   DELETE /api/v1/books/:id
 * @desc    Delete a book
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteBook);

export default router;
