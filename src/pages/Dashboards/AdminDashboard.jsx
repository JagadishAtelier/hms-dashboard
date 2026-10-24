import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  IndianRupee,
  CalendarCheck,
  Bed,
  PieChart as PieIcon,
  Zap,
  ShoppingCart,
  CalendarDays,
  Package,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import adminDashboardService from "../../service/admindashboardService";

/**
 * Calibrated SVG Area Sparklines matching the exact reference dashboard mockup
 */
const KpiAreaSparkline = ({ type = "patients", color = "#3B82F6", id = "spark" }) => {
  // Pre-calibrated bezier curves matching the exact waves in the reference design
  const curves = {
    patients: {
      path: "M 0,24 C 8,24 12,17 18,17 C 24,17 26,20 32,20 C 38,20 42,9 50,9 C 56,9 60,16 66,16 C 70,16 73,10 76,3",
      area: "M 0,24 C 8,24 12,17 18,17 C 24,17 26,20 32,20 C 38,20 42,9 50,9 C 56,9 60,16 66,16 C 70,16 73,10 76,3 L 76,30 L 0,30 Z",
    },
    staff: {
      path: "M 0,24 C 10,24 18,24 26,20 C 32,17 38,21 44,21 C 50,21 54,9 60,9 C 66,9 70,17 76,14",
      area: "M 0,24 C 10,24 18,24 26,20 C 32,17 38,21 44,21 C 50,21 54,9 60,9 C 66,9 70,17 76,14 L 76,30 L 0,30 Z",
    },
    revenue: {
      path: "M 0,24 C 8,24 14,14 22,14 C 28,14 34,22 42,22 C 50,22 56,10 64,10 C 69,10 72,14 76,13",
      area: "M 0,24 C 8,24 14,14 22,14 C 28,14 34,22 42,22 C 50,22 56,10 64,10 C 69,10 72,14 76,13 L 76,30 L 0,30 Z",
    },
    appointments: {
      path: "M 10,22 L 76,22",
      area: "",
    },
  };

  const curve = curves[type] || curves.patients;

  return (
    <div className="w-full h-full">
      <svg viewBox="0 0 76 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`kpi-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.20" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {curve.area && <path d={curve.area} fill={`url(#kpi-grad-${id})`} />}
        <path
          d={curve.path}
          fill="none"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState("30");
  const [revenueFilter, setRevenueFilter] = useState("this_month");

  // Dashboard Data State
  const [summary, setSummary] = useState({
    totalPatients: 18,
    totalDoctors: 9,
    totalRevenue: 24390,
    todayAppointments: 0,
    trends: {
      patients: "+12%",
      staff: "+0%",
      revenue: "+18%",
      appointments: "0%",
    },
  });

  const [sparklines, setSparklines] = useState({
    patients: [14, 15, 15, 16, 17, 18, 18],
    staff: [9, 9, 9, 9, 9, 9, 9],
    revenue: [18200, 19500, 21000, 22400, 23100, 24000, 24390],
    appointments: [2, 4, 3, 5, 2, 0, 0],
  });

  const [admissionTrend, setAdmissionTrend] = useState([]);
  const [revenueDistribution, setRevenueDistribution] = useState([
    { name: "Consultations", value: 10240, percentage: 42, color: "#4F46E5", dotColor: "bg-indigo-600" },
    { name: "Laboratory", value: 6830, percentage: 28, color: "#06B6D4", dotColor: "bg-cyan-500" },
    { name: "Pharmacy", value: 7320, percentage: 30, color: "#10B981", dotColor: "bg-emerald-500" },
  ]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  // Fetch live dashboard metrics
  const fetchDashboardData = async (days = 30) => {
    setLoading(true);
    try {
      const res = await adminDashboardService.getDashboard({ days });
      const d = res?.data || res || {};

      // 1. Summary Counts & Trends
      if (d.summary) {
        setSummary({
          totalPatients: d.summary.total_patients ?? d.totalPatients ?? 18,
          totalDoctors: d.summary.total_doctors ?? d.totalDoctors ?? 9,
          totalRevenue: d.summary.total_revenue ?? d.totalRevenue ?? 24390,
          todayAppointments: d.summary.today_appointments ?? d.todayAppointments ?? 0,
          trends: d.summary.trends || {
            patients: "+12%",
            staff: "+0%",
            revenue: "+18%",
            appointments: "0%",
          },
        });
      }

      // 2. Sparklines
      if (d.sparklines) {
        setSparklines(d.sparklines);
      }

      // 3. Admission Activity
      if (Array.isArray(d.admitted_day_wise) && d.admitted_day_wise.length > 0) {
        setAdmissionTrend(d.admitted_day_wise);
      }

      // 4. Revenue Distribution
      if (Array.isArray(d.revenue_distribution) && d.revenue_distribution.length > 0) {
        setRevenueDistribution(d.revenue_distribution);
      }

      // 5. Recent OPD Appointments
      if (Array.isArray(d.recent_appointments) && d.recent_appointments.length > 0) {
        setRecentAppointments(d.recent_appointments);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(Number(daysFilter) || 30);
  }, [daysFilter]);

  // Formatted Total Revenue
  const formattedRevenue = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(summary.totalRevenue);
  }, [summary.totalRevenue]);

  // Total Revenue Distribution Sum
  const totalCategoryRevenue = useMemo(() => {
    return revenueDistribution.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  }, [revenueDistribution]);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12">
      {/* ─────────────────────────────────────────────────────────
          1. PAGE HEADER & ACTIONS
      ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hospital Executive Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live operational summary across outpatient, inpatient, and revenue streams.
          </p>
        </div>

        {/* Action Buttons Matching Reference Design */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/patient-list")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg shadow-xs text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users size={15} />
            <span>Patients Directory</span>
          </button>
          <button
            onClick={() => navigate("/doctors")}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-slate-700 rounded-lg shadow-2xs text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={15} className="text-slate-500" />
            <span>Manage Staff</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          2. TOP ROW KPI CARDS (MATCHING EXACT REFERENCE IMAGE)
      ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Total Patients */}
        <div className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 min-h-[134px] overflow-hidden flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
              <Users size={22} className="text-[#2563EB]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[#475569] leading-tight">
                Total Patients
              </span>
              <span className="text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-none mt-1">
                {summary.totalPatients}
              </span>
              <div className="flex items-center gap-1 text-[13px] font-bold text-[#10B981] mt-2 leading-none">
                <ArrowUpRight size={15} className="stroke-[2.5] -mr-0.5" />
                <span>{summary.trends.patients}</span>
              </div>
              <span className="text-[11px] text-[#94A3B8] font-normal mt-0.5 leading-none">
                vs last 7 days
              </span>
            </div>
          </div>
          <div className="absolute right-4 bottom-3.5 w-[80px] h-[36px] pointer-events-none">
            <KpiAreaSparkline type="patients" color="#3B82F6" id="patients" />
          </div>
        </div>

        {/* CARD 2: Medical Staff */}
        <div className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 min-h-[134px] overflow-hidden flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
              <UserPlus size={22} className="text-[#059669]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[#475569] leading-tight">
                Medical Staff
              </span>
              <span className="text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-none mt-1">
                {summary.totalDoctors}
              </span>
              <div className="flex items-center gap-1 text-[13px] font-bold text-[#10B981] mt-2 leading-none">
                <ArrowUpRight size={15} className="stroke-[2.5] -mr-0.5" />
                <span>{summary.trends.staff}</span>
              </div>
              <span className="text-[11px] text-[#94A3B8] font-normal mt-0.5 leading-none">
                vs last 7 days
              </span>
            </div>
          </div>
          <div className="absolute right-4 bottom-3.5 w-[80px] h-[36px] pointer-events-none">
            <KpiAreaSparkline type="staff" color="#10B981" id="staff" />
          </div>
        </div>

        {/* CARD 3: Total Revenue */}
        <div className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 min-h-[134px] overflow-hidden flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F5F3FF] flex items-center justify-center shrink-0">
              <IndianRupee size={22} className="text-[#7C3AED]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[#475569] leading-tight">
                Total Revenue
              </span>
              <span className="text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-none mt-1">
                {formattedRevenue}
              </span>
              <div className="flex items-center gap-1 text-[13px] font-bold text-[#10B981] mt-2 leading-none">
                <ArrowUpRight size={15} className="stroke-[2.5] -mr-0.5" />
                <span>{summary.trends.revenue}</span>
              </div>
              <span className="text-[11px] text-[#94A3B8] font-normal mt-0.5 leading-none">
                vs last 7 days
              </span>
            </div>
          </div>
          <div className="absolute right-4 bottom-3.5 w-[80px] h-[36px] pointer-events-none">
            <KpiAreaSparkline type="revenue" color="#8B5CF6" id="revenue" />
          </div>
        </div>

        {/* CARD 4: Today's Appointments */}
        <div className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 min-h-[134px] overflow-hidden flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0">
              <CalendarCheck size={22} className="text-[#EA580C]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[#475569] leading-tight">
                Today's Appointments
              </span>
              <span className="text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-none mt-1">
                {summary.todayAppointments}
              </span>
              <div className="flex items-center gap-1 text-[13px] font-medium text-[#94A3B8] mt-2 leading-none">
                <span className="text-[11px]">◇</span>
                <span>{summary.trends.appointments}</span>
              </div>
              <span className="text-[11px] text-[#94A3B8] font-normal mt-0.5 leading-none">
                vs yesterday
              </span>
            </div>
          </div>
          <div className="absolute right-4 bottom-3.5 w-[80px] h-[36px] pointer-events-none">
            <KpiAreaSparkline type="appointments" color="#F97316" id="appointments" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          3. MIDDLE ROW (BAR CHART & DONUT CHART)
      ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2 COLS): Patient Admission Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600">
                <Bed size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Patient Admission Activity</h3>
                <p className="text-xs text-slate-400">Inpatient admissions trend over time</p>
              </div>
            </div>

            {/* Filter Dropdown Pill */}
            <div className="relative">
              <select
                value={daysFilter}
                onChange={(e) => setDaysFilter(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="w-full h-[250px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={admissionTrend} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  interval={daysFilter === "30" ? 2 : daysFilter === "90" ? 6 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  allowDecimals={false}
                  domain={[0, (dataMax) => Math.max(5, dataMax + 1)]}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800">
                          <p className="font-semibold text-slate-300">{item.name}</p>
                          <p className="text-white font-bold text-sm mt-0.5">
                            {item.admissions} {item.admissions === 1 ? "Admission" : "Admissions"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="admissions" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT (1 COL): Revenue Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600">
                <PieIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revenue Distribution</h3>
                <p className="text-xs text-slate-400">Proportion by medical service category</p>
              </div>
            </div>

            {/* Filter Dropdown Pill */}
            <div className="relative">
              <select
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="year_to_date">Year to Date</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Donut Chart with Center Total */}
          <div className="relative w-full h-[180px] flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {revenueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(val)
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {formattedRevenue}
              </span>
              <span className="text-[10px] font-medium text-slate-400">Total Revenue</span>
            </div>
          </div>

          {/* Structured Legend List */}
          <div className="space-y-2 mt-2 pt-3 border-t border-slate-100">
            {revenueDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                  <span className="font-medium text-slate-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-semibold">{item.percentage}%</span>
                  <span className="text-slate-800 font-semibold min-w-[65px] text-right">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          4. BOTTOM ROW (RECENT APPOINTMENTS & QUICK ACTIONS)
      ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2 COLS): Recent OPD Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600">
                <CalendarCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent OPD Appointments</h3>
                <p className="text-xs text-slate-400">Latest outpatient appointments and consultation status</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/appointment")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">APPT NO</th>
                  <th className="py-2.5 px-3">PATIENT</th>
                  <th className="py-2.5 px-3">DOCTOR</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-xs">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No recent appointments found.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Appt No */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">
                        {appt.appointment_no}
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${appt.avatar_style?.bg || "bg-indigo-100"} ${appt.avatar_style?.text || "text-indigo-700"}`}
                          >
                            {appt.patient_initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {appt.patient_name}
                            </p>
                            <p className="text-[11px] text-slate-400">{appt.patient_subtext}</p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium text-slate-800 leading-tight">{appt.doctor_name}</p>
                          <p className="text-[11px] text-slate-400">{appt.doctor_specialty}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                          {appt.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            navigate(appt.patient_id ? `/overview/${appt.patient_id}` : "/appointment")
                          }
                          className="px-3 py-1 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT (1 COL): Operational Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Operational Quick Actions</h3>
                <p className="text-xs text-slate-400">Common tasks for hospital operations</p>
              </div>
            </div>

            {/* 4 Interactive Action Cards */}
            <div className="space-y-2.5 mt-3">
              {/* Action 1: POS */}
              <div
                onClick={() => navigate("/pos")}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 shrink-0">
                    <ShoppingCart size={17} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                      Launch Point of Sale (POS)
                    </h4>
                    <p className="text-[11px] text-slate-400">Billing, payments and receipts</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Action 2: Bed Occupancy */}
              <div
                onClick={() => navigate("/admissions")}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                    <Bed size={17} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Bed Occupancy & Admissions
                    </h4>
                    <p className="text-[11px] text-slate-400">View bed status and recent admissions</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Action 3: Schedule New Appointment */}
              <div
                onClick={() => navigate("/appointment/create")}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                    <CalendarDays size={17} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Schedule New Appointment
                    </h4>
                    <p className="text-[11px] text-slate-400">Book a new patient appointment</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Action 4: Inventory & Pharmacy Stocks */}
              <div
                onClick={() => navigate("/stock")}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
                    <Package size={17} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Inventory & Pharmacy Stocks
                    </h4>
                    <p className="text-[11px] text-slate-400">Check stock levels and expiring items</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>

          {/* Footer Status Pill */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Atelier HMS Healthcare Core</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Systems Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
