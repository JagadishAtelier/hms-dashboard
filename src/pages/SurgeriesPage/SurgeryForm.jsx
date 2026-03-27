import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import surgeriesService from "../../service/surgeriesService";
import patientService from "../../service/patientService";
import doctorService from "../../service/doctorsService";

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const selectCls = inputCls + " bg-white";

const Field = ({ label, required, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const EMPTY_FORM = {
  patient_id: "", admission_id: "", procedure_id: "", surgeon_id: "",
  scheduled_at: "", operation_theater: "", anesthesia_type: "general",
  status: "scheduled", pre_op_notes: "", post_op_notes: "", complications: "", charge: "",
};

export default function SurgeryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    patient_id: searchParams.get("patient_id") || "",
    admission_id: searchParams.get("admission_id") || "",
  });
  const [patients, setPatients] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [pRes, procRes, dRes] = await Promise.all([
          patientService.getAllPatients({ limit: 200 }),
          surgeriesService.getAllProcedures({ limit: 200 }),
          doctorService.getAllDoctors({ limit: 200 }),
        ]);
        setPatients(pRes.data?.data?.data || pRes.data?.data || []);
        setProcedures(procRes.data?.data?.data || procRes.data?.data || []);
        setDoctors(dRes.data?.data?.data || dRes.data?.data || []);

        if (isEdit) {
          const res = await surgeriesService.getById(id);
          const s = res.data?.data || res.data;
          setForm({
            patient_id: s.patient_id || "",
            admission_id: s.admission_id || "",
            procedure_id: s.procedure_id || "",
            surgeon_id: s.surgeon_id || "",
            scheduled_at: s.scheduled_at ? dayjs(s.scheduled_at).format("YYYY-MM-DDTHH:mm") : "",
            operation_theater: s.operation_theater || "",
            anesthesia_type: s.anesthesia_type || "general",
            status: s.status || "scheduled",
            pre_op_notes: s.pre_op_notes || "",
            post_op_notes: s.post_op_notes || "",
            complications: s.complications || "",
            charge: s.charge ?? "",
          });
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.patient_id) return toast.error("Patient is required");
    if (!form.scheduled_at) return toast.error("Scheduled date/time is required");

    setSaving(true);
    try {
      const payload = {
        ...form,
        admission_id: form.admission_id || undefined,
        procedure_id: form.procedure_id || undefined,
        surgeon_id: form.surgeon_id || undefined,
        charge: form.charge !== "" ? Number(form.charge) : undefined,
      };

      if (isEdit) {
        await surgeriesService.update(id, payload);
        toast.success("Surgery updated");
      } else {
        await surgeriesService.create(payload);
        toast.success("Surgery scheduled");
      }
      navigate("/surgeries");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save surgery");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Surgery" : "Schedule Surgery"}</h1>
          <p className="text-sm text-gray-500">Fill in the surgical details below</p>
        </div>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 h-9 px-4 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 space-y-6">

          {/* Patient & Admission */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Patient Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Patient" required>
                <select className={selectCls} value={form.patient_id} onChange={e => set("patient_id", e.target.value)}>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.patient_code})</option>)}
                </select>
              </Field>
              <Field label="Admission (optional)">
                <input className={inputCls} placeholder="Admission ID" value={form.admission_id}
                  onChange={e => set("admission_id", e.target.value)} readOnly={Boolean(searchParams.get("admission_id"))} />
              </Field>
            </div>
          </div>

          {/* Surgery Details */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Surgery Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Procedure">
                <select className={selectCls} value={form.procedure_id} onChange={e => {
                  const proc = procedures.find(p => p.id === e.target.value);
                  set("procedure_id", e.target.value);
                  if (proc?.base_charge) set("charge", proc.base_charge);
                }}>
                  <option value="">Select procedure</option>
                  {procedures.map(p => <option key={p.id} value={p.id}>{p.name} ({p.procedure_code})</option>)}
                </select>
              </Field>
              <Field label="Surgeon">
                <select className={selectCls} value={form.surgeon_id} onChange={e => set("surgeon_id", e.target.value)}>
                  <option value="">Select surgeon</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.staff_profiles?.first_name} {d.staff_profiles?.last_name}</option>)}
                </select>
              </Field>
              <Field label="Scheduled At" required>
                <input type="datetime-local" className={inputCls} value={form.scheduled_at}
                  onChange={e => set("scheduled_at", e.target.value)} />
              </Field>
              <Field label="Operation Theater">
                <input className={inputCls} placeholder="e.g. OT-1" value={form.operation_theater}
                  onChange={e => set("operation_theater", e.target.value)} />
              </Field>
              <Field label="Anesthesia Type">
                <select className={selectCls} value={form.anesthesia_type} onChange={e => set("anesthesia_type", e.target.value)}>
                  {["general", "local", "regional", "sedation", "none"].map(v => (
                    <option key={v} value={v} className="capitalize">{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select className={selectCls} value={form.status} onChange={e => set("status", e.target.value)}>
                  {["scheduled", "in_progress", "completed", "postponed", "cancelled"].map(v => (
                    <option key={v} value={v}>{v.replace("_", " ")}</option>
                  ))}
                </select>
              </Field>
              <Field label="Charge (Rs.)">
                <input type="number" className={inputCls} placeholder="0.00" value={form.charge}
                  onChange={e => set("charge", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[["pre_op_notes", "Pre-Op Notes"], ["post_op_notes", "Post-Op Notes"], ["complications", "Complications"]].map(([k, label]) => (
                <Field key={k} label={label}>
                  <textarea className="w-full min-h-[90px] p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder={`Enter ${label.toLowerCase()}`} value={form[k]}
                    onChange={e => set(k, e.target.value)} />
                </Field>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={() => navigate(-1)} disabled={saving}
            className="px-6 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-8 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            {saving ? "Saving..." : isEdit ? "Update Surgery" : "Schedule Surgery"}
          </button>
        </div>
      </div>
    </div>
  );
}
