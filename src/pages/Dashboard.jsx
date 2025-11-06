import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  BedDouble,
  ChevronDown,
  ArrowUpCircle,
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import RecentActivities from "./RecentActivities";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const chartRef = useRef(null);

  // ✅ Doughnut Chart Data
  const data1 = {
    labels: ["Critical (20%)", "High Priority (30%)", "Moderate (40%)", "Low Priority (10%)"],
    datasets: [
      {
        data: [34, 76, 120, 24],
        backgroundColor: ["#7EA6F4", "#A8C5F9", "#C9DAFB", "#E8F0FF"],
        borderWidth: 2,
        borderColor: "#fff",
        spacing: 4,
        hoverOffset: 10,
      },
    ],
  };

  const options1 = {
    cutout: "60%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 20,
          boxHeight: 20,
          borderRadius: 10,
          padding: 15,
          color: "#333",
          font: { size: 14, weight: "500" },
        },
      },
    },
    maintainAspectRatio: false,
  };

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // ✅ Line Chart Data
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"],
    datasets: [
      {
        label: "Admitted Patients",
        data: [50, 70, 65, 90, 80, 85, 60],
        fill: true,
        borderColor: "#4F46E5",
        tension: 0.4,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(79,70,229,0.3)");
          gradient.addColorStop(1, "rgba(79,70,229,0)");
          return gradient;
        },
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { display: false } },
      y: { grid: { display: false }, ticks: { display: false } },
    },
  };

  // ✅ Light & Clean Stat Cards
  const stats = [
    {
      title: "Total Revenue",
      value: "$245,000",
      icon: <DollarSign size={26} className="text-indigo-500" />,
      bg: "bg-indigo-10",
    },
    {
      title: "Total Appointments",
      value: "1,280",
      icon: <Calendar size={26} className="text-green-500" />,
      bg: "bg-green-50",
    },
    {
      title: "Active Patients",
      value: "765",
      icon: <Users size={26} className="text-purple-500" />,
      bg: "bg-purple-50",
    },
    {
      title: "Available Beds",
      value: "54",
      icon: <BedDouble size={26} className="text-orange-500" />,
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Overview (Quick Stats)</h1>

      {/* ✅ 4 Light Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-gray-500 font-medium">{stat.title}</h4>
                <h2 className="text-2xl font-bold mt-1 text-gray-800">{stat.value}</h2>
              </div>
              <div className="p-3 bg-white rounded-full shadow-sm">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Chart Section */}
      <div className="flex lg:flex-row md:flex-row flex-col justify-between gap-5">
        {/* Line Chart */}
        <div className="bg-white p-5 rounded-lg shadow-sm lg:w-1/2 md:w-1/2 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Admitted Patients</h3>
            <div className="flex items-center border p-2 rounded-md text-sm text-gray-500">
              <span>Month</span>
              <ChevronDown size={16} />
            </div>
          </div>
          <div className="flex gap-5 items-center">
            <div className="text-2xl font-bold text-gray-800">560</div>
            <p className="text-sm text-gray-500">This month</p>
          </div>
          <div className="h-70 w-full">
            <Line data={data} options={options} className="py-5" />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-5 rounded-lg shadow-sm lg:w-1/2 md:w-1/2 h-100 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Patients Category</h3>
            <div className="flex items-center border p-2 rounded-md text-sm text-gray-500">
              <span>Month</span>
              <ChevronDown size={16} />
            </div>
          </div>
          <div className="relative w-90 h-90">
            <Doughnut ref={chartRef} data={data1} options={options1} />
            <div className="absolute top-40 left-12 w-1/4 text-center font-semibold text-gray-600">
              100% Data Recorded
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Recent Activities Section */}
      <RecentActivities />
    </div>
  );
}
