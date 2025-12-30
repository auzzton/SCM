'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Supplier } from '@/types';

const schema = z.object({
    name: z.string().min(2, "Name is required"),
    sku: z.string().min(2, "SKU is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    quantity: z.number().int().min(0),
    minStockLevel: z.number().int().min(0),
    supplierId: z.string().min(1, "Supplier is required"),
});

type FormData = z.infer<typeof schema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [suppliersRes, productRes] = await Promise.all([
                    api.get('/suppliers'),
                    api.get(`/products/${id}`)
                ]);
                setSuppliers(suppliersRes.data);

                const product = productRes.data;
                reset({
                    name: product.name,
                    sku: product.sku,
                    description: product.description || '',
                    price: product.price,
                    quantity: product.quantity,
                    minStockLevel: product.minStockLevel,
                    supplierId: product.supplier?.id || ''
                });
            } catch (err) {
                console.error("Failed to load data", err);
                setError("Failed to load product details");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, reset]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError('');

        const payload = {
            name: data.name,
            sku: data.sku,
            description: data.description,
            price: data.price,
            quantity: data.quantity,
            minStockLevel: data.minStockLevel,
            supplier: { id: data.supplierId }
        };

        try {
            await api.put(`/products/${id}`, payload);
            router.push('/inventory');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to update product.';
            setError(message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (fetching) return <div className="p-6">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Product</h1>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input {...register('name')} type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm" />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SKU</label>
                            <input {...register('sku')} type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm" />
                            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input
                                {...register('price', { valueAsNumber: true })}
                                type="number" step="0.01"
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm"
                            />
                            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input {...register('quantity', { valueAsNumber: true })} type="number" className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Min Stock Level</label>
                            <input {...register('minStockLevel', { valueAsNumber: true })} type="number" className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                        <select
                            {...register('supplierId')}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm"
                        >
                            <option value="">Select a Supplier</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {errors.supplierId && <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
                            Update Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
