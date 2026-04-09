import React, { useEffect, useState } from "react";
import { RefreshCw, Plus, Eye, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import hrmsService from "../../service/hrmsService.js";
import StaffSelect from "./StaffSelect.jsx";

const statusColor = (s) => ({ draft: "bg-gray-100 text-gray-600", generated: "bg-blue-100 text-blue-700", paid: "bg-green-100 text-green-700" }[s] ?? "bg-gray-100 text-gray-600");
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function SalarySlips() {
    const [slips, setSlips] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [showGenerate, setShowGenerate] = useState(false);
    const [genForm, setGenForm] = useState({ staff_profile_id: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [viewSlip, setViewSlip] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const r = await hrmsService.getAllSalarySlips({ month: filterMonth, year: filterYear, limit: 50 });
            const d = r?.data?.data;
            setSlips(d?.data ?? []); setTotal(d?.total ?? 0);
        } catch { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [filterMonth, filterYear]);

    const generate = async () => {
        if (!genForm.staff_profile_id) { toast.error("Staff Profile ID required"); return; }
        setSaving(true);
        try { await hrmsService.generateSalarySlip(genForm); toast.success("Salary slip generated"); setShowGenerate(false); load(); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
        finally { setSaving(false); }
    };

    const markPaid = async (id) => {
        try { await hrmsService.markSalaryPaid(id); toast.success("Marked as paid"); load(); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    };

    const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN")}`;

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div><h2 className="text-xl font-bold text-gray-800">Salary Slips</h2>
                    <p className="text-xs text-gray-500">{total} slips</p></div>
                <div className="flex gap-2 flex-wrap">
                    <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <input type="number" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-24" />
                    <button onClick={load} className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50"><RefreshCw size={14} /></button>
                    <button onClick={() => setShowGenerate(true)} className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                        <Plus size={14} /> Generate
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>{["Staff", "Month/Year", "Gross", "Deductions", "Net Salary", "Status", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading...</td></tr>
                            : slips.length === 0 ? <tr><td colSpan={7} className="py-10 text-center text-gray-400">No slips found.</td></tr>
                                : slips.map(s => {
                                    const deductions = parseFloat(s.unpaid_deduction || 0) + parseFloat(s.pf_deduction || 0) + parseFloat(s.tax_deduction || 0);
                                    return (
                                        <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{s.staff_profile?.first_name} {s.staff_profile?.last_name}<br /><span className="text-xs text-gray-400">{s.staff_profile?.employee_code}</span></td>
                                            <td className="px-4 py-3">{months[s.month - 1]} {s.year}</td>
                                            <td className="px-4 py-3 text-gray-700">{fmt(s.gross_salary)}</td>
                                            <td className="px-4 py-3 text-red-500">-{fmt(deductions)}</td>
                                            <td className="px-4 py-3 font-bold text-green-600">{fmt(s.net_salary)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor(s.status)}`}>{s.status}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => setViewSlip(s)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-600" title="View"><Eye size={13} /></button>
                                                    {s.status === "generated" && (
                                                        <button onClick={() => markPaid(s.id)} className="p-1.5 border border-green-200 rounded hover:bg-green-50 text-green-600" title="Mark Paid"><CheckCircle size={13} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                    </tbody>
                </table>
            </div>

            {/* Generate Modal */}
            {showGenerate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setShowGenerate(false)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-4">Generate Salary Slip</h2>
                        <div className="space-y-3 text-sm">
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Select Staff *</label>
                                <StaffSelect value={genForm.staff_profile_id} onChange={(id) => setGenForm(f => ({ ...f, staff_profile_id: id }))} className="mt-1" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs font-medium text-gray-500 uppercase">Month</label>
                                    <select value={genForm.month} onChange={e => setGenForm(f => ({ ...f, month: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                    </select></div>
                                <div><label className="text-xs font-medium text-gray-500 uppercase">Year</label>
                                    <input type="number" value={genForm.year} onChange={e => setGenForm(f => ({ ...f, year: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowGenerate(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={generate} disabled={saving} className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">{saving ? "Generating..." : "Generate"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Slip Modal */}
            {viewSlip && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[480px] rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setViewSlip(null)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-1">Salary Slip</h2>
                        <p className="text-sm text-gray-500 mb-4">{viewSlip.staff_profile?.first_name} {viewSlip.staff_profile?.last_name} · {months[viewSlip.month - 1]} {viewSlip.year}</p>

                        <div className="space-y-3 text-sm">
                            {/* Attendance */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Attendance</p>
                                <div className="flex justify-between"><span className="text-gray-500">Working Days</span><span>{viewSlip.working_days}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Present Days</span><span>{viewSlip.present_days}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Paid Leave</span><span>{viewSlip.paid_leave_days}</span></div>
                                <div className="flex justify-between text-red-500"><span>Unpaid / Absent</span><span>{viewSlip.unpaid_leave_days}</span></div>
                            </div>

                            {/* Salary Structure */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Salary Structure (Full Month)</p>
                                <div className="flex justify-between"><span className="text-gray-500">Basic Salary</span><span>{fmt(viewSlip.basic_salary)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">HRA</span><span>{fmt(viewSlip.hra)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">DA</span><span>{fmt(viewSlip.da)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Other Allowances</span><span>{fmt(viewSlip.other_allowances)}</span></div>
                                <div className="flex justify-between text-gray-500 border-t border-gray-200 pt-1.5 text-xs">
                                    <span>Full Month Gross</span>
                                    <span>{fmt(parseFloat(viewSlip.basic_salary||0)+parseFloat(viewSlip.hra||0)+parseFloat(viewSlip.da||0)+parseFloat(viewSlip.other_allowances||0))}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Per Day ({viewSlip.working_days} days)</span>
                                    <span>{fmt((parseFloat(viewSlip.basic_salary||0)+parseFloat(viewSlip.hra||0)+parseFloat(viewSlip.da||0)+parseFloat(viewSlip.other_allowances||0))/viewSlip.working_days)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t border-gray-200 pt-1.5">
                                    <span>Earned ({parseFloat(viewSlip.present_days)+parseFloat(viewSlip.paid_leave_days)} days paid)</span>
                                    <span>{fmt(viewSlip.gross_salary)}</span>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="bg-red-50 rounded-lg p-4 space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Deductions</p>
                                <div className="flex justify-between text-red-500"><span>Unpaid / Absent Deduction</span><span>-{fmt(viewSlip.unpaid_deduction)}</span></div>
                                <div className="flex justify-between text-red-500"><span>PF</span><span>-{fmt(viewSlip.pf_deduction)}</span></div>
                                <div className="flex justify-between text-red-500"><span>Tax</span><span>-{fmt(viewSlip.tax_deduction)}</span></div>
                            </div>

                            {/* Net */}
                            <div className="flex justify-between font-bold text-lg bg-green-50 rounded-lg p-4">
                                <span>Net Salary</span><span className="text-green-600">{fmt(viewSlip.net_salary)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
