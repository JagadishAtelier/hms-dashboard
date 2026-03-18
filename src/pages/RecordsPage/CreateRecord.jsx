import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import recordsService from "../../service/recordsService";
import patientService from "../../service/patientService";
import appointmentsService from "../../service/appointmentsService";

const CreateRecord = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recordTypes, setRecordTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_id: "",
    date: dayjs().format("YYYY-MM-DD"),
    record_type_id: "",
    template_id: "",
    description: "",
    diagnosis: "",
    field_values: {},
    is_active: true,
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [pRes, tRes, tmRes] = await Promise.all([
          patientService.getAllPatients({ limit: 200 }),
          recordsService.getAllRecordTypes(),
          recordsService.getAllTemplates(),
        ]);
        setPatients(pRes.data?.data || pRes.data || []);
        setRecordTypes(tRes.data?.data || tRes.data || []);
        setTemplates(tmRes.data?.data || tmRes.data || []);
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
      .then((res) => setAppointments(res.data?.data || res.data || []))
      .catch(() => setAppointments([]));
  }, [formData.patient_id]);

  // Update template fields when template changes
  useEffect(() => {
    if (!formData.template_id) { setSelectedTemplate(null); return; }
    const tmpl = templates.find((t) => t.id === formData.template_id);
    if (tmpl) {
      const fields = typeof tmpl.fields === "string" ? JSON.parse(tmpl.fields) : tmpl.fields || [];
      tmpl.fields = fields;
      setSelectedTemplate(tmpl);
      const init = {};
      fields.forEach((f) => { init[f.label] = f.type === "checkbox" ? false : ""; });
      setFormData((p) => ({ ...p, field_values: init }));
    }
  }, [formData.template_id, templates]);

  const availableTemplates = templates.filter((t) => t.record_type_id === formData.record_type_id);

  const handleFieldChange = (label, value) => {
    setFormData((p) => ({ ...p, field_values: { ...p.field_values, [label]: value } }));
  };

  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.record_type_id || !formData.template_id) {
      return alert("Please fill all required fields (Patient, Record Type, Template).");
    }
    try {
      setLoading(true);
      await recordsService.createRecord({
        patient_id: formData.patient_id,
        appointment_id: formData.appointment_id || undefined,
        template_id: formData.template_id,
        record_type_id: formData.record_type_id,
        date: formData.date,
        description: formData.description,
        diagnosis: formData.diagnosis,
        field_values: formData.field_values,
        is_active: formData.is_active,
        status: formData.is_active ? "Active" : "Inactive",
      });
      navigate("/records");
    } catch (err) {
      console.error(err);
      alert("Failed to create record.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, required, children }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const selectCls = "w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
  const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create Medical Record</h1>
          <p className="text-sm text-gray-500">Add a new medical record using a template</p>
        </div>
        <button onClick={() => navigate("/records")} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
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

              <Field label="Date" required>
                <input type="date" className={inputCls} value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} />
              </Field>

              <Field label="Record Type" required>
                <select className={selectCls} value={formData.record_type_id}
                  onChange={(e) => setFormData((p) => ({ ...p, record_type_id: e.target.value, template_id: "" }))}>
                  <option value="">Select record type</option>
                  {recordTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Template" required>
                <select className={selectCls} value={formData.template_id}
                  onChange={(e) => setFormData((p) => ({ ...p, template_id: e.target.value }))}
                  disabled={!formData.record_type_id}>
                  <option value="">{formData.record_type_id ? "Select template" : "Select a record type first"}</option>
                  {availableTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
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

          {/* Section 3: Dynamic Template Fields */}
          {selectedTemplate?.fields?.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{selectedTemplate.name} Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id || field.label} className={`space-y-1 ${field.type === "checkbox" ? "flex flex-row-reverse items-center gap-2 justify-end" : ""}`}>
                    <label className="text-sm font-medium text-gray-600">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={formData.field_values[field.label] || ""}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)} />
                    ) : field.type === "checkbox" ? (
                      <input type="checkbox" className="h-5 w-5 rounded border-gray-400 text-indigo-500"
                        checked={!!formData.field_values[field.label]}
                        onChange={(e) => handleFieldChange(field.label, e.target.checked)} />
                    ) : field.type === "select" ? (
                      <select className={selectCls} value={formData.field_values[field.label] || ""}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}>
                        <option value="">Select {field.label}</option>
                        {(Array.isArray(field.options) ? field.options : (field.options || "").split(","))
                          .map((o) => o.trim()).filter(Boolean)
                          .map((o, i) => <option key={i} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        className={inputCls}
                        placeholder={`Enter ${field.label}`}
                        value={formData.field_values[field.label] || ""}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={() => navigate("/records")} disabled={loading} className="px-6 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            {loading ? "Creating..." : "Create Record"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecord;
