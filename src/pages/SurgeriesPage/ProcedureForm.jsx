import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import BASE_API from "../../api/baseurl";
import authService from "../../service/authService";

const API = `${BASE_API}/hms/surgeries/procedure`;
const authHeader = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const Field = ({ label, required, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-600">{label} {required && <span className="text-red-500">*</span>}</label>
    {children}
  </div>
);

const EMPTY = { name: "", procedure_code: "", description: "", risk_level: "", base_charge: "", is_active: true };

export default function ProcedureForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    axios.get(`${API}/${id}`, { headers: authHeader() })
      .then(res => {
        const d = res.data?.data || res.data;
        setForm({
          name: d.name || "",
          procedure_code: d.procedure_code || "",
          description: d.description || "",
          risk_level: d.risk_level || "",
          base_charge: d.base_charge ?? "",
          is_active: d.is_active ?? true,
        });
      })
      .catch(() => toast.error("Failed to load procedure"));
  }, [id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.procedure_code.trim()) return toast.error("Procedure code is required");

    setSaving(true);
    try {
      const payload = {
        ...form,
        base_charge: form.base_charge !== "" ? Number(form.base_charge) : 0,
        description: form.description || undefined,
        risk_level: form.risk_level || undefined,
      };

      if (isEdit) {
        await axios.put(`${API}/${id}`, payload, { headers: authHeader() });
        toast.success("Procedure updated");
      } else {
        await axios.post(API, payload, { headers: authHeader() });
        toast.success("Procedure created");
      }
      navigate("/procedures");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save procedure");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Procedure" : "Add Procedure"}</h1>
          <p className="text-sm text-gray-500">Surgical procedure master data</p>
        </div>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 h-9 px-4 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Procedure Name" required>
            <input className={inputCls} placeholder="e.g. Appendectomy" value={form.name}
              onChange={e => set("name", e.target.value)} />
          </Field>
          <Field label="Procedure Code" required>
            <input className={inputCls} placeholder="e.g. APP-01" value={form.procedure_code}
              onChange={e => set("procedure_code", e.target.value)} />
          </Field>
          <Field label="Risk Level">
            <select className={inputCls + " bg-white"} value={form.risk_level} onChange={e => set("risk_level", e.target.value)}>
              <option value="">Select risk level</option>
              {["Low", "Medium", "High", "Critical"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Base Charge (Rs.)">
            <input type="number" className={inputCls} placeholder="0.00" value={form.base_charge}
              onChange={e => set("base_charge", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea className="w-full min-h-[90px] p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Brief description of the procedure" value={form.description}
                onChange={e => set("description", e.target.value)} />
            </Field>
          </div>
          <Field label="Status">
            <select className={inputCls + " bg-white"} value={form.is_active ? "true" : "false"}
              onChange={e => set("is_active", e.target.value === "true")}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={() => navigate(-1)} disabled={saving}
            className="px-6 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-8 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
