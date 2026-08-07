'use client';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface RevenueTrendChartProps {
    data: { [key: string]: number };
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
    const chartData = Object.entries(data).map(([date, revenue]) => ({
        date,
        revenue,
    }));

    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Revenue Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        formatter={(value: number | undefined) => [value !== undefined ? `$${value}` : 'N/A', 'Revenue']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
