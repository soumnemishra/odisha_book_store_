import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
    data: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="rounded-xl border bg-[hsl(var(--card))] p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">Revenue Overview</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Daily revenue for the selected period
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">Orders</span>
                    </div>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            dx={-10}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-[hsl(var(--popover))] p-3 shadow-lg">
                                            <p className="mb-2 font-medium">{label}</p>
                                            {payload.map((entry, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <div
                                                        className="h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: entry.color }}
                                                    />
                                                    <span className="text-[hsl(var(--muted-foreground))]">
                                                        {entry.name}:
                                                    </span>
                                                    <span className="font-medium">
                                                        {entry.name === 'Revenue'
                                                            ? formatCurrency(entry.value as number)
                                                            : entry.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                        />
                        <Area
                            type="monotone"
                            dataKey="orders"
                            name="Orders"
                            stroke="hsl(var(--chart-2))"
                            strokeWidth={2}
                            fill="url(#ordersGradient)"
                            yAxisId={0}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
