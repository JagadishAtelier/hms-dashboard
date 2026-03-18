import React from "react";
import { useNavigate } from "react-router-dom";
import recordsService from "../../service/recordsService";

const RecordTemplates = ({ templates, searchTerm, refreshTemplates }) => {
  const navigate = useNavigate();

  const filtered = templates.filter(
    (t) =>
      (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.record_type?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await recordsService.deleteTemplate(id);
      refreshTemplates?.();
    } catch {
      alert("Failed to delete template");
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {["Name", "Record Type", "Version", "Status", "Actions"].map((h) => (
              <th key={h} className="h-10 px-4 font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.length > 0 ? (
            filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">
                  {t.name}
                  {t.is_default && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">DEFAULT</span>
                  )}
                </td>
                <td className="p-4 text-gray-600">{t.record_type?.name || t.record_type || "—"}</td>
                <td className="p-4 text-gray-700">{t.version}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${t.is_active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    {t.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {t.is_default ? (
                    <span className="text-xs text-gray-400 italic">Cannot modify</span>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => navigate(`/records/template/edit/${t.id}`)} className="h-8 px-3 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="h-8 px-3 text-xs rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" className="p-8 text-center text-gray-400">No templates found.</td></tr>
          )}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
        Showing {filtered.length} of {templates.length} entries
      </div>
    </div>
  );
};

export default RecordTemplates;
