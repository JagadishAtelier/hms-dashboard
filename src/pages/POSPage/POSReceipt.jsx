import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BASE_API from "../../api/baseurl.js";
import dayjs from "dayjs";

const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function POSReceipt() {
    const { id } = useParams();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${BASE_API}/ims/pos/receipt/${id}`)
            .then(res => setSale(res?.data?.data ?? res?.data))
            .catch(() => setError("Receipt not found"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-gray-400 text-sm">Loading receipt...</div>
        </div>
    );

    if (error || !sale) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-red-500 font-medium">Receipt not found</p>
                <p className="text-gray-400 text-sm mt-1">The receipt link may be invalid or expired.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-full">

                {/* Header */}
                <div className="bg-indigo-600 px-6 py-5 text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-bold">Payment Received</h1>
                    <p className="text-white/80 text-xs mt-0.5">Atelier Hospital Management System</p>
                </div>

                {/* Amount */}
                <div className="text-center py-5 border-b border-slate-100">
                    <p className="text-3xl font-bold text-slate-900 font-mono">{fmt(sale.total_amount)}</p>
                    <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        sale.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        sale.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>{sale.status}</span>
                </div>

                {/* Details */}
                <div className="px-6 py-4 space-y-2.5">
                    <Row label="Receipt No" value={sale.sale_no} bold />
                    <Row label="Customer" value={sale.customer_name || "Walk-in Customer"} />
                    {sale.customer_phone && <Row label="Phone" value={sale.customer_phone} />}
                    <Row label="Date" value={dayjs(sale.sale_date).format("DD MMM YYYY, hh:mm A")} />
                    <Row label="Payment" value={sale.payment_method?.replace("_", " ").toUpperCase()} />
                </div>

                {/* Items */}
                {Array.isArray(sale.items) && sale.items.length > 0 && (
                    <div className="px-6 pb-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Items</p>
                        <div className="space-y-2">
                            {sale.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <div>
                                        <p className="text-slate-800 font-medium">{item.item_name}</p>
                                        <p className="text-slate-400 text-xs">{item.quantity} × {fmt(item.unit_price)}</p>
                                    </div>
                                    <p className="font-semibold text-slate-800 font-mono">{fmt(item.total_price)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Totals */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-1.5 text-sm">
                    <Row label="Subtotal" value={fmt(sale.subtotal_amount)} small />
                    <Row label="Tax" value={fmt(sale.tax_amount)} small />
                    {parseFloat(sale.discount_amount) > 0 && <Row label="Discount" value={`-${fmt(sale.discount_amount)}`} small />}
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                        <span>Total</span>
                        <span className="font-mono">{fmt(sale.total_amount)}</span>
                    </div>
                    <Row label="Paid" value={fmt(sale.paid_amount)} small />
                    {parseFloat(sale.due_amount || 0) > 0 && (
                        <div className="flex justify-between pt-1">
                            <span className="text-xs font-semibold text-rose-600">Pending Due</span>
                            <span className="text-xs font-bold text-rose-600 font-mono">{fmt(sale.due_amount)}</span>
                        </div>
                    )}
                    {parseFloat(sale.change_amount) > 0 && <Row label="Change" value={fmt(sale.change_amount)} small />}
                </div>

                {/* Notes */}
                {sale.notes && (
                    <div className="px-6 py-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notes</p>
                        <p className="text-sm text-slate-600">{sale.notes}</p>
                    </div>
                )}

                {/* Actions (Hidden on print) */}
                <div className="px-6 py-3 bg-white flex gap-2 print:hidden border-t border-slate-100">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm"
                    >
                        Print Receipt
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 text-center border-t border-slate-100 bg-slate-50/50">
                    <p className="text-xs text-slate-400">Thank you for choosing Atelier Hospital Management System.</p>
                    <p className="text-xs text-slate-300 mt-0.5">{dayjs().format("YYYY")}</p>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value, bold, small }) {
    return (
        <div className="flex justify-between">
            <span className={`text-slate-500 ${small ? "text-xs" : "text-sm"}`}>{label}</span>
            <span className={`${bold ? "font-semibold text-slate-900" : "text-slate-700"} ${small ? "text-xs" : "text-sm"}`}>{value}</span>
        </div>
    );
}
