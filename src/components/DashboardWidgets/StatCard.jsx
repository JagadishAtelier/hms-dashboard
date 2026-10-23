import React from 'react';

export default function StatCard({ title, value, icon, bgClass, trend }) {
  return (
    <div 
      data-slot="card" 
      className={`p-6 rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)] hover:shadow-md hover:border-slate-300/80 transition-all duration-200 ${bgClass || ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm text-slate-500 font-medium">{title}</h4>
          <h2 className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">{value}</h2>
          {trend && (
             <div className={`mt-2 text-xs font-semibold flex items-center gap-1 ${trend.positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}%
                <span className="text-slate-400 font-normal"> from last month</span>
             </div>
          )}
        </div>
        <div className="p-3 bg-slate-50/80 rounded-full shadow-xs border border-slate-100/90">
          {icon}
        </div>
      </div>
    </div>
  );
}
