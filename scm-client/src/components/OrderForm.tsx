'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '@/lib/api';
import { Product, Supplier } from '@/types';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderFormValues {
    supplierId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}

interface OrderFormProps {
    initialValues?: OrderFormValues;
    onSubmit: (data: OrderFormValues) => Promise<void>;
    isEditing?: boolean;
    title: string;
    submitLabel: string;
}

export default function OrderForm({ initialValues, onSubmit, isEditing = false, title, submitLabel }: OrderFormProps) {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, control, handleSubmit, watch, setValue, reset } = useForm<OrderFormValues>({
        defaultValues: initialValues || {
            supplierId: '',
            items: [{ productId: '', quantity: 1 }]
        }
    });

    // If initialValues changes (e.g. data loaded), reset form
    useEffect(() => {
        if (initialValues) {
            reset(initialValues);
        }
    }, [initialValues, reset]);

    const selectedSupplierId = watch('supplierId');

    // Fetch Suppliers
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const { data } = await api.get('/suppliers');
                setSuppliers(data);
            } catch (error) {
                console.error("Failed to load suppliers", error);
            }
        };
        fetchSuppliers();
    }, []);

    // Fetch Products when Supplier Changes
    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedSupplierId) {
                setProducts([]);
                return;
            }
            try {
                const { data } = await api.get(`/products?supplierId=${selectedSupplierId}`);
                setProducts(data);

                // If we are NOT editing, or (we ARE editing and the user CHANGED the supplier from the initial one),
                // then we might want to reset items.
                // But for simplicity/safety: only reset items if it's a manual change, not initial load.
                // However, distinguishing manual change is tricky without extra state.
                // A safe bet: if existing items have productIds that are NOT in the new list, they are invalid.
                // But for now, let's keep the original logic: reset if supplier changes.
                // BUT wait, this runs on mount too when initialValues sets supplierId.
                // We don't want to wipe out initial items.

                // Workaround: We only reset items if certain conditions are met, or we rely on user not changing supplier carelessly.
                // Better approach for Edit: 
                // Don't auto-reset items on effect if the items match the supplier?

            } catch (error) {
                console.error("Failed to load products", error);
            }
        };
        fetchProducts();
    }, [selectedSupplierId]);

    // Handle item reset on supplier switch MANUALLY?
    // The previous code had: setValue('items', ...) inside the effect. 
    // This is dangerous for Edit mode.
    // Let's modify: Only reset items if the *current* items are not valid for this supplier?
    // Or simpler: Just don't auto-reset in the effect. Let the user deal with it, or handle it in onChange of select.

    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setValue('supplierId', value);
        // Reset items when supplier is manually changed
        setValue('items', [{ productId: '', quantity: 1 }]);
    };


    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const handleFormSubmit = async (data: OrderFormValues) => {
        setIsLoading(true);
        setError('');
        try {
            await onSubmit(data);
        } catch (err: any) {
            console.error("Form submission failed", err);
            const message = err.response?.data?.message || "Operation failed";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 form-container">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                            onChange={handleSupplierChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                            disabled={isEditing} // Often good to disable supplier change in Edit to avoid complex validation
                        >
                            <option value="">Select a Supplier</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {isEditing && <p className="text-xs text-gray-500 mt-1">Supplier cannot be changed during edit.</p>}
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
                            {submitLabel}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
