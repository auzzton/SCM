'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/types';
import { Plus, Search, Eye, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

export default function OrderPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
            setError('');
        } catch (error) {
            console.error('Failed to fetch orders', error);
            setError('Failed to load orders. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
                    {error}
                </div>
            )}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Purchase Orders</h1>
                <Link
                    href="/orders/new"
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Create Order
                </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : orders.map((order) => (
                            <tr key={order.id}>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                    {order.id.slice(0, 8)}...
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">{order.supplier?.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">${order.totalAmount}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={clsx(
                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                        statusColors[order.status]
                                    )}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        {/* Edit Button - Only for Pending Orders */}
                                        {order.status === 'PENDING' && (
                                            <Link
                                                href={`/orders/${order.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit Order"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        )}

                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to delete this order?')) {
                                                    try {
                                                        await api.delete(`/orders/${order.id}`);
                                                        setOrders(orders.filter(o => o.id !== order.id));
                                                    } catch (err) {
                                                        console.error('Failed to delete order', err);
                                                        alert('Failed to delete order');
                                                    }
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete Order"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
