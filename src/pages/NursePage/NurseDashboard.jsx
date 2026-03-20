import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bed, CalendarDays, FlaskConical, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import BASE_API from "../../api/baseurl.js";
import authService from "../../service/authService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";

const authHeader = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

function StatCard({ icon, label, value, color, to }) {
  const card = (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all"
    >
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}18` }}>
        {React.cloneElement(icon, { size: 26, color })}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function NurseDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ admissions: 0, todayAppts: 0, pendingLab: 0 });
  const [recentAppts, setRecentAppts] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const today = dayjs().format("YYYY-MM-DD");

        const [admRes, apptRes, labRes] = await Promise.allSettled([
          axios.get(`${BASE_API}/hms/admissions/admission`, { headers: authHeader(), params: { limit: 5, page: 1, status: "admitted" } }),
          axios.get(`${BASE_API}/hms/appointments/appointment`, { headers: authHeader(), params: { limit: 10, page: 1 } }),
          axios.get(`${BASE_API}/hms/laboratory/labtestorder/test/pending`, { headers: authHeader(), params: { limit: 1, page: 1 } }),
        ]);

        // Admissions count
        if (admRes.status === "fulfilled") {
          const d = admRes.value.data?.data;
          setStats(s => ({ ...s, admissions: d?.total ?? (Array.isArray(d?.data) ? d.data.length : 0) }));
        }

        // Appointments — count today + grab recent list
        if (apptRes.status === "fulfilled") {
          const rows = apptRes.value.data?.data?.data ?? apptRes.value.data?.data ?? [];
          const todayCount = rows.filter(a =>
            dayjs(a.scheduled_at).format("YYYY-MM-DD") === today
          ).length;
          setStats(s => ({ ...s, todayAppts: todayCount }));
          setRecentAppts(rows.slice(0, 8));
        }

        // Pending lab tests
        if (labRes.status === "fulfilled") {
          const d = labRes.value.data?.data;
          setStats(s => ({ ...s, pendingLab: d?.total ?? (Array.isArray(d?.data) ? d.data.length : 0) }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loading />
      </div>
    );
  }

  const statCards = [
    { label: "Total Admissions", value: stats.admissions, icon: <Bed />, color: "#6366f1", to: "/admissions" },
    { label: "Today's Appointments", value: stats.todayAppts, icon: <CalendarDays />, color: "#0ea5e9", to: "/appointment" },
    { label: "Pending Lab Tests", value: stats.pendingLab, icon: <FlaskConical />, color: "#f59e0b", to: null },
  ];

  const statusColor = (status) => {
    const map = {
      scheduled: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-600",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return map[status?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  };

  return (
    <motion.div
      className="p-4 sm:p-6 space-y-6"
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={slideUp} custom={0}>
        <h1 className="text-2xl font-bold text-gray-800">Nurse Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{dayjs().format("dddd, DD MMMM YYYY")}</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {statCards.map((s, i) => (
          <motion.div key={i} variants={slideUp} custom={i + 1}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Appointments */}
      <motion.div
        variants={slideUp}
        custom={4}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={16} className="text-[#506EE4]" />
            Recent Appointments
          </h2>
          <Link to="/appointment" className="text-xs text-[#506EE4] hover:underline">
            View All
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F6F7FF] text-[#475467] text-xs">
                <th className="px-4 py-3 text-left font-semibold">Patient</th>
                <th className="px-4 py-3 text-left font-semibold">Doctor</th>
                <th className="px-4 py-3 text-left font-semibold">Date & Time</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppts.length > 0 ? recentAppts.map((a, i) => (
                <tr key={a.id ?? i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User size={13} className="text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-800 text-xs">
                        {a.patient?.first_name ?? a.patient_name ?? "—"} {a.patient?.last_name ?? ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {a.doctor?.doctor_name ?? a.doctor_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {a.scheduled_at ? dayjs(a.scheduled_at).format("DD MMM YYYY, hh:mm A") : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 capitalize">
                    {a.appointment_type ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(a.status)}`}>
                      {a.status ?? "—"}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">No appointments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {recentAppts.length > 0 ? recentAppts.map((a, i) => (
            <div key={a.id ?? i} className="border border-gray-100 rounded-lg p-3 text-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-800">
                  {a.patient?.first_name ?? a.patient_name ?? "—"} {a.patient?.last_name ?? ""}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(a.status)}`}>
                  {a.status ?? "—"}
                </span>
              </div>
              <p className="text-gray-500">Dr. {a.doctor?.doctor_name ?? a.doctor_name ?? "—"}</p>
              <p className="text-gray-500 mt-0.5">
                {a.scheduled_at ? dayjs(a.scheduled_at).format("DD MMM YYYY, hh:mm A") : "—"}
              </p>
            </div>
          )) : (
            <p className="text-center text-gray-400 text-xs py-4">No appointments found</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
