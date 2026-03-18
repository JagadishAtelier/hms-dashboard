import React from "react";
import recordsService from "../../service/recordsService";

const RecordTypes = ({ types, searchTerm, refreshTypes, onEdit }) => {
  const filtered = types.filter(
    (t) =>
      (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record type?")) return;
    try {
      await recordsService.deleteRecordType(id);
      refreshTypes?.();
    } catch {
      alert("Failed to delete record type");
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {["Name", "Category", "Template Required", "Templates", "Created", "Status", "Actions"].map((h) => (
              <th key={h} className="h-10 px-4 font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.length > 0 ? (
            filtered.map((rt) => (
              <tr key={rt.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">
                  {rt.name}
                  {rt.is_default && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">DEFAULT</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-md text-xs bg-gray-100 text-gray-700 border border-gray-200">{rt.category}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${rt.templateRequired ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
                    {rt.templateRequired ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-4 text-gray-700">{rt.templates?.length || 0}</td>
                <td className="p-4 text-gray-500 text-xs">{new Date(rt.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${rt.is_active !== false ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                    {rt.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {rt.is_default ? (
                    <span className="text-xs text-gray-400 italic">System default</span>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(rt)} className="h-8 px-3 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700">Edit</button>
                      <button onClick={() => handleDelete(rt.id)} className="h-8 px-3 text-xs rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" className="p-8 text-center text-gray-400">No record types found.</td></tr>
          )}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
        Showing {filtered.length} of {types.length} entries
      </div>
    </div>
  );
};

export default RecordTypes;
