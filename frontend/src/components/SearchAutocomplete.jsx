import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { bookService } from '../services/bookService';

// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const TRENDING_SEARCHES = [
    { text: "ଗୋପୀନାଥ ମହାନ୍ତି", icon: "✍️" }, // Gopinath Mohanty
    { text: "ବିଭୂତି ପଟ୍ଟନାୟକ", icon: "📚" }, // Bibhuti Pattnaik
    { text: "Novel", icon: "📖" },
    { text: "Children", icon: "🧒" },
];

const SearchAutocomplete = ({ className = '', categories = [] }) => {
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState({ name: 'All', path: '' });
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    const debouncedQuery = useDebounce(query, 300);

    // Load recent searches
    useEffect(() => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored).slice(0, 5));
            } catch (e) {
                console.error('Failed to parse recent searches');
            }
        }
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setIsFocused(false);
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const saveRecentSearch = (searchTerm) => {
        if (!searchTerm) return;
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // 1. Fetch Text Suggestions
    const { data: suggestionsData } = useQuery({
        queryKey: ['search-suggestions', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return [];
            const response = await bookService.getSuggestions(debouncedQuery);
            return response.data?.data || [];
        },
        enabled: debouncedQuery.length >= 2,
        staleTime: 60 * 1000,
    });

    // 2. Fetch Product Previews
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['search-products', debouncedQuery, selectedCategory.name],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return { books: [] };
            const params = { search: debouncedQuery, limit: 3 };
            if (selectedCategory.name !== 'All') {
                params.category = selectedCategory.name;
            }
            const response = await bookService.getBooks(params);
            return response.data?.data || response.data || { books: [] };
        },
        enabled: debouncedQuery.length >= 2,
        staleTime: 60 * 1000,
    });

    const suggestions = suggestionsData || [];
    const products = productsData?.books || [];
    const hasResults = suggestions.length > 0 || products.length > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            performSearch(query.trim());
        }
    };

    const performSearch = (text) => {
        saveRecentSearch(text);
        const searchParams = new URLSearchParams();
        searchParams.set('search', text);
        if (selectedCategory.name !== 'All') {
            searchParams.set('category', selectedCategory.name);
        }
        navigate(`/books?${searchParams.toString()}`);
        setQuery('');
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
    };

    const getTitle = (book) => {
        return book.title?.display || (typeof book.title === 'string' ? book.title : 'Untitled');
    };

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center bg-white rounded-md border-2 transition-all ${isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
                } ${className} z-50`}
        >
            {/* 1. Category Dropdown (Custom UI) */}
            <div className="relative border-r border-gray-200">
                <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 rounded-l-md transition-colors min-w-[110px] justify-between focus:outline-none focus:bg-gray-100 h-full"
                >
                    <span className="truncate max-w-[80px]">{selectedCategory.name === 'All' ? 'All' : selectedCategory.name}</span>
                    <svg
                        className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Custom Category Menu */}
                <AnimatePresence>
                    {isCategoryOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute top-[calc(100%+4px)] left-0 w-48 bg-white rounded-md shadow-xl border border-gray-100 py-1 z-[60] max-h-80 overflow-y-auto"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory({ name: 'All', path: '' });
                                    setIsCategoryOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedCategory.name === 'All' ? 'font-bold text-primary bg-primary/5' : 'text-gray-700'}`}
                            >
                                All Categories
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setIsCategoryOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedCategory.name === cat.name ? 'font-bold text-primary bg-primary/5' : 'text-gray-700'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Search Input (Middle) */}
            <form onSubmit={handleSubmit} className="flex-1 min-w-0 relative">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search Odisha Book Store..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        setIsOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 border-none outline-none focus:ring-0 bg-transparent placeholder-gray-400"
                />
            </form>

            {/* 3. Search Button (Right) */}
            <button
                onClick={(e) => handleSubmit(e)}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-r-[4px] border-l border-primary/50 transition-colors flex items-center justify-center h-full"
            >
                {isLoading && query.length >= 2 ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                )}
            </button>

            {/* 4. Dropdown Results (Absolute Full Width) */}
            <AnimatePresence>
                {isOpen && (isFocused || query.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-b-md shadow-lg border border-gray-200 overflow-hidden z-[50]"
                    >
                        {/* A. Empty State: Trending & History */}
                        {query.length < 2 ? (
                            <div className="py-2">
                                {/* Trending */}
                                <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-lg">🔥</span> Trending
                                    </h3>
                                </div>
                                <div>
                                    {TRENDING_SEARCHES.map((item, index) => (
                                        <button
                                            key={index}
                                            onMouseDown={(e) => { e.preventDefault(); performSearch(item.text); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors group"
                                        >
                                            <span className="text-gray-400 group-hover:text-primary">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </span>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-primary">{item.text}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Recent */}
                                {recentSearches.length > 0 && (
                                    <>
                                        <div className="px-4 py-2 bg-gray-50/50 border-t border-b border-gray-100 mt-2 flex justify-between items-center">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <span className="text-lg">🕒</span> Recent
                                            </h3>
                                            <button
                                                onMouseDown={(e) => { e.preventDefault(); clearRecentSearches(); }}
                                                className="text-[10px] uppercase font-bold text-red-400 hover:text-red-600 tracking-wider"
                                            >
                                                Clear History
                                            </button>
                                        </div>
                                        {recentSearches.map((term, i) => (
                                            <button
                                                key={i}
                                                onMouseDown={(e) => { e.preventDefault(); performSearch(term); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors group"
                                            >
                                                <span className="text-gray-400 group-hover:text-primary">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                                <span className="text-sm text-gray-600 group-hover:text-primary">{term}</span>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        ) : (
                            /* B. Results State */
                            <div className="py-2">
                                {hasResults ? (
                                    <>
                                        {/* Suggestions */}
                                        {suggestions.length > 0 && (
                                            <div className="pb-2">
                                                {suggestions.map((suggestion, i) => (
                                                    <button
                                                        key={`s-${i}`}
                                                        onMouseDown={(e) => { e.preventDefault(); performSearch(suggestion); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 text-left transition-colors group"
                                                    >
                                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        <span
                                                            className="text-sm text-gray-700 group-hover:text-primary"
                                                            dangerouslySetInnerHTML={{
                                                                __html: suggestion.replace(new RegExp(`(${query})`, 'gi'), '<span class="font-bold text-gray-900">$1</span>')
                                                            }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Products */}
                                        {products.length > 0 && (
                                            <div className="border-t border-gray-100 bg-gray-50/30">
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    Top Products
                                                </div>
                                                {products.map((book) => (
                                                    <Link
                                                        key={book._id}
                                                        to={`/books/${book._id}`}
                                                        onMouseDown={() => { saveRecentSearch(getTitle(book)); }}
                                                        className="flex items-start gap-4 px-4 py-3 hover:bg-blue-50 transition-colors group border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="w-10 h-14 flex-shrink-0 bg-white shadow-sm border border-gray-200 rounded p-0.5">
                                                            {book.image ? (
                                                                <img src={book.image} alt="" className="w-full h-full object-cover rounded-[2px]" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs bg-gray-100">📚</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                                                {getTitle(book)}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 line-clamp-1">by {book.author}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                                    ₹{book.price?.discounted || book.price?.original || 0}
                                                                </span>
                                                                {book.category && (
                                                                    <span className="text-[10px] text-gray-400 border border-gray-100 px-1 rounded">
                                                                        {book.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 text-center">
                                        <div className="text-4xl mb-3 opacity-20">🔍</div>
                                        <p className="text-gray-500 text-sm font-medium">No results found</p>
                                        <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchAutocomplete;
