import React from 'react';

export default function ChartCard({ title, subtitle, children, colSpan = 1 }) {
  // A helper dynamic class for spanning multiple columns on large screens
  const colSpanClass = colSpan > 1 ? `lg:col-span-${colSpan}` : '';
  
  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow duration-200 w-full ${colSpanClass}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
           <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
           {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="h-72 w-full flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}
