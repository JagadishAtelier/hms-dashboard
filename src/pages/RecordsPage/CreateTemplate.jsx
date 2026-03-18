import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import recordsService from "../../service/recordsService";

const FIELD_TYPES = ["text", "textarea", "number", "select", "date", "checkbox"];

const CreateTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = location.pathname.includes("edit") || Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [recordTypes, setRecordTypes] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    record_type_id: "",
    version: 1,
    is_active: true,
  });

  const [fields, setFields] = useState([{ id: Date.now(), label: "", type: "text", required: false, options: "" }]);

  useEffect(() => {
    recordsService.getAllRecordTypes()
      .then((res) => setRecordTypes(res.data?.data || res.data || []))
      .catch(console.error);

    if (isEdit && id) {
      setLoading(true);
      recordsService.getTemplateById(id)
        .then((res) => {
          const t = res.data?.data || res.data;
          setFormData({ name: t.name || "", record_type_id: t.record_type_id || "", version: t.version || 1, is_active: t.is_active !== false });
          setIsDefault(t.is_default || false);
          const parsed = typeof t.fields === "string" ? JSON.parse(t.fields) : t.fields || [];
          setFields(parsed.map((f, i) => ({ ...f, id: f.id || Date.now() + i })));
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const addField = () => setFields((p) => [...p, { id: Date.now(), label: "", type: "text", required: false, options: "" }]);
  const removeField = (fid) => setFields((p) => p.filter((f) => f.id !== fid));
  const updateField = (fid, key, val) => setFields((p) => p.map((f) => f.id === fid ? { ...f, [key]: val } : f));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDefault) return setError("Cannot modify system default templates.");
    if (!formData.name || !formData.record_type_id) return setError("Name and Record Type are required.");

    try {
      setLoading(true);
      setError(null);
      const sanitized = fields.map(({ id, ...rest }) => rest);
      const payload = { ...formData, version: parseInt(formData.version, 10) || 1, fields: sanitized };

      if (isEdit) {
        await recordsService.updateTemplate(id, payload);
      } else {
        await recordsService.createTemplate(payload);
      }
      navigate("/records");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const selectCls = inputCls + " bg-white";

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Template" : "Create Template"}</h1>
          <p className="text-sm text-gray-500">Define a reusable template for medical records</p>
        </div>
        <button onClick={() => navigate("/records")} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}
      {isDefault && <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">This is a system default template and cannot be modified.</div>}

      <form onSubmit={handleSubmit} className={`bg-white border border-gray-200 rounded-xl shadow p-6 space-y-6 ${isDefault ? "opacity-60 pointer-events-none" : ""}`}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Name <span className="text-red-500">*</span></label>
            <input className={inputCls} placeholder="Template name" value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Record Type <span className="text-red-500">*</span></label>
            <select className={selectCls} value={formData.record_type_id}
              onChange={(e) => setFormData((p) => ({ ...p, record_type_id: e.target.value }))}>
              <option value="">Select Record Type</option>
              {recordTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Version</label>
            <input type="number" className={inputCls} value={formData.version}
              onChange={(e) => setFormData((p) => ({ ...p, version: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Status</label>
            <select className={selectCls} value={formData.is_active ? "active" : "inactive"}
              onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.value === "active" }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Fields Builder */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Template Fields</h3>

          {fields.map((field, idx) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Field {idx + 1}</span>
                <button type="button" onClick={() => removeField(field.id)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Label</label>
                  <input className={inputCls} placeholder="Field label" value={field.label}
                    onChange={(e) => updateField(field.id, "label", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Type</label>
                  <select className={selectCls} value={field.type}
                    onChange={(e) => updateField(field.id, "type", e.target.value)}>
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                {field.type === "select" && (
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-gray-500">Options (comma separated)</label>
                    <input className={inputCls} placeholder="e.g. Normal, Abnormal, N/A" value={field.options || ""}
                      onChange={(e) => updateField(field.id, "options", e.target.value)} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md">
                <input type="checkbox" id={`req-${field.id}`} checked={field.required}
                  onChange={(e) => updateField(field.id, "required", e.target.checked)}
                  className="h-4 w-4 text-indigo-500" />
                <label htmlFor={`req-${field.id}`} className="text-sm text-gray-600">Required field</label>
              </div>
            </div>
          ))}

          <button type="button" onClick={addField} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            <Plus className="h-4 w-4" /> Add Field
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={() => navigate("/records")} disabled={loading} className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            {loading ? "Saving..." : isEdit ? "Update Template" : "Create Template"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplate;
