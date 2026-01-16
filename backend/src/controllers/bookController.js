import Book from '../models/Book.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * Get all books with optional filtering and pagination
 * @route GET /api/books
 * @access Public
 * @query {string} category - Filter by category
 * @query {string} language - Filter by language ('Odia', 'English', 'Hindi')
 * @query {string} grade - Filter by academicGrade
 * @query {string} search - Text search across title, author, description
 * @query {number} minPrice - Minimum price filter
 * @query {number} maxPrice - Maximum price filter
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} sortBy - Sort field (title, price, createdAt, rating)
 * @query {string} sortOrder - Sort order (asc, desc)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
import searchService from '../services/searchService.js';

/**
 * Get all books with optional filtering and pagination
 * Enhanced with Fuzzy Search via SearchService
 */
export const getBooks = asyncHandler(async (req, res) => {
  const {
    category,
    language,
    grade,
    search,
    minPrice,
    maxPrice,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = {};

  logger.debug('Fetching books with filters', { search, category, page });

  // 1. Handle Search (Fuzzy Logic)
  let searchResultIds = null;
  if (search) {
    const searchResults = await searchService.search(search, 100); // Get top 100 matches
    searchResultIds = searchResults.map(r => r._id);

    // If search yields no results (but user searched), ensure we return nothing
    if (searchResultIds.length === 0) {
      return res.json({
        success: true,
        books: [],
        totalBooks: 0,
        currentPage: Number(page),
        totalPages: 0,
        pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 },
      });
    }

    query._id = { $in: searchResultIds };
  }

  // 2. Apply Filters
  if (category && category !== 'All') query.category = category;
  if (language && language !== 'All') query.language = language;
  if (grade && grade !== 'All') query.academicGrade = grade;

  if (minPrice || maxPrice) {
    query['price.discounted'] = {};
    if (minPrice) query['price.discounted'].$gte = Number(minPrice);
    if (maxPrice) query['price.discounted'].$lte = Number(maxPrice);
  }

  // 3. Setup Sorting
  // If searching, default to relevance (preserve Fuse order) unless user overrides
  let sortOptions = {};
  const isRelevanceSort = search && sortBy === 'relevance';

  if (!isRelevanceSort) {
    const validSortFields = ['title.display', 'author', 'price.discounted', 'createdAt', 'rating'];
    let sortField = sortBy === 'title' ? 'title.display' :
      sortBy === 'price' ? 'price.discounted' :
        validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
  }

  // 4. Execute Query
  let books = await Book.find(query).lean();

  // 5. Post-Processing: Sort by Relevance if needed
  if (search && (sortBy === 'createdAt' || sortBy === 'relevance')) {
    // If default sort and searching, prioritize fuzzy match score
    const scoreMap = new Map();
    const searchResults = await searchService.search(search, 100);
    searchResults.forEach(r => scoreMap.set(r._id.toString(), r.score));

    books.sort((a, b) => {
      const scoreA = scoreMap.get(a._id.toString()) ?? 1;
      const scoreB = scoreMap.get(b._id.toString()) ?? 1;
      return scoreA - scoreB; // Lower score is better in Fuse
    });
  } else if (!search) {
    // If not searching, just sort by Mongo
    // (We re-query with sort normally, but since we fetched all for client-side sorting above...)
    // Optimization: If not searching, use Mongo sort directly
    books = await Book.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
  }

  // 6. Pagination (Manual if we fetched all for sorting)
  const totalBooks = search ? books.length : await Book.countDocuments(query);
  const totalPages = Math.ceil(totalBooks / Number(limit));

  if (search) {
    // Slice for pagination if we did in-memory sorting
    const startIndex = (Number(page) - 1) * Number(limit);
    books = books.slice(startIndex, startIndex + Number(limit));
  }

  // 7. Add Virtuals
  const booksWithVirtuals = books.map((book) => {
    // Handle legacy string titles
    const displayTitle = typeof book.title === 'string'
      ? book.title
      : (book.title?.display || '');

    return {
      ...book,
      titleDisplay: displayTitle,
      finalPrice: book.price?.discounted || book.price?.original || 0,
      hasDiscount: (book.price?.discountPercent || 0) > 0,
      savings: (book.price?.original || 0) - (book.price?.discounted || 0),
    };
  });

  res.json({
    success: true,
    books: booksWithVirtuals,
    totalBooks,
    currentPage: Number(page),
    totalPages,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: totalBooks,
      pages: totalPages,
    },
  });
});

