import React, { useEffect, useState } from "react";
import {
  DollarSign,
  BedDouble,
  Activity,
  Users,
  Calendar,
  TestTubeDiagonal
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import adminDashboardService from "../../service/admindashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminDashboardService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        Loading dashboard...
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 text-lg">
        No dashboard data found
      </div>
    );

  const { summary, admitted_day_wise, recent_admitted } = data;

  // ✅ Line Chart Configuration
  const lineData = {
    labels: admitted_day_wise.map((d) =>
      new Date(d.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })
    ),
    datasets: [
      {
        label: "Admitted Patients (Day-wise)",
        data: admitted_day_wise.map((d) => d.count),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79,70,229,0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true } },
    },
  };

  // ✅ Helper for Currency Formatting
  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  // ✅ Stat Cards Data
  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary.total_revenue),
      icon: <DollarSign size={26} className="text-blue-600" />,
      border: "border-blue-500",
    },
    {
      title: "Doctor Revenue",
      value: formatCurrency(summary.doctor_revenue),
      icon: <Users size={26} className="text-green-600" />,
      border: "border-green-500",
    },
    {
      title: "Lab Revenue",
      value: formatCurrency(summary.lab_revenue),
      icon: <TestTubeDiagonal size={26} className="text-orange-600" />,
      border: "border-orange-500",
    },
    {
      title: "Pharmacy Revenue",
      value: formatCurrency(summary.pharmacy_revenue),
      icon: <BedDouble size={26} className="text-purple-600" />,
      border: "border-purple-500",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* ✅ Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Admin Dashboard Overview
      </h1>

      {/* ✅ Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-white border-l-4 ${s.border} shadow-sm p-5 rounded-xl flex items-center justify-between hover:shadow-md transition-all`}
          >
            <div>
              <h4 className="text-gray-500 text-sm font-medium">{s.title}</h4>
              <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-full shadow-sm">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* ✅ Line Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Admitted Patients Trend
          </h3>
        </div>
        <Line data={lineData} options={lineOptions} />
      </div>

      {/* ✅ Recent Admissions Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700">
            Recent Admissions
          </h3>
        </div>

        {recent_admitted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 text-gray-600 text-sm font-semibold">
                    Patient Name
                  </th>
                  <th className="text-left py-2 px-3 text-gray-600 text-sm font-semibold">
                    Patient Code
                  </th>
                  <th className="text-left py-2 px-3 text-gray-600 text-sm font-semibold">
                    Admission Date
                  </th>
                  <th className="text-left py-2 px-3 text-gray-600 text-sm font-semibold">
                    Reason
                  </th>
                  <th className="text-left py-2 px-3 text-gray-600 text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent_admitted.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition-all"
                  >
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {item.patient.first_name} {item.patient.last_name}
                    </td>
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {item.patient.patient_code}
                    </td>
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {new Date(item.admission_date).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {item.reason || "-"}
                    </td>
                    <td className="py-2 px-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === "admitted"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-6">
            No recent admissions found
          </div>
        )}
      </div>
    </div>
  );
}
