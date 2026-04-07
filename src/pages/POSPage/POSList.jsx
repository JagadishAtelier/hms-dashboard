import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, ReceiptText, Edit2, MessageCircle, IndianRupee, X } from "lucide-react";
import { toast } from "sonner";
import posService from "../../service/posService.js";
import whatsappService from "../../service/whatsappService.js";
import dayjs from "dayjs";

const statusColor = (s) => ({
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-600",
}[s] ?? "bg-gray-100 text-gray-600");

const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN")}`;

export default function POSList() {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sendingWA, setSendingWA] = useState(null);
    const limit = 15;

    // Collect payment modal
    const [collectSale, setCollectSale] = useState(null);
    const [collectAmount, setCollectAmount] = useState("");
    const [collectMethod, setCollectMethod] = useState("cash");
    const [collecting, setCollecting] = useState(false);

    const fetchSales = async (p = 1) => {
        setLoading(true);
        try {
            const res = await posService.getAllSales({ page: p, limit });
            const d = res?.data?.data;
            setSales(d?.data ?? []);
            setTotal(d?.total ?? 0);
            setPage(p);
        } catch { toast.error("Failed to load sales"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSales(1); }, []);

    const openCollect = (s) => {
        setCollectSale(s);
        setCollectAmount(parseFloat(s.due_amount || 0).toFixed(2));
        setCollectMethod("cash");
    };

    const handleCollect = async () => {
        if (!collectAmount || parseFloat(collectAmount) <= 0) { toast.error("Enter a valid amount"); return; }
        setCollecting(true);
        try {
            await posService.collectPayment(collectSale.id, {
                amount: parseFloat(collectAmount),
                payment_method: collectMethod,
            });
            toast.success("Payment collected!");
            setCollectSale(null);
            fetchSales(page);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to collect payment");
        } finally { setCollecting(false); }
    };

    const sendWhatsApp = async (s) => {
        if (!s.customer_phone) { toast.error("No phone number for this sale"); return; }
        const phone = s.customer_phone.replace(/\D/g, '');
        if (phone.length < 10) { toast.error("Invalid phone number"); return; }
        setSendingWA(s.id);
        try {
            await whatsappService.sendReceipt({
                to: phone,
                customerName: s.customer_name || "Customer",
                amount: parseFloat(s.total_amount || 0).toFixed(0),
                transactionId: s.sale_no,
                date: dayjs(s.sale_date).format("YYYY-MM-DD"),
                saleId: s.id,
            });
            toast.success(`Receipt sent to ${s.customer_phone}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to send WhatsApp");
        } finally { setSendingWA(null); }
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const due = collectSale ? parseFloat(collectSale.due_amount || 0) : 0;
    const paying = parseFloat(collectAmount) || 0;
    const remaining = Math.max(due - paying, 0);
    const change = paying > due ? paying - due : 0;

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ReceiptText size={20} className="text-gray-600" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">POS Sales</h2>
                        <p className="text-xs text-gray-500">{total} total transactions</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => fetchSales(page)} className="p-2 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={() => navigate("/pos")}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                        <Plus size={14} /> New Sale
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Sale No", "Customer", "Phone", "Items", "Total", "Paid", "Due", "Payment", "Status", "Date", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={11} className="py-10 text-center text-gray-400">Loading...</td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan={11} className="py-10 text-center text-gray-400">No sales found.</td></tr>
                        ) : sales.map(s => {
                            const hasDue = parseFloat(s.due_amount || 0) > 0;
                            return (
                                <tr key={s.id} className={`border-t border-gray-50 hover:bg-gray-50 ${hasDue ? "bg-yellow-50/40" : ""}`}>
                                    <td className="px-4 py-3 font-medium text-[#506EE4]">{s.sale_no}</td>
                                    <td className="px-4 py-3 text-gray-700">{s.customer_name || "Walk-in"}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.customer_phone || "—"}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.items?.length ?? 0}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{fmt(s.total_amount)}</td>
                                    <td className="px-4 py-3 text-green-600">{fmt(s.paid_amount)}</td>
                                    <td className="px-4 py-3">
                                        {hasDue
                                            ? <span className="font-semibold text-red-500">{fmt(s.due_amount)}</span>
                                            : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 capitalize">{s.payment_method?.replace("_", " ")}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor(s.status)}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dayjs(s.sale_date).format("DD MMM YYYY HH:mm")}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5 items-center">
                                            {/* Collect pending payment */}
                                            {hasDue && (
                                                <button onClick={() => openCollect(s)}
                                                    className="p-1.5 border border-yellow-300 rounded hover:bg-yellow-50 text-yellow-600" title="Collect Pending Payment">
                                                    <IndianRupee size={13} />
                                                </button>
                                            )}
                                            <button onClick={() => navigate(`/pos?edit=${s.id}`)}
                                                className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-600" title="Edit">
                                                <Edit2 size={13} />
                                            </button>
                                            <button onClick={() => sendWhatsApp(s)} disabled={sendingWA === s.id}
                                                className="p-1.5 border border-green-200 rounded hover:bg-green-50 text-green-600 disabled:opacity-50" title="Send WhatsApp Receipt">
                                                <MessageCircle size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button disabled={page <= 1} onClick={() => fetchSales(page - 1)}
                        className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">Prev</button>
                    <button disabled={page >= totalPages} onClick={() => fetchSales(page + 1)}
                        className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
            </div>

            {/* Collect Payment Modal */}
            {collectSale && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[420px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setCollectSale(null)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-1">Collect Pending Payment</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            {collectSale.sale_no} · {collectSale.customer_name || "Walk-in"}
                        </p>

                        <div className="space-y-3 text-sm">
                            {/* Summary */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                                <div className="flex justify-between"><span className="text-gray-500">Total Bill</span><span className="font-medium">{fmt(collectSale.total_amount)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Already Paid</span><span className="text-green-600">{fmt(collectSale.paid_amount)}</span></div>
                                <div className="flex justify-between border-t border-gray-200 pt-1.5">
                                    <span className="font-semibold text-red-500">Pending Due</span>
                                    <span className="font-bold text-red-500">{fmt(collectSale.due_amount)}</span>
                                </div>
                            </div>

                            {/* Amount to collect */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Amount Collecting Now</label>
                                <input type="number" step="0.01" min="0" max={due}
                                    value={collectAmount}
                                    onChange={e => setCollectAmount(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30" />
                            </div>

                            {/* Live feedback */}
                            {paying > 0 && (
                                <div className={`rounded-lg p-3 space-y-1 text-sm ${remaining > 0 ? "bg-yellow-50 border border-yellow-200" : "bg-green-50 border border-green-200"}`}>
                                    {remaining > 0 ? (
                                        <div className="flex justify-between font-semibold text-yellow-700">
                                            <span>Still Remaining</span><span>{fmt(remaining)}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between font-semibold text-green-700">
                                            <span>✓ Fully Cleared</span><span>{fmt(due)}</span>
                                        </div>
                                    )}
                                    {change > 0 && (
                                        <div className="flex justify-between text-blue-600 font-semibold">
                                            <span>Change to Return</span><span>{fmt(change)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs text-gray-500 border-t border-gray-200 pt-1">
                                        <span>New Status</span>
                                        <span className={`font-semibold ${remaining <= 0 ? "text-green-600" : "text-yellow-600"}`}>
                                            {remaining <= 0 ? "Completed" : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Payment method */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Payment Method</label>
                                <select value={collectMethod} onChange={e => setCollectMethod(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                    {["cash", "card", "upi", "net_banking", "wallet"].map(m => (
                                        <option key={m} value={m}>{m.replace("_", " ").toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setCollectSale(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleCollect} disabled={collecting || paying <= 0}
                                className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#3f56c2] disabled:opacity-60">
                                {collecting ? "Processing..." : "Collect Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
