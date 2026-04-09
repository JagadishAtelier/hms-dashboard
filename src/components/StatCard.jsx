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
<div className="bg-white rounded-lg shadow-sm p-4 w-full border border-gray-100 hover:shadow-md transition-all relative">
      {/* Top section */}
     <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}10` }}
          >
            {icon}
          </div>
         <div className="flex flex-col gap-1 w-full min-w-0">

  {/* Number + % */}
  <div className="flex items-center justify-between">
    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
      {formattedTotal}
    </p>

    {/* {percentage !== undefined && (
      <span
  className="text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2 flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {percentage}%
      </span>
    )} */}
  </div>

  {/* Title */}
  <p className="text-gray-400 text-xs sm:text-sm truncate">
    {title}
  </p>

</div>
        </div>
        
         {percentage !== undefined && (
          <span
 className="
  text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded
  lg:absolute lg:top-3 lg:right-2
  mt-1 lg:mt-0
"
  style={{ backgroundColor: color }}
          >
            {percentage}%
          </span>
        )} 
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4"></div>

      {/* Bottom section */}
      <div className="flex flex-wrap justify-between text-xs sm:text-sm text-gray-700 gap-2">
        <p>
          Active : <span className="font-semibold">{active}</span>
        </p>
        <span className="hidden sm:inline text-gray-300">|</span>
        <p>
          Inactive : <span className="font-semibold">{inactive}</span>
        </p>
      </div>
    </div>
  );
}
