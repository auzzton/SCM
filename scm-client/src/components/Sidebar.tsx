'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
    LayoutDashboard,
    Package,
    Truck,
    ShoppingCart,
    BarChart,
    Users,
    Settings,
    LogOut
} from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'VIEWER'] },
        { name: 'Inventory', href: '/inventory', icon: Package, roles: ['ADMIN', 'MANAGER', 'VIEWER'] },
        { name: 'Suppliers', href: '/suppliers', icon: Truck, roles: ['ADMIN', 'MANAGER', 'VIEWER'] },
        { name: 'Orders', href: '/orders', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER'] },
        { name: 'Reports', href: '/reports', icon: BarChart, roles: ['ADMIN', 'MANAGER'] },
        { name: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
    ];

    const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="flex h-screen flex-col justify-between border-r bg-gray-900 text-white w-64">
            <div className="px-4 py-6">
                <h1 className="text-2xl font-bold mb-8 text-center text-blue-400">NexSCM</h1>
                <nav className="flex flex-col gap-2">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-800',
                                    isActive ? 'bg-gray-800 text-blue-400 font-medium' : 'text-gray-400'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-gray-800 p-4">
                <Link
                    href="/profile"
                    className={clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 mb-2 hover:bg-gray-800 text-gray-400",
                        pathname === '/profile' && "bg-gray-800 text-blue-400"
                    )}
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </Link>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 hover:bg-gray-800 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