/**
 * Get search suggestions (Autocomplete)
 * @route GET /api/books/search/suggestions
 */
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const suggestions = await searchService.getSuggestions(q);
  res.json({ success: true, data: suggestions });
});


/**
 * Get all book categories
 * @route GET /api/books/categories
 * @access Public
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getCategories = asyncHandler(async (req, res) => {
  logger.debug('Fetching book categories');
  const categories = await Book.distinct('category');

  logger.info('Categories fetched successfully', { count: categories.length });

  res.json({
    success: true,
    data: categories.filter((cat) => cat).sort(), // Filter out null/undefined and sort
  });
});

/**
 * Get all available languages
 * @route GET /api/books/languages
 * @access Public
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getLanguages = asyncHandler(async (req, res) => {
  logger.debug('Fetching available languages');
  const languages = await Book.distinct('language');

  logger.info('Languages fetched successfully', { count: languages.length });

  res.json({
    success: true,
    data: languages.filter((lang) => lang).sort(), // Filter out null/undefined and sort
  });
});

/**
 * Get all academic grades
 * @route GET /api/books/grades
 * @access Public
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getGrades = asyncHandler(async (req, res) => {
  logger.debug('Fetching academic grades');
  const grades = await Book.distinct('academicGrade');

  logger.info('Grades fetched successfully', { count: grades.length });

  res.json({
    success: true,
    data: grades.filter((grade) => grade).sort(), // Filter out null/undefined and sort
  });
});

/**
 * Get filter statistics for dynamic UI
 * @route GET /api/books/filters
 * @access Public
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getFilterStats = asyncHandler(async (req, res) => {
  logger.debug('Fetching filter statistics');

  // Use aggregation pipeline for efficient stats
  const stats = await Book.aggregate([
    {
      $facet: {
        // Price statistics
        priceStats: [
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price.discounted' },
              maxPrice: { $max: '$price.discounted' },
              avgPrice: { $avg: '$price.discounted' },
            },
          },
        ],
        // Category counts
        categories: [
          { $match: { category: { $ne: null, $exists: true } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { name: '$_id', count: 1, _id: 0 } },
        ],
        // Language counts
        languages: [
          { $match: { language: { $ne: null, $exists: true } } },
          { $group: { _id: '$language', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { name: '$_id', count: 1, _id: 0 } },
        ],
        // Academic grade counts
        grades: [
          { $match: { academicGrade: { $ne: null, $exists: true } } },
          { $group: { _id: '$academicGrade', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $project: { name: '$_id', count: 1, _id: 0 } },
        ],
        // Total count
        totalBooks: [{ $count: 'count' }],
        // Books with ratings
        ratingStats: [
          { $match: { rating: { $gt: 0 } } },
          { $count: 'booksWithRatings' },
        ],
      },
    },
  ]);

  const result = stats[0];
  const priceStats = result.priceStats[0] || { minPrice: 0, maxPrice: 1000, avgPrice: 500 };
  const totalBooks = result.totalBooks[0]?.count || 0;
  const booksWithRatings = result.ratingStats[0]?.booksWithRatings || 0;

  logger.info('Filter stats fetched successfully', {
    totalBooks,
    categoriesCount: result.categories.length,
    languagesCount: result.languages.length,
  });

  res.json({
    success: true,
    data: {
      priceRange: {
        min: Math.floor(priceStats.minPrice || 0),
        max: Math.ceil(priceStats.maxPrice || 1000),
        avg: Math.round(priceStats.avgPrice || 500),
      },
      categories: result.categories,
      languages: result.languages,
      grades: result.grades.filter((g) => g.name), // Filter out null grades
      totalBooks,
      booksWithRatings,
      hasRatings: booksWithRatings > 0,
    },
  });
});


/**
 * Get single book by ID
 * @route GET /api/books/:id
 * @access Public
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.debug('Fetching book', { bookId: id });

  const book = await Book.findById(id).populate('reviews.user', 'name email');

  if (!book) {
    logger.warn('Book not found', { bookId: id });
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  logger.info('Book fetched successfully', { bookId: id, title: book.title });
  res.json({
    success: true,
    data: book,
  });
});

/**
 * Create a new book
 * @route POST /api/books
 * @access Private/Admin
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const createBook = asyncHandler(async (req, res) => {
  const bookData = { ...req.body };
  const ODIA_CHAR_REGEX = /[\u0B00-\u0B7F]/;

  // AUTO-LOGIC 1: Smart Title Processing
  if (typeof bookData.title === 'string') {
    const titleText = bookData.title;
    const hasOdiaChars = ODIA_CHAR_REGEX.test(titleText);
    bookData.title = {
      display: titleText,
      english: !hasOdiaChars ? titleText : undefined,
      odia: hasOdiaChars ? titleText : undefined,
    };
    if (!bookData.language) bookData.language = hasOdiaChars ? 'Odia' : 'English';
  } else if (typeof bookData.title === 'object') {
    if (!bookData.title.display) {
      return res.status(400).json({ success: false, message: 'title.display is required' });
    }
    if (!bookData.language) {
      const hasOdiaChars = ODIA_CHAR_REGEX.test(bookData.title.display);
      bookData.language = hasOdiaChars ? 'Odia' : 'English';
      if (hasOdiaChars && !bookData.title.odia) bookData.title.odia = bookData.title.display;
      else if (!hasOdiaChars && !bookData.title.english) bookData.title.english = bookData.title.display;
    }
  } else {
    return res.status(400).json({ success: false, message: 'title is required' });
  }

  // AUTO-LOGIC 2: Smart Price Processing
  if (typeof bookData.price === 'number') {
    const priceValue = bookData.price;
    bookData.price = { original: priceValue, discounted: priceValue, discountPercent: 0 };
  } else if (typeof bookData.price === 'object') {
    if (!bookData.price.original) {
      return res.status(400).json({ success: false, message: 'price.original is required' });
    }
    if (!bookData.price.discounted) bookData.price.discounted = bookData.price.original;
    if (bookData.price.discountPercent === undefined) bookData.price.discountPercent = 0;
  } else {
    return res.status(400).json({ success: false, message: 'price is required' });
  }

  // AUTO-LOGIC 3: Auto-assign Educational category if academicGrade provided
  if (bookData.academicGrade && !bookData.category) {
    bookData.category = 'Educational';
    logger.info('Auto-assigned Educational category', { academicGrade: bookData.academicGrade });
  }

  if (!bookData.tags) bookData.tags = [];
  if (bookData.academicGrade === undefined) bookData.academicGrade = null;

  logger.info('Creating new book', {
    title: bookData.title.display,
    language: bookData.language,
    adminId: req.user?.id,
  });

  const book = await Book.create(bookData);

  logger.info('Book created successfully', { bookId: book._id, title: book.title.display });

  res.status(201).json({ success: true, data: book, message: 'Book created successfully' });
});

/**
 * Update a book
 * @route PUT /api/books/:id
 * @access Private/Admin
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info('Updating book', { bookId: id, adminId: req.user.id });

  let book = await Book.findById(id);

  if (!book) {
    logger.warn('Book not found for update', { bookId: id });
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  book = await Book.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  logger.info('Book updated successfully', { bookId: id, title: book.title });
  res.json({
    success: true,
    data: book,
  });
});

/**
 * Delete a book
 * @route DELETE /api/books/:id
 * @access Private/Admin
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info('Deleting book', { bookId: id, adminId: req.user.id });

  const book = await Book.findById(id);

  if (!book) {
    logger.warn('Book not found for deletion', { bookId: id });
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  await book.deleteOne();

  logger.info('Book deleted successfully', { bookId: id, title: book.title });
  res.json({
    success: true,
    message: 'Book deleted successfully',
  });
});
