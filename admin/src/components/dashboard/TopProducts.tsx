import { formatCurrency } from '@/lib/utils';
import type { Book } from '@/types';
import { TrendingUp } from 'lucide-react';

interface TopProductsProps {
    products: Array<{
        book: Book;
        soldCount: number;
        revenue: number;
    }>;
}

export function TopProducts({ products }: TopProductsProps) {
    return (
        <div className="rounded-xl border bg-[hsl(var(--card))] shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
                <div>
                    <h3 className="font-semibold">Top Selling Books</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Best performers this month
                    </p>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="divide-y">
                {products.length === 0 ? (
                    <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                        No data available
                    </div>
                ) : (
                    products.map((item, index) => (
                        <div
                            key={item.book._id}
                            className="flex items-center gap-4 p-4 transition-colors hover:bg-[hsl(var(--accent))/50]"
                        >
                            {/* Rank */}
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] font-semibold text-sm">
                                {index + 1}
                            </div>

                            {/* Book Image */}
                            <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded bg-[hsl(var(--muted))]">
                                {item.book.coverImage ? (
                                    <img
                                        src={item.book.coverImage}
                                        alt={item.book.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">
                                        📚
                                    </div>
                                )}
                            </div>

                            {/* Book Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.book.title}</p>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                                    by {item.book.author}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="text-right">
                                <p className="font-medium">{formatCurrency(item.revenue)}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                    {item.soldCount} sold
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
