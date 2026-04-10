import React from 'react';

export default function StatCard({ title, value, icon, bgClass, trend }) {
  return (
    <div className={`p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${bgClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm text-gray-500 font-medium">{title}</h4>
          <h2 className="text-2xl font-bold mt-1 text-gray-800">{value}</h2>
          {trend && (
             <div className={`mt-2 text-xs font-semibold flex items-center gap-1 ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}%
                <span className="text-gray-400 font-normal"> from last month</span>
             </div>
          )}
        </div>
        <div className="p-3 bg-white/80 rounded-full shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}
