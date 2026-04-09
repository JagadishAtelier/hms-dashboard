import React, { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import hrmsService from "../../service/hrmsService.js";
import StaffSelect from "./StaffSelect.jsx";

const empty = { basic_salary: "", hra: "", da: "", other_allowances: "", pf_deduction: "", tax_deduction: "", effective_from: "" };

export default function SalaryConfig() {
    const [staffId, setStaffId] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [form, setForm] = useState(empty);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleStaffSelect = async (id, staff) => {
        setStaffId(id);
        setSelectedStaff(staff);
        setLoaded(false);
        if (!id) return;
        try {
            const r = await hrmsService.getSalaryConfig(id);
            const d = r?.data?.data;
            if (d) setForm({ basic_salary: d.basic_salary || "", hra: d.hra || "", da: d.da || "", other_allowances: d.other_allowances || "", pf_deduction: d.pf_deduction || "", tax_deduction: d.tax_deduction || "", effective_from: d.effective_from || "" });
            else setForm(empty);
        } catch { setForm(empty); }
        setLoaded(true);
    };

    const save = async () => {
        if (!staffId.trim()) { toast.error("Enter Staff Profile ID"); return; }
        if (!form.basic_salary || !form.effective_from) { toast.error("Basic salary and effective date required"); return; }
        setSaving(true);
        try { await hrmsService.upsertSalaryConfig(staffId, form); toast.success("Salary config saved"); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
        finally { setSaving(false); }
    };

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const gross = [form.basic_salary, form.hra, form.da, form.other_allowances].reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const deductions = [form.pf_deduction, form.tax_deduction].reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const net = gross - deductions;

    return (
        <div className="p-4 space-y-4 max-w-2xl">
            <div><h2 className="text-xl font-bold text-gray-800">Salary Configuration</h2>
                <p className="text-xs text-gray-500">Set salary structure per staff member</p></div>

            {/* Staff selector */}
            <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Select Staff *</label>
                <StaffSelect value={staffId} onChange={handleStaffSelect} />
            </div>

            {loaded && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Earnings</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {[["basic_salary", "Basic Salary *"], ["hra", "HRA"], ["da", "DA (Dearness Allowance)"], ["other_allowances", "Other Allowances"]].map(([k, label]) => (
                            <label key={k}>{label}
                                <input type="number" step="0.01" value={form[k]} onChange={e => set(k, e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" placeholder="0.00" />
                            </label>
                        ))}
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Deductions</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {[["pf_deduction", "PF Deduction"], ["tax_deduction", "Tax Deduction"]].map(([k, label]) => (
                            <label key={k}>{label}
                                <input type="number" step="0.01" value={form[k]} onChange={e => set(k, e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" placeholder="0.00" />
                            </label>
                        ))}
                    </div>

                    <label className="block text-sm">Effective From *
                        <input type="date" value={form.effective_from} onChange={e => set("effective_from", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" />
                    </label>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Gross Salary</span><span className="font-medium">₹{gross.toLocaleString("en-IN")}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Total Deductions</span><span className="text-red-500">-₹{deductions.toLocaleString("en-IN")}</span></div>
                        <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2"><span>Net Salary</span><span className="text-green-600">₹{net.toLocaleString("en-IN")}</span></div>
                    </div>

                    <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-[#0E1680] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#0b1260] disabled:opacity-60">
                        <Save size={14} /> {saving ? "Saving..." : "Save Salary Config"}
                    </button>
                </div>
            )}
        </div>
    );
}
