'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/analytics/summary');
                setStats(res.data);
            } catch (err: any) {
                console.error("Failed to fetch analytics", err);
                setError("Failed to load reports. " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    const chartData = [
        { name: 'Suppliers', value: stats.totalSuppliers },
        { name: 'Products', value: stats.totalProducts },
        { name: 'Orders', value: stats.totalOrders },
        { name: 'Users', value: stats.totalUsers },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports & Analytics</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Products in Stock</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Active Suppliers</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-6">System Overview</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
