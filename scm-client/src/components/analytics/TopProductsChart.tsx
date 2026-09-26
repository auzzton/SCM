'use client';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface ProductPerformance {
    productName: string;
    revenue: number;
    profit: number;
    marginPercentage: number;
}

interface TopProductsChartProps {
    data: ProductPerformance[];
}

// Gradient bar colors cycling through the palette
const BAR_COLORS = ['#9043d5', '#9a99e1', '#be74be', '#c7a3d2', '#4d3f72'];

const CHART_STYLE = {
    background: 'linear-gradient(135deg, #1a1330cc 0%, #2e2050aa 100%)',
    border: '1px solid #2e2050',
    borderRadius: '12px',
};

export function TopProductsChart({ data }: TopProductsChartProps) {
    return (
        <div className="h-[300px] w-full p-4" style={CHART_STYLE}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0ecff' }}>
                Top Products
                <span className="ml-2 text-xs font-normal" style={{ color: '#9085ab' }}>by revenue</span>
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2e2050" />
                    <XAxis
                        type="number"
                        tickFormatter={(val) => `$${val}`}
                        tick={{ fontSize: 11, fill: '#9085ab' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        dataKey="productName"
                        type="category"
                        width={100}
                        tick={{ fontSize: 11, fill: '#b8a8d0' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(value: number | undefined) => [value !== undefined ? `$${value}` : 'N/A', 'Revenue']}
                        contentStyle={{
                            background: '#1a1330ee',
                            border: '1px solid #2e2050',
                            borderRadius: '8px',
                            color: '#f0ecff',
                            fontSize: '12px',
                        }}
                        cursor={{ fill: '#9a99e108' }}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
