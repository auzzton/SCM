'use client';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface RevenueTrendChartProps {
    data: { [key: string]: number };
}

const CHART_STYLE = {
    background: 'linear-gradient(135deg, #1a1330cc 0%, #2e2050aa 100%)',
    border: '1px solid #2e2050',
    borderRadius: '12px',
};

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
    const chartData = Object.entries(data).map(([date, revenue]) => ({
        date,
        revenue,
    }));

    return (
        <div className="h-[300px] w-full p-4" style={CHART_STYLE}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0ecff' }}>
                Revenue Trend
                <span className="ml-2 text-xs font-normal" style={{ color: '#9085ab' }}>Last 30 days</span>
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%"   stopColor="#9a99e1" />
                            <stop offset="100%" stopColor="#be74be" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2e2050" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#9085ab' }}
                        axisLine={{ stroke: '#2e2050' }}
                        tickLine={false}
                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#9085ab' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#1a1330ee',
                            border: '1px solid #2e2050',
                            borderRadius: '8px',
                            color: '#f0ecff',
                            fontSize: '12px',
                        }}
                        formatter={(value: number | undefined) => [value !== undefined ? `$${value}` : 'N/A', 'Revenue']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="url(#lineGradient)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4, fill: '#9a99e1', strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
