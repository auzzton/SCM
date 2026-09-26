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

const CARD_STYLE = {
    background: 'linear-gradient(135deg, #1a1330cc 0%, #2e2050aa 100%)',
    border: '1px solid #2e2050',
    borderRadius: '12px',
};

export function LowStockAlerts({ data }: LowStockAlertsProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full p-4 flex flex-col" style={CARD_STYLE}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0ecff' }}>
                    Low Stock Alerts
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        style={{ background: '#1e1535', border: '1px solid #2e2050' }}
                    >
                        ✓
                    </div>
                    <p className="text-sm" style={{ color: '#9085ab' }}>All stock levels healthy</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full p-4 flex flex-col" style={CARD_STYLE}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#f0ecff' }}>
                <span
                    className="inline-block h-2 w-2 rounded-full animate-pulse"
                    style={{ background: '#e0607e' }}
                />
                Low Stock Alerts
                <span
                    className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full"
                    style={{ background: '#3d0a1a80', color: '#f48fb1', border: '1px solid #e0607e30' }}
                >
                    {data.length} items
                </span>
            </h3>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-xs">
                    <thead className="sticky top-0" style={{ background: '#1a1330' }}>
                        <tr>
                            <th
                                className="px-3 py-2 text-left font-medium tracking-wide uppercase text-[10px]"
                                style={{ color: '#9085ab' }}
                            >
                                Product
                            </th>
                            <th
                                className="px-3 py-2 text-right font-medium tracking-wide uppercase text-[10px]"
                                style={{ color: '#9085ab' }}
                            >
                                Stock
                            </th>
                            <th
                                className="px-3 py-2 text-right font-medium tracking-wide uppercase text-[10px]"
                                style={{ color: '#9085ab' }}
                            >
                                Min
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((product, i) => (
                            <tr
                                key={product.id}
                                style={{
                                    borderTop: i > 0 ? '1px solid #2e2050' : 'none',
                                }}
                            >
                                <td className="px-3 py-2 font-medium" style={{ color: '#f0ecff' }}>
                                    {product.name}
                                </td>
                                <td
                                    className="px-3 py-2 text-right font-bold"
                                    style={{ color: '#e0607e' }}
                                >
                                    {product.quantity}
                                </td>
                                <td
                                    className="px-3 py-2 text-right"
                                    style={{ color: '#9085ab' }}
                                >
                                    {product.minStockLevel}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
