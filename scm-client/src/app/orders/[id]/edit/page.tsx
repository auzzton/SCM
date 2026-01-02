'use client';

import { useEffect, useState } from 'react';
import OrderForm from '@/components/OrderForm';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function EditOrderPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);

                // Transform API data to Form values
                const values = {
                    supplierId: data.supplier.id, // Assuming supplier object returned
                    items: data.items.map((item: any) => ({
                        productId: item.product.id, // Assuming product object returned in item
                        quantity: item.quantity
                    }))
                };

                setInitialValues(values);
            } catch (error) {
                console.error("Failed to load order", error);
                alert("Failed to load order details");
                router.push('/orders');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id, router]);

    const handleSubmit = async (data: any) => {
        await api.put(`/orders/${id}`, data);
        router.push('/orders');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <OrderForm
            title="Edit Purchase Order"
            submitLabel="Update Order"
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isEditing={true}
        />
    );
}
