import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

export default function AdmittedPatientsChart({ admitted_day_wise = [] }) {
  const [viewMode, setViewMode] = useState("weekly"); // 'weekly' or 'monthly'

  // Helper: Group by week or month
  const groupedData = useMemo(() => {
    if (viewMode === "monthly") {
      const monthMap = {};
      admitted_day_wise.forEach((d) => {
        const month = new Date(d.date).toLocaleDateString("en-GB", { month: "short" });
        monthMap[month] = (monthMap[month] || 0) + d.count;
      });
      return Object.entries(monthMap).map(([month, count]) => ({ label: month, count }));
    } else {
      // Weekly view → group every 7 days
      const weekMap = {};
      admitted_day_wise.forEach((d) => {
        const date = new Date(d.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // start of week (Sunday)
        const weekKey = weekStart.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
        weekMap[weekKey] = (weekMap[weekKey] || 0) + d.count;
      });
      return Object.entries(weekMap).map(([week, count]) => ({ label: week, count }));
    }
  }, [admitted_day_wise, viewMode]);

  const labels = groupedData.map((d) => d.label);

  const data = {
    labels,
    datasets: [
      {
        label: `Admitted Patients (${viewMode === "weekly" ? "Weekly" : "Monthly"})`,
        data: groupedData.map((d) => d.count),
        borderColor: "rgba(79,70,229,0.85)",
        backgroundColor: "rgba(79,70,229,0.25)",
        fill: true,
        tension: 0.45,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 800,
      easing: "easeInOutQuart",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          color: "#4B5563",
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6B7280", font: { size: 11 } },
      },
      y: {
        grid: { color: "#F3F4F6" },
        ticks: { color: "#6B7280", stepSize: 10 },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col border border-gray-100 justify-between transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Admitted Patients Trend
        </h3>

        {/* Toggle Buttons */}
        <div className="flex items-center bg-gray-100 rounded-sm overflow-hidden">
          <button
            onClick={() => setViewMode("weekly")}
            className={`cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
              viewMode === "weekly"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
              viewMode === "monthly"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <Line data={data} options={options} height={130} />
    </div>
  );
}
