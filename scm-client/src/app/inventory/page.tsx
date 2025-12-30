'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventory</h1>
                <Link
                    href="/inventory/new"
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </Link>
            </div>

            <div className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm">
                <Search className="mr-2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 border-none bg-transparent outline-none placeholder:text-gray-400 text-black"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : filteredProducts.map((product) => (
                            <tr key={product.id}>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">{product.sku}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">{product.category}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">{product.quantity}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">${product.price}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {product.quantity <= product.minStockLevel ? (
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                            Low Stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            In Stock
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/inventory/${product.id}`} className="text-blue-600 hover:text-blue-900">
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to delete this product?')) {
                                                    try {
                                                        await api.delete(`/products/${product.id}`);
                                                        setProducts(products.filter(p => p.id !== product.id));
                                                    } catch (err) {
                                                        console.error('Failed to delete product', err);
                                                        alert('Failed to delete product');
                                                    }
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900"
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
