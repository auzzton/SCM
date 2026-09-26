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
        { name: 'Inventory',  href: '/inventory',  icon: Package,         roles: ['ADMIN', 'MANAGER', 'VIEWER'] },
        { name: 'Suppliers',  href: '/suppliers',  icon: Truck,           roles: ['ADMIN', 'MANAGER', 'VIEWER'] },
        { name: 'Orders',     href: '/orders',     icon: ShoppingCart,    roles: ['ADMIN', 'MANAGER'] },
        { name: 'Reports',    href: '/reports',    icon: BarChart,        roles: ['ADMIN', 'MANAGER'] },
        { name: 'Users',      href: '/users',      icon: Users,           roles: ['ADMIN'] },
    ];

    const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div
            className="flex h-screen flex-col justify-between w-64 relative overflow-hidden"
            style={{ background: 'var(--grad-sidebar)' }}
        >
            {/* Ambient glow orbs */}
            <div
                className="absolute top-[-60px] left-[-40px] w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, #9043d540 0%, transparent 70%)' }}
            />
            <div
                className="absolute bottom-20 right-[-30px] w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, #be74be30 0%, transparent 70%)' }}
            />

            {/* Top section */}
            <div className="px-4 py-6 relative z-10">
                {/* Logo */}
                <div className="mb-8 px-3">
                    <h1
                        className="text-2xl font-bold tracking-tight gradient-text"
                    >
                        NexSCM
                    </h1>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        Supply Chain Platform
                    </p>
                </div>

                {/* Nav label */}
                <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-3 px-3"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    Navigation
                </p>

                <nav className="flex flex-col gap-1">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'text-white shadow-lg'
                                        : 'text-[#b8a8d0] hover:text-white'
                                )}
                                style={isActive ? {
                                    background: 'linear-gradient(90deg, #9043d530 0%, #9a99e120 100%)',
                                    border: '1px solid #9a99e130',
                                } : {
                                    background: 'transparent',
                                    border: '1px solid transparent',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = '#9a99e110';
                                        (e.currentTarget as HTMLElement).style.border = '1px solid #9a99e115';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLElement).style.border = '1px solid transparent';
                                    }
                                }}
                            >
                                {/* Indicator dot for active */}
                                <span
                                    className="relative flex items-center justify-center"
                                >
                                    <Icon
                                        className="h-4 w-4 flex-shrink-0 transition-colors"
                                        style={{ color: isActive ? '#9a99e1' : 'inherit' }}
                                    />
                                    {isActive && (
                                        <span
                                            className="absolute inset-0 rounded-full blur-md opacity-60"
                                            style={{ background: '#9a99e1' }}
                                        />
                                    )}
                                </span>
                                {item.name}
                                {isActive && (
                                    <span
                                        className="ml-auto h-1.5 w-1.5 rounded-full"
                                        style={{ background: 'var(--grad-accent)' }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom section */}
            <div
                className="relative z-10 p-4"
                style={{ borderTop: '1px solid #2e2050' }}
            >
                <Link
                    href="/profile"
                    className={clsx(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1',
                        pathname === '/profile' ? 'text-white' : 'text-[#b8a8d0] hover:text-white hover:bg-[#9a99e110]'
                    )}
                    style={pathname === '/profile' ? {
                        background: 'linear-gradient(90deg, #9043d530 0%, #9a99e120 100%)',
                        border: '1px solid #9a99e130',
                    } : {}}
                >
                    <Settings className="h-4 w-4" style={{ color: pathname === '/profile' ? '#9a99e1' : 'inherit' }} />
                    Settings
                </Link>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-red-950/30"
                    style={{ color: '#e0607e' }}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>

                {/* User badge */}
                {user && (
                    <div
                        className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: '#1a133080', border: '1px solid #2e2050' }}
                    >
                        <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
                            style={{ background: 'var(--grad-primary)', color: '#fff' }}
                        >
                            {user.sub?.[0] ?? '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium" style={{ color: '#f0ecff' }}>{user.sub}</p>
                            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{user.role}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
