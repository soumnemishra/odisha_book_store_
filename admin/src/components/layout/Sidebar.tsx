import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    BookOpen,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Package,
    Tags,
    Ticket,
    Store,
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
}

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: 'Products', href: '/products', icon: <BookOpen className="h-5 w-5" /> },
    { title: 'Orders', href: '/orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { title: 'Customers', href: '/customers', icon: <Users className="h-5 w-5" /> },
    { title: 'Inventory', href: '/inventory', icon: <Package className="h-5 w-5" /> },
];

const secondaryNavItems: NavItem[] = [
    { title: 'Categories', href: '/categories', icon: <Tags className="h-5 w-5" /> },
    { title: 'Coupons', href: '/coupons', icon: <Ticket className="h-5 w-5" /> },
    { title: 'Analytics', href: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { title: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300',
                'bg-[hsl(var(--sidebar-background))] border-[hsl(var(--sidebar-border))]',
                collapsed ? 'w-[68px]' : 'w-64',
                className
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-4">
                <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                        <Store className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="font-semibold text-[hsl(var(--sidebar-foreground))]">
                            Odisha Books
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1">
                    {mainNavItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                    'hover:bg-[hsl(var(--sidebar-accent))]',
                                    isActive
                                        ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                                        : 'text-[hsl(var(--sidebar-foreground))]',
                                    collapsed && 'justify-center px-2'
                                )
                            }
                        >
                            {item.icon}
                            {!collapsed && <span>{item.title}</span>}
                            {!collapsed && item.badge && (
                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs text-white">
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-[hsl(var(--sidebar-border))]" />

                {/* Secondary Nav */}
                <div className="space-y-1">
                    {!collapsed && (
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                            Settings
                        </p>
                    )}
                    {secondaryNavItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                    'hover:bg-[hsl(var(--sidebar-accent))]',
                                    isActive
                                        ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                                        : 'text-[hsl(var(--sidebar-foreground))]',
                                    collapsed && 'justify-center px-2'
                                )
                            }
                        >
                            {item.icon}
                            {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                    'absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full',
                    'bg-[hsl(var(--primary))] text-white shadow-md hover:bg-[hsl(var(--primary))]/90',
                    'transition-transform hover:scale-110'
                )}
            >
                {collapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                    <ChevronLeft className="h-3.5 w-3.5" />
                )}
            </button>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-[hsl(var(--sidebar-border))] p-3">
                <div
                    className={cn(
                        'flex items-center gap-3 rounded-lg bg-[hsl(var(--sidebar-accent))] p-2',
                        collapsed && 'justify-center'
                    )}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                        OB
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium text-[hsl(var(--sidebar-foreground))]">
                                Admin Panel
                            </p>
                            <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                                v1.0.0
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
