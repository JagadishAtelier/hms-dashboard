import React, { useEffect, useState } from "react";
import {
  DollarSign,
  BedDouble,
  Activity,
  Users,
  Calendar,
  TestTubeDiagonal,
  Pill,
  BriefcaseMedical,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import adminDashboardService from "../../service/admindashboardService";
import StatCard from "@/components/StatCard";
import { Link } from "react-router-dom";
import AdmittedPatientsChart from "@/components/ui/AdmittedPatientsChart";
import ChartPieDonutActive from "@/components/ChartPieDonutActive";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
      <div className="p-4 space-y-8 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 rounded"></div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className="bg-white shadow-sm p-5 rounded-xl flex items-center justify-between border-l-4 border-gray-200"
              >
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                </div>
                <div className="p-3 bg-gray-100 rounded-full h-10 w-10"></div>
              </div>
            ))}
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-100 rounded mb-2"></div>
          <div className="space-y-2">
            {Array(5)
              .fill()
              .map((_, i) => (
                <div key={i} className="h-6 bg-gray-100 rounded"></div>
              ))}
          </div>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 text-lg">
        No dashboard data found
      </div>
    );

  const { summary, admitted_day_wise, recent_admitted } = data;

  // ✅ Stat Cards Data
  const stats = [
    {
      title: "Total Patients",
      total: 284,
      percentage: 1.2,
      active: 254,
      inactive: 30,
      icon: <Users size={30} color="#2563EB" />, // blue-600 hex
      color: "#2563EB", // used for badge background
    },
    {
      title: "Lab Revenue",
      total: 5000,
      percentage: 0.8,
      active: 40,
      inactive: 10,
      icon: <TestTubeDiagonal size={30} color="#EA580C" />, // orange-600 hex
      color: "#EA580C",
    },
    {
      title: "Doctor Revenue",
      total: 12000,
      percentage: 2.5,
      active: 80,
      inactive: 20,
      icon: <BriefcaseMedical size={30} color="#16A34A" />, // green-600 hex
      color: "#16A34A",
    },
    {
      title: "Pharma Revenue",
      total: 7800,
      percentage: 1.1,
      active: 55,
      inactive: 12,
      icon: <Pill size={30} color="#9333EA" />, // purple-600 hex
      color: "#9333EA",
    },
  ];

  return (
    <div className="p-2 space-y-8">
      {/* ✅ Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Admin Dashboard
          </h1>

          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="text-right">
          <Link
            to="/patients/create"
            className="text-sm bg-[#506EE4] cursor-pointer py-2 px-3 text-white shadow-sm rounded-sm ml-2"
          >
            Add Patient
          </Link>
          <Link
            to="/admission/create"
            className="text-sm bg-[#E9EDF4] cursor-pointer py-2 px-3 text-gray-700 shadow-sm rounded-sm ml-2"
          >
            Add Admission
          </Link>
        </div>
      </div>

      {/* ✅ Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <StatCard
            key={i}
            icon={s.icon}
            title={s.title}
            total={s.total}
            percentage={s.percentage}
            active={s.active}
            inactive={s.inactive}
            color={s.color}
          />
        ))}
      </div>

      {/* ✅ Bar Chart Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-10 gap-6 ">
        <div className="lg:col-span-7">
          <AdmittedPatientsChart admitted_day_wise={admitted_day_wise} />
        </div>
        <div className="lg:col-span-3">
          <ChartPieDonutActive
            data={[
              { label: "Male", value: 140, fill: "#6366f1" },
              { label: "Female", value: 110, fill: "#a5b4fc" },
              { label: "Children", value: 50, fill: "#c7d2fe" },
            ]}
          />
        </div>
      </div>

      {/* ✅ Recent Admissions Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Admissions
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button className="cursor-pointer flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition">
              All Wards
            </button>
            <button className="cursor-pointer flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition">
              All Status
            </button>
          </div>
        </div>

        {/* Table */}
        {recent_admitted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="py-3 px-4 text-left font-semibold">ID</th>
                  <th className="py-3 px-4 text-left font-semibold">Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Ward</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Admission Date
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent_admitted.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 transition-all duration-150"
                  >
                    <td className="py-3 px-4 text-gray-600">
                      {item.patient.patient_code}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={
                          item.patient.avatar ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj8LgZC5q9DKpw9Ueip9qKZM7I3A_1H0WyiA&s"
                        }
                        alt={item.patient.first_name}
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <span className="font-medium text-gray-800">
                        {item.patient.first_name} {item.patient.last_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {item.ward || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(item.admission_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-2 text-xs font-semibold rounded-full ${
                          item.status === "admitted"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.status === "admitted" ? "Admitted" : "Discharged"}
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

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
          <p>Showing {recent_admitted.length} Entries</p>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100">
              Prev
            </button>
            <button className="px-3 py-1 cursor-pointer bg-blue-600 text-white rounded-md">
              1
            </button>
            <button className="px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100">
              2
            </button>
            <button className="px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
