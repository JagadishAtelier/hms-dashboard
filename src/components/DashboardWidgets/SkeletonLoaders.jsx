import React from 'react';

export const StatSkeleton = () => (
    <div className="p-6 rounded-xl border border-gray-100 shadow-sm bg-white animate-pulse">
      <div className="flex justify-between">
         <div className="w-2/3">
           <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
           <div className="h-6 bg-gray-200 rounded w-3/4"></div>
         </div>
         <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>
);

export const ChartSkeleton = ({ colSpan = 1 }) => {
    const colSpanClass = colSpan > 1 ? `lg:col-span-${colSpan}` : '';
    return (
      <div className={`p-6 rounded-xl border border-gray-100 shadow-sm bg-white animate-pulse ${colSpanClass}`}>
         <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
         <div className="h-64 bg-gray-100 rounded w-full"></div>
      </div>
    )
}

export const TableSkeleton = () => (
    <div className="p-6 rounded-xl border border-gray-100 shadow-sm bg-white animate-pulse w-full">
         <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
         <div className="space-y-4">
             {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-10 bg-gray-100 rounded w-full"></div>
             ))}
         </div>
    </div>
);
