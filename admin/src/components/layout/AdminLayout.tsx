import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Sidebar */}
            <Sidebar />

            {/* Header */}
            <Header
                sidebarCollapsed={sidebarCollapsed}
                onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <main
                className={cn(
                    'min-h-screen pt-16 transition-all duration-300',
                    sidebarCollapsed ? 'pl-[68px]' : 'pl-64'
                )}
            >
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
