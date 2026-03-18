import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import recordsService from "../../service/recordsService";

const CreateRecordTypeModal = ({ isOpen, onClose, onRefresh, typeToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "general",
    templateRequired: true,
    is_active: true,
  });

  useEffect(() => {
    if (isOpen && typeToEdit) {
      setFormData({
        name: typeToEdit.name || "",
        category: typeToEdit.category || "general",
        templateRequired: typeToEdit.templateRequired !== false,
        is_active: typeToEdit.is_active !== false,
      });
    } else if (isOpen) {
      setFormData({ name: "", category: "general", templateRequired: true, is_active: true });
    }
  }, [isOpen, typeToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name) return alert("Name is required");
    try {
      setLoading(true);
      const payload = { ...formData, status: formData.is_active ? "Active" : "Inactive" };
      if (typeToEdit) {
        await recordsService.updateRecordType(typeToEdit.id, payload);
      } else {
        await recordsService.createRecordType(payload);
      }
      onRefresh?.();
      onClose();
    } catch (err) {
      alert("Failed to save record type");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-200 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            {typeToEdit ? "Edit Record Type" : "Create Record Type"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Name <span className="text-red-500">*</span></label>
            <input
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. Annual Wellness Exam"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Category</label>
            <select
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            >
              {["general", "examination", "preventive", "urgent", "procedure", "consultation"].map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <Toggle
            checked={formData.templateRequired}
            onChange={(e) => setFormData((p) => ({ ...p, templateRequired: e.target.checked }))}
            label="Template Required"
            desc="Is a template mandatory for this type?"
          />
          <Toggle
            checked={formData.is_active}
            onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
            label="Active"
            desc="Can this type be used?"
          />
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            {loading ? "Saving..." : typeToEdit ? "Update Type" : "Create Type"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecordTypeModal;
