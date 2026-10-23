import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, ReceiptText, Edit2, MessageCircle, IndianRupee, X } from "lucide-react";
import { toast } from "sonner";
import posService from "../../service/posService.js";
import whatsappService from "../../service/whatsappService.js";
import dayjs from "dayjs";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

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
        <div className="p-6 space-y-5">
            {/* Page Header */}
            <PageHeader
                title="POS Sales Ledger"
                description={`${total} total sales transactions recorded in system`}
                breadcrumbs={[
                    { label: "Overview", href: "/dashboard" },
                    { label: "Point of Sale", href: "/pos" },
                    { label: "Sales Ledger" },
                ]}
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => fetchSales(page)}
                            title="Refresh sales ledger"
                            className="border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            <RefreshCw size={14} />
                        </Button>
                        <Button
                            onClick={() => navigate("/pos")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-medium flex items-center gap-1.5"
                        >
                            <Plus size={14} /> New POS Sale
                        </Button>
                    </div>
                }
            />

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {["Sale No", "Customer", "Phone", "Items", "Total", "Paid", "Due", "Payment Mode", "Status", "Date & Time", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={11} className="py-10 text-center text-slate-400 text-xs">Loading sales transactions...</td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan={11} className="py-10 text-center text-slate-400 text-xs">No sales found.</td></tr>
                        ) : sales.map(s => {
                            const hasDue = parseFloat(s.due_amount || 0) > 0;
                            return (
                                <tr key={s.id} className={`hover:bg-slate-50/70 transition-colors ${hasDue ? "bg-amber-50/30" : ""}`}>
                                    <td className="px-4 py-3 font-mono font-semibold text-indigo-600 text-xs">
                                        <button
                                            onClick={() => window.open(`/receipt/${s.id}`, '_blank')}
                                            className="hover:underline cursor-pointer"
                                            title="View / Print Receipt"
                                        >
                                            {s.sale_no}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-slate-800 font-medium text-xs">{s.customer_name || "Walk-in"}</td>
                                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.customer_phone || "—"}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{s.items?.length ?? 0}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-900 font-mono text-xs">{fmt(s.total_amount)}</td>
                                    <td className="px-4 py-3 text-emerald-700 font-semibold font-mono text-xs">{fmt(s.paid_amount)}</td>
                                    <td className="px-4 py-3 text-xs">
                                        {hasDue
                                            ? <span className="font-semibold text-rose-600 font-mono">{fmt(s.due_amount)}</span>
                                            : <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-xs capitalize">{s.payment_method?.replace("_", " ")}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={s.status} />
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">{dayjs(s.sale_date).format("DD MMM YYYY HH:mm")}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5 items-center">
                                            {/* Collect pending payment */}
                                            {hasDue && (
                                                <button onClick={() => openCollect(s)}
                                                    className="p-1.5 border border-amber-300 rounded-md hover:bg-amber-50 text-amber-700" title="Collect Pending Payment">
                                                    <IndianRupee size={13} />
                                                </button>
                                            )}
                                            <button onClick={() => navigate(`/pos?edit=${s.id}`)}
                                                className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 text-slate-600" title="Edit Sale">
                                                <Edit2 size={13} />
                                            </button>
                                            <button onClick={() => sendWhatsApp(s)} disabled={sendingWA === s.id}
                                                className="p-1.5 border border-emerald-200 rounded-md hover:bg-emerald-50 text-emerald-600 disabled:opacity-50" title="Send WhatsApp Receipt">
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
