'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Product, Supplier } from '@/types';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface OrderFormValues {
    supplierId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}

export default function CreateOrderPage() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch Suppliers and Products first
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [suppliersRes, productsRes] = await Promise.all([
                    api.get('/suppliers'),
                    api.get('/products')
                ]);
                setSuppliers(suppliersRes.data);
                setProducts(productsRes.data);
            } catch (error) {
                console.error("Failed to load data", error);
            }
        };
        fetchData();
    }, []);

    const { register, control, handleSubmit, watch, setValue } = useForm<OrderFormValues>({
        defaultValues: {
            supplierId: '',
            items: [{ productId: '', quantity: 1 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // Optional: Filter products by selected supplier? 
    // For now, allow picking any product, but ideally should be linked.

    const onSubmit = async (data: OrderFormValues) => {
        setIsLoading(true);
        try {
            await api.post('/orders', data);
            router.push('/orders');
        } catch (err: any) {
            console.error("Order creation failed", err);
            const message = err.response?.data?.message || "Failed to create order";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 form-container">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Purchase Order</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Supplier Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                        <select
                            {...register('supplierId', { required: true })}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                        >
                            <option value="">Select a Supplier</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Product Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Items</h3>
                            <button
                                type="button"
                                onClick={() => append({ productId: '', quantity: 1 })}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                                <Plus className="h-4 w-4" /> Add Item
                            </button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-md">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500">Product</label>
                                    <select
                                        {...register(`items.${index}.productId` as const, { required: true })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm text-black"
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-medium text-gray-500">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        {...register(`items.${index}.quantity` as const, { required: true, min: 1 })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm text-black"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
                            Create Order
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
