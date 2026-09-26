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

// Gradient left-border accent colors from the palette
const CARD_ACCENTS = [
    { gradient: 'linear-gradient(135deg, #9043d520 0%, #9a99e110 100%)', bar: '#9043d5' },
    { gradient: 'linear-gradient(135deg, #9a99e120 0%, #c7a3d210 100%)', bar: '#9a99e1' },
    { gradient: 'linear-gradient(135deg, #be74be20 0%, #c7a3d210 100%)', bar: '#be74be' },
    { gradient: 'linear-gradient(135deg, #008bd020 0%, #9a99e110 100%)', bar: '#008bd0' },
];

const SECONDARY_ACCENTS = ['#9043d5', '#9a99e1', '#be74be', '#c7a3d2'];

const CARD_BASE = {
    border: '1px solid #2e2050',
    borderRadius: '12px',
};

const SECONDARY_CARD_BASE = {
    background: 'linear-gradient(135deg, #1a1330cc 0%, #2e2050aa 100%)',
    border: '1px solid #2e2050',
    borderRadius: '12px',
};

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
        return (
            <div className="p-6 flex items-center gap-3" style={{ color: '#9085ab' }}>
                <div
                    className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#9a99e1', borderTopColor: 'transparent' }}
                />
                Loading dashboard…
            </div>
        );
    }

    if (!stats || !analytics) {
        return <div className="p-6" style={{ color: '#e0607e' }}>Failed to load dashboard data.</div>;
    }

    const primaryMetrics = [
        { label: 'Total Revenue',    value: `$${analytics.finance.totalRevenue ? analytics.finance.totalRevenue.toLocaleString() : '0.00'}` },
        { label: 'Gross Profit',     value: `$${analytics.finance.grossProfit ? analytics.finance.grossProfit.toLocaleString() : '0.00'}` },
        { label: 'Total Stock Value',value: `$${stats.totalStockValue ? stats.totalStockValue.toLocaleString() : '0.00'}` },
        { label: 'Avg Order Value',  value: `$${analytics.finance.averageOrderValue ? analytics.finance.averageOrderValue.toLocaleString() : '0.00'}` },
    ];

    const secondaryMetrics = [
        { label: 'Total Products',  value: stats.totalProducts },
        { label: 'Pending Orders',  value: stats.pendingOrders },
        { label: 'Total Orders',    value: stats.totalOrders },
        { label: 'Total Suppliers', value: stats.totalSuppliers },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#f0ecff' }}>Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: '#9085ab' }}>Supply chain overview</p>
            </div>

            {/* Primary Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {primaryMetrics.map((metric, i) => (
                    <div
                        key={metric.label}
                        className="p-5 relative overflow-hidden"
                        style={{
                            ...CARD_BASE,
                            background: CARD_ACCENTS[i].gradient,
                        }}
                    >
                        {/* Left accent bar */}
                        <div
                            className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full"
                            style={{ background: CARD_ACCENTS[i].bar }}
                        />
                        <p className="text-xs font-medium mb-2 ml-3" style={{ color: '#9085ab' }}>
                            {metric.label}
                        </p>
                        <p className="text-2xl font-bold ml-3" style={{ color: '#f0ecff' }}>
                            {metric.value}
                        </p>
                        {/* Ambient glow */}
                        <div
                            className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${CARD_ACCENTS[i].bar}20 0%, transparent 70%)` }}
                        />
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 lg:grid-cols-2">
                <RevenueTrendChart data={analytics.trends} />
                <TopProductsChart data={analytics.finance.topProducts || []} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 lg:grid-cols-2">
                <CategoryDistributionChart data={analytics.categories} />
                <LowStockAlerts data={analytics.lowStock} />
            </div>

            {/* Secondary Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                {secondaryMetrics.map((metric, i) => (
                    <div key={metric.label} className="p-5" style={SECONDARY_CARD_BASE}>
                        <p className="text-xs font-medium mb-2" style={{ color: '#9085ab' }}>
                            {metric.label}
                        </p>
                        <p className="text-2xl font-bold" style={{ color: SECONDARY_ACCENTS[i] }}>
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
