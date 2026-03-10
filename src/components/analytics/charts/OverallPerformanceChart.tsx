import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { overallPerformanceData } from '../mockData';

const OverallPerformanceChart: React.FC = () => {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-slate-700 mb-2 px-2">3. Overall Performance</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={overallPerformanceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            animationDuration={1000}
                        >
                            {overallPerformanceData.map((entry, index) => (
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

export default OverallPerformanceChart;
