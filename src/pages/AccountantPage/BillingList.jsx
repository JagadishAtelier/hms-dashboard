import React, { useEffect, useState } from "react";
import { RefreshCw, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import billingService from "../../service/billingService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";

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

export default function BillingList() {
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  const fetchBills = async (p = 1) => {
    setLoading(true);
    try {
      const res = await billingService.getAll({ page: p, limit });
      const d = res?.data;
      setBills(Array.isArray(d?.data) ? d.data : []);
      setTotal(d?.total ?? 0);
      setPage(p);
    } catch {
      toast.error("Failed to load billing records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(1); }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><Loading /></div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ReceiptText size={20} className="text-gray-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Billing Records</h2>
            <p className="text-xs text-gray-500">{total} total records</p>
          </div>
        </div>
        <button onClick={() => fetchBills(page)}
          className="p-2 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Bill No", "Customer", "Type", "Total", "Paid", "Due", "Payment", "Status", "Date"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-gray-400">No billing records found.</td></tr>
            ) : bills.map(b => (
              <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#506EE4]">{b.billing_no}</td>
                <td className="px-4 py-3 text-gray-700">{b.customer_name || "—"}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{b.type?.replace("_", " ") || "—"}</td>
                <td className="px-4 py-3 font-medium text-gray-800">₹{parseFloat(b.total_amount || 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-green-600">₹{parseFloat(b.paid_amount || 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-red-500">₹{parseFloat(b.due_amount || 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{b.payment_method?.replace("_", " ") || "—"}</td>
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

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => fetchBills(page - 1)}
            className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">Prev</button>
          <button disabled={page >= totalPages} onClick={() => fetchBills(page + 1)}
            className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}
