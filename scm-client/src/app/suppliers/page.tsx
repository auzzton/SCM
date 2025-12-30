'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Supplier } from '@/types';
import { Plus, Search, Trash2, Edit, Truck } from 'lucide-react';
import Link from 'next/link';

export default function SupplierPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            setSuppliers(res.data);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contactInfo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Suppliers</h1>
                <Link
                    href="/suppliers/new"
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Supplier
                </Link>
            </div>

            <div className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm">
                <Search className="mr-2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search suppliers..."
                    className="flex-1 border-none bg-transparent outline-none placeholder:text-gray-400 text-black"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="text-center col-span-full">Loading...</p>
                ) : filteredSuppliers.map((supplier) => (
                    <div key={supplier.id} className="relative flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
                                <p className="text-sm text-gray-500">{supplier.contactInfo}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 line-clamp-2">{supplier.address}</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                            <Link href={`/suppliers/${supplier.id}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                                <Edit className="h-4 w-4" /> Edit
                            </Link>
                            <button
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete this supplier?')) {
                                        try {
                                            await api.delete(`/suppliers/${supplier.id}`);
                                            setSuppliers(suppliers.filter(s => s.id !== supplier.id));
                                        } catch (err) {
                                            console.error('Failed to delete supplier', err);
                                            alert('Failed to delete supplier');
                                        }
                                    }
                                }}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
