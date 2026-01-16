import { create } from 'zustand';
import { API_URL } from '../constants/api';

export const useBookStore = create((set, get) => ({
    books: [],
    categories: [],
    selectedCategory: null,
    searchQuery: '',
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        totalPages: 1,
        total: 0,
    },
    hasMore: true,

    // Fetch books with filters and pagination
    fetchBooks: async (page = 1, refresh = false) => {
        const { searchQuery, selectedCategory } = get();

        try {
            if (refresh || page === 1) {
                set({ isLoading: true, error: null });
            }

            let url = `${API_URL}/books?page=${page}&limit=10`;

            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }

            if (selectedCategory) {
                url += `&category=${encodeURIComponent(selectedCategory)}`;
            }

            console.log('📚 Fetching books from:', url);
            const response = await fetch(url);
            const responseData = await response.json();
            console.log('📦 Books response:', responseData);
            console.log('🔍 Response keys:', Object.keys(responseData));
            console.log('📚 Books array check:', {
                hasBooks: !!responseData.books,
                booksLength: responseData.books?.length,
                hasData: !!responseData.data,
                dataLength: responseData.data?.length,
            });

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to fetch books');
            }

            // NEW API FORMAT: { success: true, books: [...], totalBooks, currentPage, totalPages }
            // ALSO SUPPORTS OLD: { success: true, data: [...], pagination: {...} }
            const booksArray = responseData.books || responseData.data || [];

            console.log('📖 Extracted books array:', booksArray.length, 'books');
            if (booksArray.length > 0) {
                console.log('📖 First book sample:', JSON.stringify(booksArray[0], null, 2).substring(0, 300));
            }

            const newBooks = refresh || page === 1
                ? booksArray
                : [...get().books, ...booksArray];

            // CRITICAL FIX: Remove duplicates by ID to prevent React key errors
            const uniqueBooks = Array.from(
                new Map(newBooks.map(book => [book._id, book])).values()
            );

            console.log('✅ Books loaded:', uniqueBooks.length, 'books out of', responseData.totalBooks || responseData.pagination?.total || 0, 'total');
            if (newBooks.length !== uniqueBooks.length) {
                console.warn('⚠️ Removed', newBooks.length - uniqueBooks.length, 'duplicate books');
            }

            // Handle both new flat format and old nested pagination format
            const paginationInfo = responseData.pagination || {
                page: responseData.currentPage || page,
                limit: 20,
                totalPages: responseData.totalPages || 1,
                total: responseData.totalBooks || booksArray.length
            };

            set({
                books: uniqueBooks,
                pagination: paginationInfo,
                hasMore: (responseData.currentPage || paginationInfo.page) < (responseData.totalPages || paginationInfo.totalPages),
                isLoading: false,
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error fetching books:', error);
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Fetch single book by ID
    fetchBookById: async (bookId) => {
        try {
            set({ isLoading: true, error: null });

            const response = await fetch(`${API_URL}/books/${bookId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch book');
            }

            set({ isLoading: false });
            return { success: true, book: data.data };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Fetch categories
    fetchCategories: async () => {
        try {
            const response = await fetch(`${API_URL}/books/categories`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch categories');
            }

            set({ categories: data.data || [] });
            return { success: true };
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, error: error.message };
        }
    },

    // Set search query
    setSearchQuery: (query) => {
        set({ searchQuery: query });
    },

    // Set selected category
    setSelectedCategory: (category) => {
        set({ selectedCategory: category, books: [], pagination: { ...get().pagination, page: 1 } });
    },

    // Clear filters
    clearFilters: () => {
        set({
            searchQuery: '',
            selectedCategory: null,
            books: [],
            pagination: { page: 1, limit: 10, totalPages: 1, total: 0 }
        });
    },

    // Load more books (pagination)
    loadMore: async () => {
        const { pagination, hasMore, isLoading } = get();
        if (hasMore && !isLoading) {
            await get().fetchBooks(pagination.page + 1);
        }
    },

    // Refresh books
    refresh: async () => {
        await get().fetchBooks(1, true);
    },
}));
