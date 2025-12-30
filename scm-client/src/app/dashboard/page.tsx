'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
    totalProducts: number;
    totalStockValue: number;
    pendingOrders: number;
    lowStockCount: number;
    totalOrders: number;
    totalSuppliers: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-6">Loading dashboard data...</div>;
    }

    if (!stats) {
        return <div className="p-6">Failed to load dashboard data.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Stock Value</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        ${stats.totalStockValue ? stats.totalStockValue.toLocaleString() : '0.00'}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
                    <p className={`mt-2 text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {stats.lowStockCount}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Suppliers</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                </div>
            </div>
        </div>
    );
}
