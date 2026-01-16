import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Package,
    Eye,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    RefreshCw,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import { ordersApi } from '@/services/api';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <Clock className="h-3 w-3" />
    },
    confirmed: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <CheckCircle className="h-3 w-3" />
    },
    processing: {
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: <Package className="h-3 w-3" />
    },
    shipped: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <Truck className="h-3 w-3" />
    },
    delivered: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="h-3 w-3" />
    },
    cancelled: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: <XCircle className="h-3 w-3" />
    },
};

interface Order {
    _id: string;
    user: { name: string; email: string | null } | null;
    shippingAddress: { fullName: string; phone: string; street: string };
    orderItems: Array<{ title: string; quantity: number; price: number }>;
    totalPrice: number;
    shippingPrice: number;
    status: string;
    isPaid: boolean;
    createdAt: string;
}

export function OrdersPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState('');

    // Fetch orders
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['admin-orders', { search, status, page, limit }],
        queryFn: () => ordersApi.getAll({
            search,
            status: status !== 'all' ? status : undefined,
            page,
            limit,
        }),
    });

    const orders = (data?.data as Order[]) || [];
    const pagination = data?.pagination;

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            ordersApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            setSelectedOrder(null);
            setNewStatus('');
        },
    });

    const handleStatusChange = (orderId: string) => {
        if (newStatus && newStatus !== '') {
            updateStatusMutation.mutate({ id: orderId, status: newStatus });
        }
    };

    const getStatusConfig = (status: string) => {
        const normalizedStatus = status?.toLowerCase() || 'pending';
        return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Manage customer orders ({pagination?.total || 0} total)
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                        'border hover:bg-[hsl(var(--accent))] transition-colors'
                    )}
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
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
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className={cn(
                                'w-full rounded-lg border bg-transparent pl-10 pr-4 py-2 text-sm',
                                'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
                            )}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className={cn(
                            'rounded-lg border bg-transparent px-3 py-2 text-sm',
                            'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
                        )}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border bg-[hsl(var(--card))] shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
                        <p className="mt-2 text-[hsl(var(--muted-foreground))]">Loading orders...</p>
                    </div>
                ) : isError ? (
                    <div className="p-8 text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <p className="text-[hsl(var(--muted-foreground))]">Error loading orders</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
                        <h3 className="font-semibold mb-1">No orders found</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {search || status !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Orders will appear here when customers place them'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-[hsl(var(--muted))/50]">
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status);
                                        const isSelected = selectedOrder === order._id;

                                        return (
                                            <tr
                                                key={order._id}
                                                className="hover:bg-[hsl(var(--accent))/50] transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-sm font-medium">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {order.user?.name || order.shippingAddress?.fullName || 'Guest'}
                                                        </p>
                                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                            {order.shippingAddress?.phone || 'No phone'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-xs font-medium">
                                                        {order.orderItems?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {formatCurrency(order.totalPrice)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isSelected ? (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={newStatus}
                                                                onChange={(e) => setNewStatus(e.target.value)}
                                                                className="rounded border bg-transparent px-2 py-1 text-xs"
                                                                autoFocus
                                                            >
                                                                <option value="">Select...</option>
                                                                {STATUS_OPTIONS.filter(s => s.value !== 'all').map((s) => (
                                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={() => handleStatusChange(order._id)}
                                                                disabled={!newStatus || updateStatusMutation.isPending}
                                                                className="rounded bg-[hsl(var(--primary))] px-2 py-1 text-xs text-white disabled:opacity-50"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedOrder(null); setNewStatus(''); }}
                                                                className="rounded border px-2 py-1 text-xs"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setSelectedOrder(order._id); setNewStatus(order.status.toLowerCase()); }}
                                                            className={cn(
                                                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                                                                statusConfig.color,
                                                                'hover:opacity-80 transition-opacity'
                                                            )}
                                                        >
                                                            {statusConfig.icon}
                                                            {order.status}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                                                    {formatDateTime(order.createdAt)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => navigate(`/orders/${order._id}`)}
                                                        className="p-2 rounded-lg hover:bg-[hsl(var(--accent))]"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                                            page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[hsl(var(--accent))]'
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
                                            page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[hsl(var(--accent))]'
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
