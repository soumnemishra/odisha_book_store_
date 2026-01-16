import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

// Query key factory for cache management
export const bookKeys = {
  all: ['books'],
  lists: () => [...bookKeys.all, 'list'],
  list: (filters) => [...bookKeys.lists(), filters],
  details: () => [...bookKeys.all, 'detail'],
  detail: (id) => [...bookKeys.details(), id],
  categories: () => [...bookKeys.all, 'categories'],
  languages: () => [...bookKeys.all, 'languages'],
  grades: () => [...bookKeys.all, 'grades'],
};

// Helper to normalize book data from backend
const normalizeBook = (book) => ({
  ...book,
  // Normalize nested title
  title: typeof book.title === 'object'
    ? book.title.display || book.title.english || book.title.odia
    : book.title,
  titleObj: book.title, // Keep original for detailed view
  // Normalize nested price
  price: typeof book.price === 'object'
    ? book.price.discounted || book.price.original
    : book.price,
  originalPrice: typeof book.price === 'object' ? book.price.original : book.price,
  discountPercent: typeof book.price === 'object' ? book.price.discountPercent || 0 : 0,
  priceObj: book.price, // Keep original for detailed view
});

// Base API functions
export const bookService = {
  getBooks: (params = {}) => apiClient.get('/books', { params }),
  getBook: (id) => apiClient.get(`/books/${id}`),
  getCategories: () => apiClient.get('/books/categories'),
  getLanguages: () => apiClient.get('/books/languages'),
  getGrades: () => apiClient.get('/books/grades'),
  getSuggestions: (q) => apiClient.get('/books/search/suggestions', { params: { q } }),
};

// React Query hooks
export const useBooks = (filters = {}) => {
  return useQuery({
    queryKey: bookKeys.list(filters),
    queryFn: async () => {
      const response = await bookService.getBooks(filters);
      // Handle both response formats (books array or data wrapper)
      const books = response.data?.books || response.data?.data || [];
      return {
        books: books.map(normalizeBook),
        pagination: response.data?.pagination || {
          page: response.data?.currentPage || 1,
          pages: response.data?.totalPages || 1,
          total: response.data?.totalBooks || books.length,
        },
      };
    },
  });
};

export const useBook = (id) => {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: async () => {
      const response = await bookService.getBook(id);
      const book = response.data?.data || response.data;
      return normalizeBook(book);
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: bookKeys.categories(),
    queryFn: async () => {
      const response = await bookService.getCategories();
      return response.data?.data || [];
    },
    staleTime: 10 * 60 * 1000, // Categories rarely change, cache for 10 mins
  });
};

export const useLanguages = () => {
  return useQuery({
    queryKey: bookKeys.languages(),
    queryFn: async () => {
      const response = await bookService.getLanguages();
      return response.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useGrades = () => {
  return useQuery({
    queryKey: bookKeys.grades(),
    queryFn: async () => {
      const response = await bookService.getGrades();
      return response.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Filter statistics hook
export const useFilterStats = () => {
  return useQuery({
    queryKey: [...bookKeys.all, 'filterStats'],
    queryFn: async () => {
      const response = await apiClient.get('/books/filters');
      return response.data?.data || {
        priceRange: { min: 0, max: 1000, avg: 500 },
        categories: [],
        languages: [],
        grades: [],
        totalBooks: 0,
        hasRatings: false,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
};
