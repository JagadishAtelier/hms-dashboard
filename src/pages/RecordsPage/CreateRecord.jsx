import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import recordsService from "../../service/recordsService";
import patientService from "../../service/patientService";
import appointmentsService from "../../service/appointmentsService";
import admissionsService from "../../service/addmissionsService";

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

// Renders all fields for a single template entry
const TemplateFields = ({ template, fieldValues, onChange, onRemove, index, canRemove }) => {
  if (!template) return null;
  const fields = typeof template.fields === "string" ? JSON.parse(template.fields) : template.fields || [];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Template header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-400 uppercase">Template {index + 1}</span>
          <span className="text-sm font-semibold text-indigo-700">{template.name}</span>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} className="p-1 text-red-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {fields.length === 0 ? (
        <p className="p-4 text-sm text-gray-400">This template has no fields defined.</p>
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div
              key={field.label}
              className={`space-y-1 ${field.type === "checkbox" ? "flex flex-row-reverse items-center gap-2 justify-end" : ""}`}
            >
              <label className="text-sm font-medium text-gray-600">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={fieldValues[field.label] || ""}
                  onChange={(e) => onChange(field.label, e.target.value)}
                />
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-400 text-indigo-500"
                  checked={!!fieldValues[field.label]}
                  onChange={(e) => onChange(field.label, e.target.checked)}
                />
              ) : field.type === "select" ? (
                <select
                  className={selectCls}
                  value={fieldValues[field.label] || ""}
                  onChange={(e) => onChange(field.label, e.target.value)}
                >
                  <option value="">Select {field.label}</option>
                  {(Array.isArray(field.options) ? field.options : (field.options || "").split(","))
                    .map((o) => o.trim()).filter(Boolean)
                    .map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  className={inputCls}
                  placeholder={`Enter ${field.label}`}
                  value={fieldValues[field.label] || ""}
                  onChange={(e) => onChange(field.label, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateRecord = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledPatientId = searchParams.get("patient_id") || "";
  const prefilledAppointmentId = searchParams.get("appointment_id") || "";
  const prefilledAdmissionId = searchParams.get("admission_id") || "";

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [admissionInfo, setAdmissionInfo] = useState(null);
  const [recordTypes, setRecordTypes] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: prefilledPatientId,
    appointment_id: prefilledAppointmentId,
    admission_id: prefilledAdmissionId,
    date: dayjs().format("YYYY-MM-DD"),
    record_type_id: "",
    description: "",
    diagnosis: "",
    is_active: true,
  });

  // Each entry: { template_id, field_values: {} }
  const [templateEntries, setTemplateEntries] = useState([{ template_id: "", field_values: {} }]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [pRes, tRes, tmRes] = await Promise.all([
          patientService.getAllPatients({ limit: 200 }),
          recordsService.getAllRecordTypes(),
          recordsService.getAllTemplates(),
        ]);
        setPatients(pRes.data?.data?.data || pRes.data?.data || []);
        setRecordTypes(tRes.data?.data?.data || tRes.data?.data || []);
        setAllTemplates(tmRes.data?.data?.data || tmRes.data?.data || []);

        // If coming from an admission, fetch admission details to display
        if (prefilledAdmissionId) {
          try {
            const aRes = await admissionsService.getAdmissionById(prefilledAdmissionId);
            setAdmissionInfo(aRes?.data || null);
          } catch {
            // non-fatal
          }
        }
      } catch (err) {
        console.error("Init error", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Load appointments when patient changes
  useEffect(() => {
    if (!formData.patient_id) { setAppointments([]); return; }
    appointmentsService.getAllAppointments({ patient_id: formData.patient_id, limit: 100 })
      .then((res) => setAppointments(res.data?.data?.data || res.data?.data || []))
      .catch(() => setAppointments([]));
  }, [formData.patient_id]);

  // Templates available for the selected record type
  const availableTemplates = allTemplates.filter((t) => t.record_type_id === formData.record_type_id);

  // When record type changes, reset all template entries
  const handleRecordTypeChange = (record_type_id) => {
    setFormData((p) => ({ ...p, record_type_id }));
    setTemplateEntries([{ template_id: "", field_values: {} }]);
  };

  // Update a template entry's selected template, reset its field_values
  const handleEntryTemplateChange = (index, template_id) => {
    const tmpl = allTemplates.find((t) => t.id === template_id);
    const fields = tmpl ? (typeof tmpl.fields === "string" ? JSON.parse(tmpl.fields) : tmpl.fields || []) : [];
    const initValues = {};
    fields.forEach((f) => { initValues[f.label] = f.type === "checkbox" ? false : ""; });

    setTemplateEntries((prev) => prev.map((e, i) =>
      i === index ? { template_id, field_values: initValues } : e
    ));
  };

  // Update a field value within a template entry
  const handleFieldChange = (index, label, value) => {
    setTemplateEntries((prev) => prev.map((e, i) =>
      i === index ? { ...e, field_values: { ...e.field_values, [label]: value } } : e
    ));
  };

  const addTemplateEntry = () => {
    setTemplateEntries((prev) => [...prev, { template_id: "", field_values: {} }]);
  };

  const removeTemplateEntry = (index) => {
    setTemplateEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.record_type_id) {
      return alert("Please select a Patient and Record Type.");
    }
    const filledEntries = templateEntries.filter((e) => e.template_id);
    if (filledEntries.length === 0) {
      return alert("Please select at least one template.");
    }

    try {
      setLoading(true);
      await recordsService.createRecord({
        patient_id: formData.patient_id,
        appointment_id: formData.appointment_id || undefined,
        admission_id: formData.admission_id || undefined,
        record_type_id: formData.record_type_id,
        date: formData.date,
        description: formData.description,
        diagnosis: formData.diagnosis,
        is_active: formData.is_active,
        status: formData.is_active ? "Active" : "Inactive",
        template_entries: filledEntries,
      });

      // Navigate back to patient records if came from there
      if (prefilledPatientId) {
        const params = new URLSearchParams();
        if (prefilledAppointmentId) params.set("appointment_id", prefilledAppointmentId);
        if (prefilledAdmissionId) params.set("admission_id", prefilledAdmissionId);
        navigate(`/records/patient/${prefilledPatientId}?${params.toString()}`);
      } else {
        navigate("/records");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create Medical Record</h1>
          <p className="text-sm text-gray-500">Add a record with one or more templates</p>
        </div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>

      <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 space-y-8">

          {/* Section 1: Record Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Record Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Patient" required>
                <select className={selectCls} value={formData.patient_id}
                  onChange={(e) => setFormData((p) => ({ ...p, patient_id: e.target.value, appointment_id: "" }))}>
                  <option value="">Select a patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.patient_code})</option>
                  ))}
                </select>
              </Field>

              {prefilledAdmissionId ? (
                <Field label="Admission">
                  <div className={`${inputCls} flex items-center bg-gray-50 text-gray-700 cursor-default`}>
                    {admissionInfo
                      ? `${admissionInfo.admission_no || "Admission"} — ${dayjs(admissionInfo.admission_date).format("MMM D, YYYY")} (${admissionInfo.status})`
                      : prefilledAdmissionId}
                  </div>
                </Field>
              ) : (
                <Field label="Appointment (optional)">
                  <select className={selectCls} value={formData.appointment_id}
                    onChange={(e) => setFormData((p) => ({ ...p, appointment_id: e.target.value }))}
                    disabled={!formData.patient_id}>
                    <option value="">Select an appointment</option>
                    {appointments.map((a) => (
                      <option key={a.id} value={a.id}>{a.appointment_no} — {dayjs(a.scheduled_at).format("MMM D, YYYY")} ({a.status})</option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Date" required>
                <input type="date" className={inputCls} value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} />
              </Field>

              <Field label="Record Type" required>
                <select className={selectCls} value={formData.record_type_id}
                  onChange={(e) => handleRecordTypeChange(e.target.value)}>
                  <option value="">Select record type</option>
                  {recordTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Section 2: Medical Information */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Description">
                <textarea className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="General description / notes"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
              </Field>
              <Field label="Diagnosis">
                <textarea className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData((p) => ({ ...p, diagnosis: e.target.value }))} />
              </Field>
            </div>
          </div>

          {/* Section 3: Templates */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Templates</h3>
              {formData.record_type_id && (
                <button type="button" onClick={addTemplateEntry}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
                  <Plus className="h-3.5 w-3.5" /> Add Template
                </button>
              )}
            </div>

            {!formData.record_type_id ? (
              <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                Select a record type first to choose templates
              </p>
            ) : (
              <div className="space-y-4">
                {templateEntries.map((entry, index) => (
                  <div key={index} className="space-y-3">
                    {/* Template selector */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <select
                          className={selectCls}
                          value={entry.template_id}
                          onChange={(e) => handleEntryTemplateChange(index, e.target.value)}
                        >
                          <option value="">Select template {index + 1}</option>
                          {availableTemplates.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      {templateEntries.length > 1 && (
                        <button type="button" onClick={() => removeTemplateEntry(index)}
                          className="p-2 text-red-400 hover:text-red-600 border border-red-200 rounded-md hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Template fields */}
                    {entry.template_id && (
                      <TemplateFields
                        template={allTemplates.find((t) => t.id === entry.template_id)}
                        fieldValues={entry.field_values}
                        onChange={(label, value) => handleFieldChange(index, label, value)}
                        onRemove={() => removeTemplateEntry(index)}
                        index={index}
                        canRemove={false}
                      />
                    )}
                  </div>
                ))}

                {/* Add more */}
                <button type="button" onClick={addTemplateEntry}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Add Another Template
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={() => navigate(-1)} disabled={loading}
            className="px-6 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-8 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            {loading ? "Creating..." : "Create Record"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecord;
