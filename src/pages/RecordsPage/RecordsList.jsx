import React, { useState, useRef } from "react";
import { ChevronDown, ChevronRight, Printer } from "lucide-react";
import dayjs from "dayjs";
import recordsService from "../../service/recordsService";

const fmt = (d, withTime = false) => {
  try { return dayjs(d).format(withTime ? "MMM D, YYYY, h:mm A" : "MMMM D, YYYY"); }
  catch { return d; }
};

const RecordRow = ({ record, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const printRef = useRef(null);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Medical Record</title></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  let parsedFields = {};
  try {
    parsedFields = typeof record.field_values === "string"
      ? JSON.parse(record.field_values)
      : record.field_values || {};
  } catch { /* ignore */ }

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="p-4 font-medium text-gray-800">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            {fmt(record.date)}
          </div>
        </td>
        <td className="p-4">
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{record.patient?.first_name} {record.patient?.last_name}</span>
            <span className="text-xs text-gray-500">{record.patient?.patient_code || "—"}</span>
          </div>
        </td>
        <td className="p-4">
          <span className="px-2.5 py-0.5 rounded-md text-xs bg-gray-100 text-gray-700 border border-gray-200">
            {record.record_type?.name || "—"}
          </span>
        </td>
        <td className="p-4 text-gray-500 truncate max-w-[200px]">{record.description || "No description"}</td>
        <td className="p-4 text-gray-500 text-xs">{fmt(record.createdAt, true)}</td>
        <td className="p-4">
          {record.appointment && (
            <span className="px-2 py-0.5 rounded-md text-xs bg-indigo-50 text-indigo-600 border border-indigo-100">
              {record.appointment.appointment_no}
            </span>
          )}
        </td>
        <td className="p-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${record.is_active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
            {record.status || (record.is_active ? "Active" : "Inactive")}
          </span>
        </td>
        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-end gap-2">
            <button onClick={() => onDelete(record.id)} className="h-8 px-3 text-xs rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan="8" className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Record Details</h4>
                <button onClick={handlePrint} className="flex items-center gap-2 h-8 px-4 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
                  <Printer className="h-4 w-4" /> Print
                </button>
              </div>

              <div ref={printRef} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Medical Record</h2>
                    <p className="text-gray-500">{record.record_type?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">Date: {fmt(record.date)}</p>
                    <p className="text-sm text-gray-500">ID: #{record.id?.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Patient</h3>
                    <p className="font-bold text-gray-800 text-lg">{record.patient?.first_name} {record.patient?.last_name}</p>
                    <p className="text-gray-600">Code: {record.patient?.patient_code || "—"}</p>
                  </div>
                  {record.appointment && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Appointment</h3>
                      <p className="text-gray-800 font-medium">{record.appointment.appointment_no}</p>
                      <p className="text-gray-500 text-sm">{fmt(record.appointment.scheduled_at)} · {record.appointment.status}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{record.description || "N/A"}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Diagnosis</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{record.diagnosis || "N/A"}</p>
                </div>

                {Object.keys(parsedFields).length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">{record.template?.name || "Template Fields"}</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {Object.entries(parsedFields).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-xs text-gray-500 block">{key}</span>
                          <span className="font-medium text-gray-800">
                            {typeof val === "boolean" ? (val ? "Yes" : "No") : val || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const RecordsList = ({ records, searchTerm, refreshRecords }) => {
  const filtered = records.filter((r) => {
    const name = `${r.patient?.first_name || ""} ${r.patient?.last_name || ""}`.toLowerCase();
    const type = (r.record_type?.name || "").toLowerCase();
    const desc = (r.description || "").toLowerCase();
    const s = searchTerm.toLowerCase();
    return name.includes(s) || type.includes(s) || desc.includes(s);
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medical record?")) return;
    try {
      await recordsService.deleteRecord(id);
      refreshRecords?.();
    } catch {
      alert("Failed to delete record");
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {["Date", "Patient", "Record Type", "Description", "Created At", "Appointment", "Status", "Actions"].map((h) => (
              <th key={h} className="h-10 px-4 font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((r) => <RecordRow key={r.id} record={r} onDelete={handleDelete} />)
          ) : (
            <tr><td colSpan="8" className="p-8 text-center text-gray-400">No records found.</td></tr>
          )}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
        Showing {filtered.length} of {records.length} entries
      </div>
    </div>
  );
};

export default RecordsList;
