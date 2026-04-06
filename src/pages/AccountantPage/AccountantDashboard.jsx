import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ReceiptText, Bed, CalendarDays, Users, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import billingService from "../../service/billingService.js";
import admissionsService from "../../service/addmissionsService.js";
import appointmentsService from "../../service/appointmentsService.js";
import patientService from "../../service/patientService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }),
};

function StatCard({ icon, label, value, sub, color, to }) {
  const card = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer">
      <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${color}18` }}>
        {React.cloneElement(icon, { size: 24, color })}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

const statusColor = (status) => {
  const map = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    partially_paid: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-600",
    prescriptions: "bg-purple-100 text-purple-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
};

export default function AccountantDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBilling: 0, totalRevenue: 0, pendingDue: 0,
    admissions: 0, appointments: 0, patients: 0,
  });
  const [recentBills, setRecentBills] = useState([]);
  const [recentAdmissions, setRecentAdmissions] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [billRes, admRes, apptRes, patRes] = await Promise.allSettled([
          billingService.getAll({ limit: 10, page: 1 }),
          admissionsService.getAllAdmissions({ limit: 5, page: 1 }),
          appointmentsService.getAllAppointments({ limit: 1, page: 1 }),
          patientService.getAllPatients({ limit: 1, page: 1 }),
        ]);

        if (billRes.status === "fulfilled") {
          const d = billRes.value?.data;
          const rows = Array.isArray(d?.data) ? d.data : [];
          const total = d?.total ?? rows.length;
          const revenue = rows.reduce((s, b) => s + parseFloat(b.paid_amount || 0), 0);
          const due = rows.reduce((s, b) => s + parseFloat(b.due_amount || 0), 0);
          setStats(s => ({ ...s, totalBilling: total, totalRevenue: revenue, pendingDue: due }));
          setRecentBills(rows.slice(0, 8));
        }

        if (admRes.status === "fulfilled") {
          const d = admRes.value?.data ?? admRes.value;
          const rows = Array.isArray(d?.data) ? d.data : [];
          setStats(s => ({ ...s, admissions: d?.total ?? rows.length }));
          setRecentAdmissions(rows.slice(0, 5));
        }

        if (apptRes.status === "fulfilled") {
          const d = apptRes.value?.data ?? apptRes.value;
          setStats(s => ({ ...s, appointments: d?.total ?? 0 }));
        }

        if (patRes.status === "fulfilled") {
          const d = patRes.value?.data ?? patRes.value;
          setStats(s => ({ ...s, patients: d?.total ?? 0 }));
        }
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><Loading /></div>;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Accountant Dashboard</h1>
        <p className="text-sm text-gray-500">Financial overview of the hospital</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: <ReceiptText />, label: "Total Bills", value: stats.totalBilling, color: "#506EE4", to: "/billing" },
          { icon: <TrendingUp />, label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: "#22c55e" },
          { icon: <Clock />, label: "Pending Due", value: `₹${stats.pendingDue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: "#f59e0b" },
          { icon: <Bed />, label: "Admissions", value: stats.admissions, color: "#8b5cf6", to: "/admissions" },
          { icon: <CalendarDays />, label: "Appointments", value: stats.appointments, color: "#06b6d4", to: "/appointment" },
          { icon: <Users />, label: "Patients", value: stats.patients, color: "#ec4899", to: "/patient-list" },
        ].map((s, i) => (
          <motion.div key={i} custom={i} variants={slideUp} initial="hidden" animate="visible">
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Billing */}
        <motion.div custom={6} variants={slideUp} initial="hidden" animate="visible"
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Recent Billing</h2>
            <Link to="/billing" className="text-xs text-[#506EE4] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Bill No", "Customer", "Amount", "Paid", "Due", "Status", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBills.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No billing records found.</td></tr>
                ) : recentBills.map(b => (
                  <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#506EE4]">{b.billing_no}</td>
                    <td className="px-4 py-3 text-gray-700">{b.customer_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">₹{parseFloat(b.total_amount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-green-600">₹{parseFloat(b.paid_amount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-red-500">₹{parseFloat(b.due_amount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor(b.status)}`}>
                        {b.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dayjs(b.billing_date).format("DD MMM YYYY")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Admissions */}
        <motion.div custom={7} variants={slideUp} initial="hidden" animate="visible"
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Recent Admissions</h2>
            <Link to="/admissions" className="text-xs text-[#506EE4] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAdmissions.length === 0 ? (
              <p className="py-8 text-center text-gray-400 text-sm">No admissions found.</p>
            ) : recentAdmissions.map(a => (
              <div key={a.id} className="px-5 py-3 hover:bg-gray-50">
                <p className="font-medium text-gray-800 text-sm">
                  {a.patient?.first_name} {a.patient?.last_name}
                </p>
                <p className="text-xs text-gray-500">{a.ward?.name || "—"} · {a.room?.room_number || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{dayjs(a.admission_date).format("DD MMM YYYY")}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
