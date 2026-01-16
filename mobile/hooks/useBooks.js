// hooks/useBooks.js - React Query hooks for book data
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getBooks, getOneBook, getFilters, searchBooks } from '../services/api';

/**
 * Hook to fetch paginated books with filters
 * @param {Object} params - Query parameters (page, language, category, etc.)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with data, loading state, error
 * 
 * Example usage:
 * const { data, isLoading, error, refetch } = useBooks({ language: 'Odia', page: 1 });
 * 
 * Access data:
 * - data.books - Array of books
 * - data.totalBooks - Total count
 * - data.currentPage - Current page number
 * - data.totalPages - Total pages
 */
export const useBooks = (params = {}, options = {}) => {
    return useQuery({
        queryKey: ['books', params], // Cache key - changes when params change
        queryFn: () => getBooks(params),
        ...options,
    });
};

/**
 * Hook for infinite scroll pagination
 * Automatically loads more books as user scrolls
 * 
 * Example usage:
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteBooks({ language: 'Odia' });
 */
export const useInfiniteBooks = (params = {}, options = {}) => {
    return useInfiniteQuery({
        queryKey: ['books-infinite', params],
        queryFn: ({ pageParam = 1 }) => getBooks({ ...params, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.currentPage < lastPage.totalPages) {
                return lastPage.currentPage + 1;
            }
            return undefined; // No more pages
        },
        ...options,
    });
};

/**
 * Hook to fetch single book by ID
 * @param {string} id - Book ID
 * @param {Object} options - React Query options
 * 
 * Example usage:
 * const { data: book, isLoading } = useBook(bookId);
 */
export const useBook = (id, options = {}) => {
    return useQuery({
        queryKey: ['book', id],
        queryFn: () => getOneBook(id),
        enabled: !!id, // Only fetch if ID exists
        ...options,
    });
};

/**
 * Hook to fetch filter options (languages, categories)
 * Cached for 10 minutes since this data rarely changes
 * 
 * Example usage:
 * const { data } = useFilters();
 * // data.languages = ['English', 'Odia']
 * // data.categories = ['Fiction', 'History', ...]
 */
export const useFilters = (options = {}) => {
    return useQuery({
        queryKey: ['filters'],
        queryFn: getFilters,
        staleTime: 1000 * 60 * 10, // 10 minutes
        ...options,
    });
};

/**
 * Hook to search books
 * Debounced search queries work best with this
 * 
 * Example usage:
 * const { data, isLoading } = useSearchBooks(searchQuery, { enabled: searchQuery.length > 2 });
 */
export const useSearchBooks = (query, additionalParams = {}, options = {}) => {
    return useQuery({
        queryKey: ['book-search', query, additionalParams],
        queryFn: () => searchBooks(query, additionalParams),
        enabled: query && query.length > 2, // Only search if query has 3+ characters
        ...options,
    });
};
