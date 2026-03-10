import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { passFailRatioData } from '../mockData';

const PassFailRatioChart: React.FC = () => {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-slate-700 mb-2 px-2">14. Pass vs Fail Ratio</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={passFailRatioData}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            labelLine={false}
                            label={({ percent }: any) => `${((percent || 0) * 100).toFixed(0)}%`}
                            animationDuration={1000}
                        >
                            {passFailRatioData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [`${value}%`, 'Percentage']}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PassFailRatioChart;
