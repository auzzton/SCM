'use client';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryDistributionChartProps {
    data: { name: string; value: number }[];
}

// Purple/violet gradient palette derived from the reference image
const COLORS = [
    '#9a99e1', // periwinkle
    '#9043d5', // electric purple
    '#be74be', // mauve pink
    '#c7a3d2', // soft lavender
    '#4d3f72', // dark violet
    '#008bd0', // sky blue accent
    '#682179', // deep magenta
    '#5f1194', // rich purple
];

const CHART_STYLE = {
    background: 'linear-gradient(135deg, #1a1330cc 0%, #2e2050aa 100%)',
    border: '1px solid #2e2050',
    borderRadius: '12px',
};

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
    return (
        <div className="h-[300px] w-full p-4" style={CHART_STYLE}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#f0ecff' }}>
                Category Distribution
                <span className="ml-2 text-xs font-normal" style={{ color: '#9085ab' }}>by value</span>
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="48%"
                        label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                        labelLine={{ stroke: '#2e2050' }}
                        outerRadius={80}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                opacity={0.9}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: '#1a1330ee',
                            border: '1px solid #2e2050',
                            borderRadius: '8px',
                            color: '#f0ecff',
                            fontSize: '12px',
                        }}
                    />
                    <Legend
                        formatter={(value) => (
                            <span style={{ color: '#b8a8d0', fontSize: '11px' }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
