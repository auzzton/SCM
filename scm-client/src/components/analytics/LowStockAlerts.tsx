'use client';

interface Product {
    id: string;
    name: string;
    quantity: number;
    minStockLevel: number;
}

interface LowStockAlertsProps {
    data: Product[];
}

export function LowStockAlerts({ data }: LowStockAlertsProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full bg-white p-4 rounded-lg shadow-sm flex flex-col">
                <h3 className="text-lg font-medium mb-4">Low Stock Alerts</h3>
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    All stock levels healthy
                </div>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-lg shadow-sm flex flex-col">
            <h3 className="text-lg font-medium mb-4 text-red-600">Low Stock Alerts</h3>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Product</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Stock</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Min</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((product) => (
                            <tr key={product.id}>
                                <td className="px-3 py-2 font-medium text-gray-900">{product.name}</td>
                                <td className="px-3 py-2 text-right text-red-600 font-bold">{product.quantity}</td>
                                <td className="px-3 py-2 text-right text-gray-500">{product.minStockLevel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
