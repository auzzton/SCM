'use client';

import OrderForm from '@/components/OrderForm';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateOrderPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        await api.post('/orders', data);
        router.push('/orders');
    };

    return (
        <OrderForm
            title="Create Purchase Order"
            submitLabel="Create Order"
            onSubmit={handleSubmit}
        />
    );
}
