import React from "react";

export default function StatCard({
  icon,
  title,
  total,
  percentage,
  active,
  inactive,
  color = "bg-blue-500",
}) {
  // Format currency if it's a revenue card
  const formattedTotal =
    title.toLowerCase().includes("revenue")
      ? `₹${total.toLocaleString("en-IN")}`
      : total.toLocaleString("en-IN");

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 w-full border border-gray-100 hover:shadow-md transition-all">
      {/* Top section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-14 w-14 flex items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formattedTotal}</p>
            <p className="text-gray-400 text-sm">{title}</p>
          </div>
        </div>
        {percentage !== undefined && (
          <span
            className="text-white text-xs mt-2 font-semibold px-2 py-1 rounded-sm"
            style={{ backgroundColor: color }}
          >
            {percentage}%
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4"></div>

      {/* Bottom section */}
      <div className="flex items-center justify-between text-sm text-gray-700">
        <p>
          Active : <span className="font-semibold">{active}</span>
        </p>
        <span className="text-gray-300">|</span>
        <p>
          Inactive : <span className="font-semibold">{inactive}</span>
        </p>
      </div>
    </div>
  );
}
