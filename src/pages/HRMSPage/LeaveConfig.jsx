import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import hrmsService from "../../service/hrmsService.js";

const TYPES = ["Paid", "Sick", "Casual", "Maternity", "Paternity", "Unpaid"];
const empty = { leave_type: "Paid", days_per_year: 12, days_per_month: 1, carry_forward: false, max_carry_forward_days: 0, applicable_to: "All" };

export default function LeaveConfig() {
    const [configs, setConfigs] = useState([]);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try { const r = await hrmsService.getAllLeaveConfigs(); setConfigs(r?.data?.data ?? []); }
        catch { toast.error("Failed to load"); }
    };
    useEffect(() => { load(); }, []);

    const save = async () => {
        setSaving(true);
        try {
            if (modal === "new") await hrmsService.createLeaveConfig(form);
            else await hrmsService.updateLeaveConfig(modal.id, form);
            toast.success("Saved"); setModal(null); load();
        } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
        finally { setSaving(false); }
    };

    const del = async (id) => {
        if (!confirm("Delete?")) return;
        try { await hrmsService.deleteLeaveConfig(id); toast.success("Deleted"); load(); }
        catch { toast.error("Failed"); }
    };

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-bold text-gray-800">Leave Configuration</h2>
                    <p className="text-xs text-gray-500">Define leave types and entitlements</p></div>
                <button onClick={() => { setForm(empty); setModal("new"); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                    <Plus size={14} /> Add Leave Type
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>{["Leave Type", "Days/Year", "Days/Month", "Carry Forward", "Max CF", "Applicable To", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {configs.length === 0
                            ? <tr><td colSpan={7} className="py-10 text-center text-gray-400">No configs. Add one.</td></tr>
                            : configs.map(c => (
                                <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{c.leave_type}</td>
                                    <td className="px-4 py-3">{c.days_per_year}</td>
                                    <td className="px-4 py-3">{c.days_per_month}</td>
                                    <td className="px-4 py-3">{c.carry_forward ? "Yes" : "No"}</td>
                                    <td className="px-4 py-3">{c.max_carry_forward_days}</td>
                                    <td className="px-4 py-3">{c.applicable_to}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => { setForm({ ...c }); setModal(c); }} className="p-1.5 border border-gray-200 rounded hover:bg-gray-100"><Edit2 size={13} /></button>
                                        <button onClick={() => del(c.id)} className="p-1.5 border border-red-200 rounded hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[440px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setModal(null)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-4">{modal === "new" ? "Add" : "Edit"} Leave Type</h2>
                        <div className="space-y-3 text-sm">
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Leave Type</label>
                                <select value={form.leave_type} onChange={e => set("leave_type", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                    {TYPES.map(t => <option key={t}>{t}</option>)}
                                </select></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs font-medium text-gray-500 uppercase">Days/Year</label>
                                    <input type="number" value={form.days_per_year} onChange={e => set("days_per_year", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                                <div><label className="text-xs font-medium text-gray-500 uppercase">Days/Month</label>
                                    <input type="number" step="0.5" value={form.days_per_month} onChange={e => set("days_per_month", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="cf" checked={form.carry_forward} onChange={e => set("carry_forward", e.target.checked)} className="w-4 h-4" />
                                <label htmlFor="cf" className="text-sm">Allow Carry Forward</label>
                            </div>
                            {form.carry_forward && <div><label className="text-xs font-medium text-gray-500 uppercase">Max Carry Forward Days</label>
                                <input type="number" value={form.max_carry_forward_days} onChange={e => set("max_carry_forward_days", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>}
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Applicable To</label>
                                <input value={form.applicable_to} onChange={e => set("applicable_to", e.target.value)} placeholder="All / Doctor / Nurse" className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={save} disabled={saving} className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
