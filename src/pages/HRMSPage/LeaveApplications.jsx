import React, { useEffect, useState } from "react";
import { Plus, X, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import hrmsService from "../../service/hrmsService.js";
import StaffSelect from "./StaffSelect.jsx";

const role = () => (localStorage.getItem("role") || "").toLowerCase();
const LEAVE_TYPES = ["Paid", "Sick", "Casual", "Maternity", "Paternity", "Unpaid", "Permission", "Half Day"];

const statusColor = (s) => ({
    pending: "bg-yellow-100 text-yellow-700",
    hr_approved: "bg-blue-100 text-blue-700",
    hr_rejected: "bg-red-100 text-red-600",
    admin_approved: "bg-green-100 text-green-700",
    admin_rejected: "bg-red-100 text-red-600",
    auto_unpaid: "bg-gray-100 text-gray-600",
}[s] ?? "bg-gray-100 text-gray-600");

export default function LeaveApplications() {
    const [leaves, setLeaves] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showApply, setShowApply] = useState(false);
    const [actionModal, setActionModal] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ staff_profile_id: "", leave_type: "Paid", from_date: "", to_date: "", reason: "" });
    const currentRole = role();
    const isHR = ["hr", "admin", "superadmin"].includes(currentRole);
    const isAdmin = ["admin", "superadmin"].includes(currentRole);

    const load = async () => {
        setLoading(true);
        try {
            const r = await hrmsService.getAllLeaves({ limit: 50 });
            const d = r?.data?.data;
            setLeaves(d?.data ?? []); setTotal(d?.total ?? 0);
        } catch { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const applyLeave = async () => {
        if (!form.staff_profile_id || !form.from_date || !form.to_date) { toast.error("Fill all required fields"); return; }
        setSaving(true);
        try { await hrmsService.applyLeave(form); toast.success("Leave applied"); setShowApply(false); load(); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
        finally { setSaving(false); }
    };

    const doAction = async (action) => {
        setSaving(true);
        try {
            if (actionModal.type === "hr") await hrmsService.hrActionLeave(actionModal.leave.id, action, remarks);
            else await hrmsService.adminActionLeave(actionModal.leave.id, action, remarks);
            toast.success(action === "approve" ? "Approved" : "Rejected");
            setActionModal(null); setRemarks(""); load();
        } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
        finally { setSaving(false); }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-bold text-gray-800">Leave Applications</h2>
                    <p className="text-xs text-gray-500">{total} total</p></div>
                <button onClick={() => setShowApply(true)} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                    <Plus size={14} /> Apply Leave
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>{["Staff", "Type", "From", "To", "Days", "Reason", "Status", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={8} className="py-10 text-center text-gray-400">Loading...</td></tr>
                            : leaves.length === 0 ? <tr><td colSpan={8} className="py-10 text-center text-gray-400">No applications.</td></tr>
                                : leaves.map(l => (
                                    <tr key={l.id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{l.staff_profile?.first_name} {l.staff_profile?.last_name}</td>
                                        <td className="px-4 py-3">{l.leave_type}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{dayjs(l.from_date).format("DD MMM YYYY")}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{dayjs(l.to_date).format("DD MMM YYYY")}</td>
                                        <td className="px-4 py-3">{l.total_days}</td>
                                        <td className="px-4 py-3 max-w-[120px] truncate text-gray-500">{l.reason || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(l.status)}`}>
                                                {l.status?.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {isHR && l.status === "pending" && (
                                                    <button onClick={() => setActionModal({ leave: l, type: "hr" })} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200">HR</button>
                                                )}
                                                {isAdmin && ["pending", "hr_approved"].includes(l.status) && (
                                                    <button onClick={() => setActionModal({ leave: l, type: "admin" })} className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded border border-green-200">Admin</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            {/* Apply Modal */}
            {showApply && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[460px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setShowApply(false)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-4">Apply Leave</h2>
                        <div className="space-y-3 text-sm">
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Select Staff *</label>
                                <StaffSelect value={form.staff_profile_id} onChange={(id) => setForm(f => ({ ...f, staff_profile_id: id }))} className="mt-1" /></div>
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Leave Type</label>
                                <select value={form.leave_type} onChange={e => setForm(f => ({ ...f, leave_type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                    {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs font-medium text-gray-500 uppercase">From *</label>
                                    <input type="date" value={form.from_date}
                                        onChange={e => setForm(f => ({ ...f, from_date: e.target.value, to_date: f.to_date || e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                                <div><label className="text-xs font-medium text-gray-500 uppercase">To *</label>
                                    <input type="date" value={form.to_date} min={form.from_date}
                                        onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                            </div>
                            {form.from_date && form.to_date && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 font-medium">
                                    {form.leave_type === "Half Day" ? "0.5 day" :
                                     form.leave_type === "Permission" ? "Permission only" :
                                     (() => { const d = Math.ceil((new Date(form.to_date) - new Date(form.from_date)) / (1000*60*60*24)) + 1; return `${d} day${d > 1 ? "s" : ""}`; })()}
                                </div>
                            )}
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Reason</label>
                                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowApply(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={applyLeave} disabled={saving} className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">{saving ? "Applying..." : "Apply"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {actionModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setActionModal(null)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-1">{actionModal.type === "hr" ? "HR" : "Admin"} Action</h2>
                        <p className="text-sm text-gray-500 mb-4">{actionModal.leave.staff_profile?.first_name} — {actionModal.leave.leave_type} ({actionModal.leave.total_days} days)</p>
                        <div><label className="text-xs font-medium text-gray-500 uppercase">Remarks</label>
                            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => doAction("reject")} disabled={saving} className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-60">
                                <XCircle size={14} /> Reject
                            </button>
                            <button onClick={() => doAction("approve")} disabled={saving} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-60">
                                <CheckCircle size={14} /> Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
