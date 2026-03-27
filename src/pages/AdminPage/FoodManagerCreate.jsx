import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import foodService from "../../service/foodService";

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const selectCls = inputCls + " bg-white";
const Field = ({ label, required, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-600">{label} {required && <span className="text-red-500">*</span>}</label>
    {children}
  </div>
);

const EMPTY = {
  manager_name: "", manager_email: "", manager_phone: "", shift: "Morning",
  staff: { first_name: "", last_name: "", gender: "Male", dob: "", address: "", date_of_joining: "", department_id: null, qualification: "", emergency_contact: { name: "", relationship: "", phone: "" } },
  user: { password: "" },
};

export default function FoodManagerCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      foodService.getManagerById(id).then(res => {
        const m = res.data?.data || res.data;
        setForm(f => ({
          ...f,
          manager_name: m.manager_name || "",
          manager_email: m.manager_email || "",
          manager_phone: m.manager_phone || "",
          shift: m.shift || "Morning",
        }));
      }).catch(() => toast.error("Failed to load"));
    }
  }, [id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setStaff = (k, v) => setForm(p => ({ ...p, staff: { ...p.staff, [k]: v } }));

  const handleSubmit = async () => {
    if (!form.manager_name || !form.manager_email) return toast.error("Name and email are required");
    if (!isEdit && !form.user.password) return toast.error("Password is required");
    setSaving(true);
    try {
      if (isEdit) {
        await foodService.updateManager(id, { manager_name: form.manager_name, manager_phone: form.manager_phone, shift: form.shift });
        toast.success("Food Manager updated");
      } else {
        await foodService.createManager(form);
        toast.success("Food Manager created");
      }
      navigate("/food-managers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Food Manager" : "Add Food Manager"}</h1>
          <p className="text-sm text-gray-500">Food management staff account</p>
        </div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md border border-gray-300 bg-white text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Manager Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required><input className={inputCls} value={form.manager_name} onChange={e => set("manager_name", e.target.value)} /></Field>
              <Field label="Email" required><input type="email" className={inputCls} value={form.manager_email} onChange={e => set("manager_email", e.target.value)} disabled={isEdit} /></Field>
              <Field label="Phone"><input className={inputCls} value={form.manager_phone} onChange={e => set("manager_phone", e.target.value)} /></Field>
              <Field label="Shift">
                <select className={selectCls} value={form.shift} onChange={e => set("shift", e.target.value)}>
                  {["Morning", "Afternoon", "Evening", "Night"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {!isEdit && (
            <>
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Staff Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" required><input className={inputCls} value={form.staff.first_name} onChange={e => setStaff("first_name", e.target.value)} /></Field>
                  <Field label="Last Name"><input className={inputCls} value={form.staff.last_name} onChange={e => setStaff("last_name", e.target.value)} /></Field>
                  <Field label="Gender">
                    <select className={selectCls} value={form.staff.gender} onChange={e => setStaff("gender", e.target.value)}>
                      {["Male", "Female", "Other"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Date of Birth" required><input type="date" className={inputCls} value={form.staff.dob} onChange={e => setStaff("dob", e.target.value)} /></Field>
                  <Field label="Date of Joining" required><input type="date" className={inputCls} value={form.staff.date_of_joining} onChange={e => setStaff("date_of_joining", e.target.value)} /></Field>
                  <Field label="Address" required><input className={inputCls} value={form.staff.address} onChange={e => setStaff("address", e.target.value)} /></Field>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Login Password</h3>
                <div className="max-w-xs">
                  <Field label="Password" required>
                    <input type="password" className={inputCls} value={form.user.password}
                      onChange={e => setForm(p => ({ ...p, user: { password: e.target.value } }))} />
                  </Field>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={() => navigate(-1)} className="px-6 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-8 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
