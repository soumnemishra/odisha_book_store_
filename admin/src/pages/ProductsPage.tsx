import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    Package,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { booksApi } from '@/services/api';

interface Book {
    _id: string;
    title: string;
    author: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    category: string;
    stock: number;
    coverImage: string;
    language: string;
    rating: number;
    createdAt: string;
}

export function ProductsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Filter state
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [language, setLanguage] = useState('');
    const [lowStock, setLowStock] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    const handleSearchChange = (value: string) => {
        setSearch(value);
        const timeout = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
        return () => clearTimeout(timeout);
    };

    // Fetch books
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-books', { search: debouncedSearch, category, language, lowStock, page, limit, sortBy, sortOrder }],
        queryFn: () => booksApi.getAll({
            search: debouncedSearch,
            category,
            page,
            limit,
            sortBy,
            sortOrder,
            ...(lowStock && { lowStock: 'true' }),
            ...(language && { language }),
        }),
    });

    const books = (data?.data as unknown as Book[]) || [];
    const pagination = data?.pagination;
    const filters = (data as any)?.filters;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => booksApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-books'] });
        },
    });

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const getStockBadgeClass = (stock: number) => {
        if (stock === 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (stock <= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Manage your book inventory ({pagination?.total || 0} total)
                    </p>
                </div>
                <button
                    onClick={() => navigate('/products/new')}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
                        'bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-xl border bg-[hsl(var(--card))] p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <input
                            type="text"
                            placeholder="Search by title, author, ISBN..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className={cn(
                                'w-full rounded-lg border bg-transparent pl-10 pr-4 py-2 text-sm',
                                'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
                            )}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                        className={cn(
                            'rounded-lg border bg-transparent px-3 py-2 text-sm',
                            'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
                        )}
                    >
                        <option value="">All Categories</option>
                        {filters?.categories?.map((cat: string) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Language Filter */}
                    <select
                        value={language}
                        onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
                        className={cn(
                            'rounded-lg border bg-transparent px-3 py-2 text-sm',
                            'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
                        )}
                    >
                        <option value="">All Languages</option>
                        {filters?.languages?.map((lang: string) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>

                    {/* Low Stock Toggle */}
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={lowStock}
                            onChange={(e) => { setLowStock(e.target.checked); setPage(1); }}
                            className="h-4 w-4 rounded border-[hsl(var(--border))]"
                        />
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Low Stock
                    </label>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-[hsl(var(--card))] shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
                        <p className="mt-2 text-[hsl(var(--muted-foreground))]">Loading products...</p>
                    </div>
                ) : isError ? (
                    <div className="p-8 text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <p className="text-[hsl(var(--muted-foreground))]">Error loading products</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
                        <h3 className="font-semibold mb-1">No products found</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {search || category || lowStock
                                ? 'Try adjusting your filters'
                                : 'Add your first product to get started'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-[hsl(var(--muted))/50]">
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-[hsl(var(--primary))]"
                                            onClick={() => handleSort('category')}
                                        >
                                            Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-[hsl(var(--primary))]"
                                            onClick={() => handleSort('price.original')}
                                        >
                                            Price {sortBy === 'price.original' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-[hsl(var(--primary))]"
                                            onClick={() => handleSort('stock')}
                                        >
                                            Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                            Language
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {books.map((book) => (
                                        <tr
                                            key={book._id}
                                            className="hover:bg-[hsl(var(--accent))/50] transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded bg-[hsl(var(--muted))]">
                                                        {book.coverImage ? (
                                                            <img
                                                                src={book.coverImage}
                                                                alt={book.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs">
                                                                📚
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate max-w-[200px]">{book.title}</p>
                                                        <p className="text-sm text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">
                                                            by {book.author}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex rounded-full bg-[hsl(var(--accent))] px-2 py-1 text-xs font-medium">
                                                    {book.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div>
                                                    <p className="font-medium">{formatCurrency(book.price)}</p>
                                                    {book.discountPercent > 0 && (
                                                        <p className="text-xs text-[hsl(var(--muted-foreground))] line-through">
                                                            {formatCurrency(book.originalPrice)}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn(
                                                    'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                                    getStockBadgeClass(book.stock)
                                                )}>
                                                    {book.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm">
                                                {book.language}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => navigate(`/products/${book._id}`)}
                                                        className="p-2 rounded-lg hover:bg-[hsl(var(--accent))]"
                                                        title="View"
                                                    >
                                                        <Eye className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/products/${book._id}/edit`)}
                                                        className="p-2 rounded-lg hover:bg-[hsl(var(--accent))]"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(book._id, book.title)}
                                                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                                                        title="Delete"
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className={cn(
                                            'p-2 rounded-lg border transition-colors',
                                            page === 1
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-[hsl(var(--accent))]'
                                        )}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-medium">
                                        Page {page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                        disabled={page === pagination.pages}
                                        className={cn(
                                            'p-2 rounded-lg border transition-colors',
                                            page === pagination.pages
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-[hsl(var(--accent))]'
                                        )}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
