import React from 'react';
import { cn, formatCurrency, formatNumber, calculatePercentageChange } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    previousValue?: number;
    prefix?: string;
    suffix?: string;
    icon: React.ReactNode;
    gradient: 'primary' | 'success' | 'warning' | 'danger';
    format?: 'currency' | 'number' | 'percentage';
}

const gradientClasses = {
    primary: 'from-blue-500 to-indigo-600',
    success: 'from-emerald-500 to-green-600',
    warning: 'from-amber-500 to-orange-600',
    danger: 'from-rose-500 to-red-600',
};

export function StatCard({
    title,
    value,
    previousValue,
    prefix = '',
    suffix = '',
    icon,
    gradient,
    format = 'number',
}: StatCardProps) {
    const percentageChange = previousValue !== undefined
        ? calculatePercentageChange(value, previousValue)
        : null;

    const formattedValue = () => {
        switch (format) {
            case 'currency':
                return formatCurrency(value);
            case 'percentage':
                return `${value.toFixed(1)}%`;
            default:
                return prefix + formatNumber(value) + suffix;
        }
    };

    const isPositive = percentageChange !== null && percentageChange >= 0;

    return (
        <div className="card-hover group relative overflow-hidden rounded-xl border bg-[hsl(var(--card))] p-6 shadow-sm">
            {/* Background gradient decoration */}
            <div
                className={cn(
                    'absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 transition-opacity group-hover:opacity-20',
                    gradientClasses[gradient]
                )}
            />

            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{formattedValue()}</p>

                    {percentageChange !== null && (
                        <div className="flex items-center gap-1.5">
                            <span
                                className={cn(
                                    'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                                    isPositive
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                )}
                            >
                                {isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {Math.abs(percentageChange).toFixed(1)}%
                            </span>
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">vs last month</span>
                        </div>
                    )}
                </div>

                {/* Icon */}
                <div
                    className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                        gradientClasses[gradient]
                    )}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
