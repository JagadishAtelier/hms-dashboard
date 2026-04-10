import React from 'react';

export default function ChartCard({ title, subtitle, children, colSpan = 1 }) {
  // A helper dynamic class for spanning multiple columns on large screens
  const colSpanClass = colSpan > 1 ? `lg:col-span-${colSpan}` : '';
  
  return (
    <div className={`bg-white p-5 rounded-lg shadow-sm w-full ${colSpanClass}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
           <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
           {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="h-72 w-full flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}
