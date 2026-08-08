'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RevenueTrendChart } from '@/components/analytics/RevenueTrendChart';
import { CategoryDistributionChart } from '@/components/analytics/CategoryDistributionChart';
import { TopProductsChart } from '@/components/analytics/TopProductsChart';
import { LowStockAlerts } from '@/components/analytics/LowStockAlerts';

interface DashboardStats {
    totalProducts: number;
    totalStockValue: number;
    pendingOrders: number;
    lowStockCount: number;
    totalOrders: number;
    totalSuppliers: number;
}

interface AnalyticsData {
    trends: { [key: string]: number };
    categories: { name: string; value: number }[];
    lowStock: any[];
    finance: any;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, trendsRes, catsRes, lowStockRes, financeRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/analytics/trends?days=30'),
                    api.get('/analytics/categories'),
                    api.get('/analytics/inventory/low-stock'),
                    api.get('/analytics/summary')
                ]);

                setStats(statsRes.data);
                setAnalytics({
                    trends: trendsRes.data,
                    categories: catsRes.data,
                    lowStock: lowStockRes.data,
                    finance: financeRes.data
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-6">Loading dashboard data...</div>;
    }

    if (!stats || !analytics) {
        return <div className="p-6">Failed to load dashboard data.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>

            {/* Key Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        ${analytics.finance.totalRevenue ? analytics.finance.totalRevenue.toLocaleString() : '0.00'}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-500">Gross Profit</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        ${analytics.finance.grossProfit ? analytics.finance.grossProfit.toLocaleString() : '0.00'}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-yellow-500">
                    <h3 className="text-sm font-medium text-gray-500">Total Stock Value</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        ${stats.totalStockValue ? stats.totalStockValue.toLocaleString() : '0.00'}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-purple-500">
                    <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        ${analytics.finance.averageOrderValue ? analytics.finance.averageOrderValue.toLocaleString() : '0.00'}
                    </p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RevenueTrendChart data={analytics.trends} />
                <TopProductsChart data={analytics.finance.topProducts || []} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-2">
                <CategoryDistributionChart data={analytics.categories} />
                <LowStockAlerts data={analytics.lowStock} />
            </div>

            {/* Secondary Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
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
