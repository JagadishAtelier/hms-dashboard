import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBasket, Package, ClipboardCheck, Clock, User, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import productService from "../../service/productService.js";
import stockService from "../../service/stockService.js";
import prescriptionService from "../../service/prescriptionService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

function StatCard({ icon, label, value, color, to }) {
  const card = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all">
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

const statusColor = (status) => {
  const map = {
    draft: "bg-gray-100 text-gray-600",
    active: "bg-blue-100 text-blue-700",
    dispensed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
  };
  return map[status?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
};

export default function PharmacistDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, stock: 0, pending: 0 });
  const [recentRx, setRecentRx] = useState([]);
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [prodRes, stockRes, rxRes] = await Promise.allSettled([
          productService.getAll({ page: 1, limit: 1 }),
          stockService.getAll({ page: 1, limit: 1 }),
          prescriptionService.getAllPrescriptions({ page: 1, limit: 10, sort_order: "DESC" }),
        ]);

        if (prodRes.status === "fulfilled") {
          const d = prodRes.value?.data?.data ?? prodRes.value?.data ?? prodRes.value;
          setStats(s => ({ ...s, products: d?.total ?? (Array.isArray(d?.data) ? d.data.length : 0) }));
        }

        if (stockRes.status === "fulfilled") {
          const d = stockRes.value?.data?.data ?? stockRes.value?.data ?? stockRes.value;
          setStats(s => ({ ...s, stock: d?.total ?? (Array.isArray(d?.data) ? d.data.length : 0) }));
        }

        if (rxRes.status === "fulfilled") {
          const d = rxRes.value?.data?.data ?? rxRes.value?.data ?? rxRes.value;
          const rows = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
          const pendingCount = rows.filter(r => r.status === "active" || r.status === "draft").length;
          setStats(s => ({ ...s, pending: pendingCount }));
          setRecentRx(rows.slice(0, 8));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-[80vh]"><Loading /></div>;
  }

  const statCards = [
    { label: "Total Products", value: stats.products, icon: <ShoppingBasket />, color: "#6366f1", to: "/product" },
    { label: "Stock Items", value: stats.stock, icon: <Package />, color: "#0ea5e9", to: "/stock" },
    { label: "Pending Prescriptions", value: stats.pending, icon: <ClipboardCheck />, color: "#f59e0b", to: "/prescription" },
  ];

  return (
    <motion.div className="p-4 sm:p-6 space-y-6" initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={slideUp} custom={0}>
        <h1 className="text-2xl font-bold text-gray-800">Pharmacist Dashboard</h1>
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

      {/* Recent Prescriptions */}
      <motion.div
        variants={slideUp}
        custom={4}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={16} className="text-[#506EE4]" />
            Recent Prescriptions
          </h2>
          <Link to="/prescription" className="text-xs text-[#506EE4] hover:underline">View All</Link>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F6F7FF] text-[#475467] text-xs">
                <th className="px-4 py-3 text-left font-semibold">Patient</th>
                <th className="px-4 py-3 text-left font-semibold">Doctor</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Items</th>
                <th className="px-4 py-3 text-left font-semibold">Total</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRx.length > 0 ? recentRx.map((rx, i) => (
                <tr key={rx.id ?? i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User size={13} className="text-indigo-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-800">
                        {rx.patient?.first_name ?? rx.patient_name ?? "—"} {rx.patient?.last_name ?? ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {rx.doctor?.doctor_name ?? rx.doctor_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {rx.prescription_date ? dayjs(rx.prescription_date).format("DD MMM YYYY") : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {Array.isArray(rx.items) ? rx.items.length : rx.med_count ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    ₹{rx.total_amount ?? rx.grand_total ?? "0"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(rx.status)}`}>
                      {rx.status ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewModal(rx)}
                      className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600 transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">No prescriptions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {recentRx.length > 0 ? recentRx.map((rx, i) => (
            <div key={rx.id ?? i} className="border border-gray-100 rounded-lg p-3 text-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-800">
                  {rx.patient?.first_name ?? rx.patient_name ?? "—"} {rx.patient?.last_name ?? ""}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(rx.status)}`}>
                  {rx.status ?? "—"}
                </span>
              </div>
              <p className="text-gray-500">Dr. {rx.doctor?.doctor_name ?? rx.doctor_name ?? "—"}</p>
              <div className="flex justify-between mt-1">
                <p className="text-gray-500">{rx.prescription_date ? dayjs(rx.prescription_date).format("DD MMM YYYY") : "—"}</p>
                <p className="font-medium">₹{rx.total_amount ?? rx.grand_total ?? "0"}</p>
              </div>
              <button
                onClick={() => setViewModal(rx)}
                className="mt-2 w-full text-center text-[#506EE4] border border-[#506EE4] rounded py-1 text-xs"
              >
                View Details
              </button>
            </div>
          )) : (
            <p className="text-center text-gray-400 text-xs py-4">No prescriptions found</p>
          )}
        </div>
      </motion.div>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl z-10 overflow-auto max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <p className="font-bold text-gray-800">
                  {viewModal.patient?.first_name ?? viewModal.patient_name ?? "—"} {viewModal.patient?.last_name ?? ""}
                </p>
                <p className="text-xs text-gray-500">
                  Dr. {viewModal.doctor?.doctor_name ?? viewModal.doctor_name ?? "—"} •{" "}
                  {viewModal.prescription_date ? dayjs(viewModal.prescription_date).format("DD MMM YYYY") : "—"}
                </p>
              </div>
              <button onClick={() => setViewModal(null)} className="text-gray-400 hover:text-gray-700 text-lg font-bold px-2">✕</button>
            </div>
            <div className="p-4">
              {/* Status + Total */}
              <div className="flex gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(viewModal.status)}`}>
                    {viewModal.status ?? "—"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="font-bold text-gray-800">₹{viewModal.total_amount ?? viewModal.grand_total ?? "0"}</p>
                </div>
                {viewModal.notes && (
                  <div>
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-gray-700 text-xs">{viewModal.notes}</p>
                  </div>
                )}
              </div>

              {/* Medicines table */}
              <p className="text-sm font-semibold text-gray-700 mb-2">Medicines</p>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Medicine</th>
                      <th className="px-3 py-2 text-left">Dose</th>
                      <th className="px-3 py-2 text-left">Frequency</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewModal.items ?? []).length === 0 ? (
                      <tr><td colSpan={6} className="py-4 text-center text-gray-400">No medicines listed</td></tr>
                    ) : (viewModal.items ?? []).map((it, idx) => (
                      <tr key={idx} className="border-t border-gray-50">
                        <td className="px-3 py-2">{it.product?.product_name ?? it.medicine_name ?? "—"}</td>
                        <td className="px-3 py-2">{it.dose ?? "—"}</td>
                        <td className="px-3 py-2">{it.frequency ?? "—"}</td>
                        <td className="px-3 py-2 text-right">{it.quantity ?? "—"}</td>
                        <td className="px-3 py-2 text-right">₹{it.unit_price ?? "—"}</td>
                        <td className="px-3 py-2 text-right">₹{it.total_price ?? (it.quantity && it.unit_price ? (it.quantity * it.unit_price).toFixed(2) : "—")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 flex flex-col items-end gap-1 text-xs text-gray-600">
                {viewModal.subtotal_amount != null && <p>Subtotal: ₹{viewModal.subtotal_amount}</p>}
                {viewModal.discount_amount != null && <p>Discount: ₹{viewModal.discount_amount}</p>}
                {viewModal.tax_amount != null && <p>Tax: ₹{viewModal.tax_amount}</p>}
                <p className="text-sm font-bold text-gray-800">Total: ₹{viewModal.total_amount ?? viewModal.grand_total ?? "0"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
