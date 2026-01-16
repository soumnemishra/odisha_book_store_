import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, getInitials } from '@/lib/utils';
import { useAuth, useTheme } from '@/context';
import {
    Bell,
    Search,
    Sun,
    Moon,
    Monitor,
    LogOut,
    User,
    ChevronDown,
    Settings,
    Menu,
} from 'lucide-react';

interface HeaderProps {
    sidebarCollapsed?: boolean;
    onMenuClick?: () => void;
}

export function Header({ sidebarCollapsed = false, onMenuClick }: HeaderProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const themeRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
                setShowThemeMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;

    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30 h-16 border-b transition-all duration-300',
                'bg-[hsl(var(--background))]/80 backdrop-blur-md border-[hsl(var(--border))]',
                sidebarCollapsed ? 'left-[68px]' : 'left-64'
            )}
        >
            <div className="flex h-full items-center justify-between px-6">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))] lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Search */}
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <input
                            type="text"
                            placeholder="Search products, orders, customers..."
                            className={cn(
                                'h-10 w-80 rounded-lg border bg-[hsl(var(--background))] pl-10 pr-4 text-sm',
                                'placeholder:text-[hsl(var(--muted-foreground))]',
                                'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
                                'transition-all focus:w-96'
                            )}
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-[hsl(var(--muted))] px-1.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <div ref={themeRef} className="relative">
                        <button
                            onClick={() => setShowThemeMenu(!showThemeMenu)}
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                                'hover:bg-[hsl(var(--accent))]'
                            )}
                        >
                            <ThemeIcon className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                        </button>

                        {showThemeMenu && (
                            <div className="absolute right-0 top-full mt-2 w-36 rounded-lg border bg-[hsl(var(--popover))] p-1 shadow-lg animate-fade-in">
                                {[
                                    { value: 'light', icon: Sun, label: 'Light' },
                                    { value: 'dark', icon: Moon, label: 'Dark' },
                                    { value: 'system', icon: Monitor, label: 'System' },
                                ].map(({ value, icon: Icon, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => {
                                            setTheme(value as 'light' | 'dark' | 'system');
                                            setShowThemeMenu(false);
                                        }}
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors',
                                            theme === value
                                                ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                                                : 'hover:bg-[hsl(var(--accent))]'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <div ref={notificationsRef} className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={cn(
                                'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                                'hover:bg-[hsl(var(--accent))]'
                            )}
                        >
                            <Bell className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                            </span>
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-[hsl(var(--popover))] shadow-lg animate-fade-in">
                                <div className="border-b p-4">
                                    <h3 className="font-semibold">Notifications</h3>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                        You have 3 unread notifications
                                    </p>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {[
                                        { title: 'New Order Received', desc: 'Order #12345 needs processing', time: '5m ago' },
                                        { title: 'Low Stock Alert', desc: '"The Alchemist" has only 2 copies left', time: '1h ago' },
                                        { title: 'Customer Review', desc: 'New 5-star review on "Sapiens"', time: '2h ago' },
                                    ].map((notification, i) => (
                                        <div
                                            key={i}
                                            className="flex gap-3 p-4 hover:bg-[hsl(var(--accent))] cursor-pointer transition-colors"
                                        >
                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                                                <Bell className="h-4 w-4 text-[hsl(var(--primary))]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{notification.title}</p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                    {notification.desc}
                                                </p>
                                                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                                                    {notification.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t p-2">
                                    <button className="w-full rounded-lg py-2 text-center text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="mx-2 h-8 w-px bg-[hsl(var(--border))]" />

                    {/* Profile Menu */}
                    <div ref={profileRef} className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors',
                                'hover:bg-[hsl(var(--accent))]'
                            )}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                                {user ? getInitials(user.name) : 'AD'}
                            </div>
                            <div className="hidden text-left md:block">
                                <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">Administrator</p>
                            </div>
                            <ChevronDown className="hidden h-4 w-4 text-[hsl(var(--muted-foreground))] md:block" />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-[hsl(var(--popover))] p-1 shadow-lg animate-fade-in">
                                <div className="border-b p-3">
                                    <p className="font-medium">{user?.name || 'Admin'}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                        {user?.email || 'admin@odishabookstore.com'}
                                    </p>
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={() => {
                                            navigate('/settings/profile');
                                            setShowProfileMenu(false);
                                        }}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-[hsl(var(--accent))]"
                                    >
                                        <User className="h-4 w-4" />
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/settings');
                                            setShowProfileMenu(false);
                                        }}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-[hsl(var(--accent))]"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </button>
                                </div>
                                <div className="border-t p-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
