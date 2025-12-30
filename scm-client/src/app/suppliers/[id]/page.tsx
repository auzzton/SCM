'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    name: z.string().min(2, "Name is required"),
    contactInfo: z.string().min(2, "Contact Info is required"),
    address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                const res = await api.get(`/suppliers/${id}`);
                const supplier = res.data;
                reset({
                    name: supplier.name,
                    contactInfo: supplier.contactInfo,
                    address: supplier.address || ''
                });
            } catch (err) {
                console.error("Failed to load supplier", err);
                setError("Failed to load supplier details");
            } finally {
                setFetching(false);
            }
        };
        fetchSupplier();
    }, [id, reset]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError('');

        try {
            await api.put(`/suppliers/${id}`, data);
            router.push('/suppliers');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to update supplier.';
            setError(message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (fetching) return <div className="p-6">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Supplier</h1>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input {...register('name')} type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm" />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Info</label>
                        <input {...register('contactInfo')} type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm" />
                        {errors.contactInfo && <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea {...register('address')} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm" />
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
                            Update Supplier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
