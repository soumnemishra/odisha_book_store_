import { useSearchParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import { useBooks, useFilterStats } from '../services/bookService';

const Books = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter values from URL
  const filters = {
    category: searchParams.get('category') || '',
    language: searchParams.get('language') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 12,
  };

  // Fetch data using React Query hooks
  const { data, isLoading, isError, error } = useBooks(filters);
  const { data: filterStats } = useFilterStats();

  const books = data?.books || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  // Dynamic price ranges based on actual data
  const priceRanges = useMemo(() => {
    if (!filterStats?.priceRange) {
      return [
        { label: 'Under ₹200', min: '', max: '200' },
        { label: '₹200 - ₹500', min: '200', max: '500' },
        { label: '₹500 - ₹1000', min: '500', max: '1000' },
        { label: 'Over ₹1000', min: '1000', max: '' },
      ];
    }

    const { min, max } = filterStats.priceRange;
    const range = max - min;

    // Create 4 smart ranges based on actual data
    const step = Math.ceil(range / 4 / 50) * 50; // Round to nearest 50
    const r1 = min + step;
    const r2 = min + step * 2;
    const r3 = min + step * 3;

    return [
      { label: `Under ₹${r1}`, min: '', max: String(r1) },
      { label: `₹${r1} - ₹${r2}`, min: String(r1), max: String(r2) },
      { label: `₹${r2} - ₹${r3}`, min: String(r2), max: String(r3) },
      { label: `Over ₹${r3}`, min: String(r3), max: '' },
    ];
  }, [filterStats?.priceRange]);

  // Get categories with counts from filter stats
  const categoriesWithCounts = filterStats?.categories || [];
  const languagesWithCounts = filterStats?.languages || [];

  // Update URL params
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when filters change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const currentPriceRange = priceRanges.find(
    (r) => r.min === filters.minPrice && r.max === filters.maxPrice
  );

  const handlePriceRange = (range) => {
    const newParams = new URLSearchParams(searchParams);
    if (range.min === filters.minPrice && range.max === filters.maxPrice) {
      // Deselect
      newParams.delete('minPrice');
      newParams.delete('maxPrice');
    } else {
      if (range.min) newParams.set('minPrice', range.min);
      else newParams.delete('minPrice');
      if (range.max) newParams.set('maxPrice', range.max);
      else newParams.delete('maxPrice');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Sort options
  const sortOptions = [
    { label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
    { label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'asc' },
    { label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
    { label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
    { label: 'Title: A-Z', sortBy: 'title', sortOrder: 'asc' },
  ];

  const handleSort = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sortBy);
    newParams.set('sortOrder', sortOrder);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const hasActiveFilters = filters.category || filters.language || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">

        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Books</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {filters.search ? `Search Results for "${filters.search}"` : 'All Books'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? 'Loading...' : `Showing ${books.length} of ${pagination.total} results`}
            {filterStats?.totalBooks && !isLoading && (
              <span className="text-gray-400 ml-2">({filterStats.totalBooks} total in catalog)</span>
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter with Counts */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        checked={!filters.category}
                        onChange={() => updateFilter('category', '')}
                        className="rounded-full border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${!filters.category ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        All Categories
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{filterStats?.totalBooks || 0}</span>
                  </label>
                  {categoriesWithCounts.map((cat) => (
                    <label key={cat.name} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === cat.name}
                          onChange={() => updateFilter('category', cat.name)}
                          className="rounded-full border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className={`text-sm ${filters.category === cat.name ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{cat.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language Filter with Counts */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Language</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="language"
                        checked={!filters.language}
                        onChange={() => updateFilter('language', '')}
                        className="rounded-full border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${!filters.language ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        All Languages
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{filterStats?.totalBooks || 0}</span>
                  </label>
                  {languagesWithCounts.map((lang) => (
                    <label key={lang.name} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="language"
                          checked={filters.language === lang.name}
                          onChange={() => updateFilter('language', lang.name)}
                          className="rounded-full border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className={`text-sm ${filters.language === lang.name ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {lang.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{lang.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Price Range
                  {filterStats?.priceRange && (
                    <span className="text-xs font-normal text-gray-400 ml-2">
                      (₹{filterStats.priceRange.min} - ₹{filterStats.priceRange.max})
                    </span>
                  )}
                </h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={range.min === filters.minPrice && range.max === filters.maxPrice}
                        onChange={() => handlePriceRange(range)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${currentPriceRange?.label === range.label ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Stats Info */}
              {filterStats?.priceRange && (
                <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <p>Average price: ₹{filterStats.priceRange.avg}</p>
                </div>
              )}
            </div>
          </div>

          {/* Book Grid */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 justify-between items-center">
              <div className="text-sm text-gray-500">
                Sort by:
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={handleSort}
                  className="ml-2 border-none text-gray-900 font-medium focus:ring-0 cursor-pointer text-sm bg-transparent"
                >
                  {sortOptions.map((opt) => (
                    <option key={`${opt.sortBy}-${opt.sortOrder}`} value={`${opt.sortBy}-${opt.sortOrder}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </div>
            </div>

            {/* Error State */}
            {isError && (
              <div className="text-center py-20 bg-white rounded-xl border border-red-200">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Error loading books</h3>
                <p className="text-gray-500 mb-6">{error?.message || 'Something went wrong. Please try again.'}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State with Skeletons */}
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Book Grid */}
            {!isLoading && !isError && books.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <BookCard key={book._id} book={book} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => updateFilter('page', String(pagination.page - 1))}
                      disabled={pagination.page <= 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let page;
                      if (pagination.pages <= 5) {
                        page = i + 1;
                      } else if (pagination.page <= 3) {
                        page = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        page = pagination.pages - 4 + i;
                      } else {
                        page = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => updateFilter('page', String(page))}
                          className={`w-10 h-10 rounded-lg ${pagination.page === page
                              ? 'bg-primary text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => updateFilter('page', String(pagination.page + 1))}
                      disabled={pagination.page >= pagination.pages}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && !isError && books.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No books found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;