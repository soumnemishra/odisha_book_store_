import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';
import { StatCard, RevenueChart, RecentOrders, TopProducts } from '@/components/dashboard';
import { dashboardApi } from '@/services/api';
import { cn } from '@/lib/utils';

export function DashboardPage() {
    const navigate = useNavigate();

    // Fetch real dashboard data from API
    const {
        data: stats,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000, // Consider data stale after 30 seconds
    });

    const handleViewOrder = (orderId: string) => {
        navigate(`/orders/${orderId}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Loading your store data...</p>
                </div>

                {/* Loading skeletons */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 rounded-xl border bg-[hsl(var(--card))] animate-pulse">
                            <div className="p-6 space-y-3">
                                <div className="h-4 w-24 bg-[hsl(var(--muted))] rounded" />
                                <div className="h-8 w-32 bg-[hsl(var(--muted))] rounded" />
                                <div className="h-4 w-20 bg-[hsl(var(--muted))] rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-96 rounded-xl border bg-[hsl(var(--card))] animate-pulse" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Unable to load dashboard data</p>
                </div>

                <div className="rounded-xl border bg-[hsl(var(--card))] p-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Error Loading Data</h3>
                    <p className="text-[hsl(var(--muted-foreground))] mb-4">
                        {(error as Error)?.message || 'Something went wrong while fetching dashboard data.'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-lg px-4 py-2',
                            'bg-[hsl(var(--primary))] text-white hover:opacity-90'
                        )}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Real-time overview of your bookstore performance
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                        'border hover:bg-[hsl(var(--accent))] transition-colors'
                    )}
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={stats?.totalRevenue || 0}
                    previousValue={
                        stats?.revenueChange !== undefined
                            ? (stats.totalRevenue / (1 + stats.revenueChange / 100))
                            : undefined
                    }
                    format="currency"
                    icon={<DollarSign className="h-5 w-5" />}
                    gradient="primary"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    previousValue={
                        stats?.ordersChange !== undefined
                            ? Math.round(stats.totalOrders / (1 + stats.ordersChange / 100))
                            : undefined
                    }
                    icon={<ShoppingCart className="h-5 w-5" />}
                    gradient="success"
                />
                <StatCard
                    title="Total Customers"
                    value={stats?.totalCustomers || 0}
                    previousValue={
                        stats?.customersChange !== undefined
                            ? Math.round(stats.totalCustomers / (1 + stats.customersChange / 100))
                            : undefined
                    }
                    icon={<Users className="h-5 w-5" />}
                    gradient="warning"
                />
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts || 0}
                    previousValue={stats?.productsChange !== undefined
                        ? Math.round(stats.totalProducts / (1 + stats.productsChange / 100))
                        : undefined
                    }
                    icon={<Package className="h-5 w-5" />}
                    gradient="danger"
                />
            </div>

            {/* Charts Row */}
            <RevenueChart data={stats?.revenueChart || []} />

            {/* Orders & Products Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RecentOrders
                    orders={stats?.recentOrders || []}
                    onViewOrder={handleViewOrder}
                />
                <TopProducts products={stats?.topProducts || []} />
            </div>

            {/* Quick Stats Footer */}
            {stats?.salesByCategory && stats.salesByCategory.length > 0 && (
                <div className="rounded-xl border bg-[hsl(var(--card))] p-6">
                    <h3 className="font-semibold mb-4">Sales by Category</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {stats.salesByCategory.slice(0, 6).map((cat: { category: string; sales: number; count: number }) => (
                            <div
                                key={cat.category}
                                className="flex items-center justify-between rounded-lg bg-[hsl(var(--accent))] p-3"
                            >
                                <div>
                                    <p className="font-medium">{cat.category}</p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        {cat.count} items sold
                                    </p>
                                </div>
                                <p className="font-semibold text-[hsl(var(--primary))]">
                                    ₹{cat.sales.toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
