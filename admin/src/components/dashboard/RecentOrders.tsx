import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { ORDER_STATUS_CONFIG } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { Eye, MoreHorizontal } from 'lucide-react';

interface RecentOrdersProps {
    orders: Order[];
    onViewOrder?: (orderId: string) => void;
}

export function RecentOrders({ orders, onViewOrder }: RecentOrdersProps) {
    return (
        <div className="rounded-xl border bg-[hsl(var(--card))] shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
                <div>
                    <h3 className="font-semibold">Recent Orders</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Latest customer orders
                    </p>
                </div>
                <button className="text-sm font-medium text-[hsl(var(--primary))] hover:underline">
                    View all
                </button>
            </div>

            <div className="divide-y">
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                        No recent orders
                    </div>
                ) : (
                    orders.map((order) => {
                        const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus];
                        const customerName = typeof order.user === 'object'
                            ? order.user.name
                            : order.shippingAddress?.fullName || 'Unknown Customer';

                        return (
                            <div
                                key={order._id}
                                className="flex items-center gap-4 p-4 transition-colors hover:bg-[hsl(var(--accent))/50]"
                            >
                                {/* Order ID & Customer */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                                        {customerName}
                                    </p>
                                </div>

                                {/* Items count */}
                                <div className="hidden sm:block text-center">
                                    <p className="font-medium">{order.orderItems?.length || 0}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Items</p>
                                </div>

                                {/* Total */}
                                <div className="text-right">
                                    <p className="font-medium">{formatCurrency(order.totalPrice)}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                        {formatRelativeTime(order.createdAt)}
                                    </p>
                                </div>

                                {/* Status */}
                                <span
                                    className={cn(
                                        'hidden md:inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                                        statusConfig?.color || 'bg-gray-100 text-gray-800'
                                    )}
                                >
                                    {statusConfig?.label || order.status}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onViewOrder?.(order._id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))]"
                                    >
                                        <Eye className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    </button>
                                    <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))]">
                                        <MoreHorizontal className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
