'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/analytics/summary');
                setMetrics(res.data);
            } catch (err: any) {
                console.error("Failed to fetch analytics", err);
                setError("Failed to load reports. " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    if (!metrics) return null;

    // Chart Data Preparation
    const profitData = (metrics.topProducts || []).map((p: any) => ({
        name: p.productName,
        revenue: p.revenue,
        profit: p.profit,
        margin: p.marginPercentage
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financial Performance</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">${(metrics.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Gross Profit</p>
                    <p className={`mt-2 text-3xl font-bold ${(metrics.grossProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(metrics.grossProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Net Margin</p>
                    <p className={`mt-2 text-3xl font-bold ${(metrics.netMarginPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(metrics.netMarginPercentage || 0).toFixed(2)}%
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Inventory Valuation</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">${(metrics.inventoryValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products Revenue vs Profit */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Top Products: Profitability</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                                <Bar dataKey="revenue" fill="#cbd5e1" name="Revenue" />
                                <Bar dataKey="profit" fill="#16a34a" name="Profit" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Additional Metrics Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Product Performance Details</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prft. Margin</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(metrics.topProducts || []).map((p: any) => (
                                    <tr key={p.productName}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.productName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${p.revenue.toLocaleString()}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${p.marginPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {p.marginPercentage.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
