'use client';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ProductPerformance {
    productName: string;
    revenue: number;
    profit: number;
    marginPercentage: number;
}

interface TopProductsChartProps {
    data: ProductPerformance[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Top Products by Revenue</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(val) => `$${val}`} />
                    <YAxis dataKey="productName" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number | undefined) => [value !== undefined ? `$${value}` : 'N/A', 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
