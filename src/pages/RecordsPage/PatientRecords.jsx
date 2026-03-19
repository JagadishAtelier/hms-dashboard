import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ChevronDown, ChevronRight, Printer } from "lucide-react";
import { useRef } from "react";
import dayjs from "dayjs";
import recordsService from "../../service/recordsService";
import patientService from "../../service/patientService";

const RecordRow = ({ record }) => {
  const [expanded, setExpanded] = useState(false);
  const printRef = useRef(null);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Medical Record</title></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  let parsedFields = {};
  let templateEntries = null;
  try {
    const fv = typeof record.field_values === "string" ? JSON.parse(record.field_values) : record.field_values || {};
    if (fv._template_entries) {
      templateEntries = fv._template_entries;
    } else {
      parsedFields = fv;
    }
  } catch { /* ignore */ }

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="p-4 font-medium text-gray-800">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            {dayjs(record.date).format("MMMM D, YYYY")}
          </div>
        </td>
        <td className="p-4">
          <span className="px-2.5 py-0.5 rounded-md text-xs bg-gray-100 text-gray-700 border border-gray-200">
            {record.record_type?.name || "—"}
          </span>
        </td>
        <td className="p-4 text-gray-500 truncate max-w-[200px]">{record.description || "—"}</td>
        <td className="p-4">
          {record.appointment ? (
            <span className="px-2 py-0.5 rounded-md text-xs bg-indigo-50 text-indigo-600 border border-indigo-100">
              {record.appointment.appointment_no}
            </span>
          ) : "—"}
        </td>
        <td className="p-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${record.is_active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
            {record.status || (record.is_active ? "Active" : "Inactive")}
          </span>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan="5" className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Record Details</h4>
                <button onClick={handlePrint} className="flex items-center gap-2 h-8 px-4 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
                  <Printer className="h-4 w-4" /> Print
                </button>
              </div>
              <div ref={printRef} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="border-b pb-4 mb-4 flex justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Medical Record</h2>
                    <p className="text-gray-500">{record.record_type?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Date: {dayjs(record.date).format("MMM D, YYYY")}</p>
                    <p className="text-sm text-gray-500">ID: #{record.id?.slice(0, 8)}</p>
                  </div>
                </div>
                {record.appointment && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Appointment</h3>
                    <p className="text-gray-800 font-medium">{record.appointment.appointment_no}</p>
                    <p className="text-gray-500 text-sm">{dayjs(record.appointment.scheduled_at).format("MMM D, YYYY")} · {record.appointment.status}</p>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{record.description || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Diagnosis</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{record.diagnosis || "N/A"}</p>
                </div>
                {templateEntries ? (
                  <div className="space-y-4">
                    {templateEntries.map((entry, i) => (
                      <div key={i}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Template {i + 1}</h3>
                        {Object.keys(entry.field_values || {}).length > 0 ? (
                          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {Object.entries(entry.field_values).map(([key, val]) => (
                              <div key={key}>
                                <span className="text-xs text-gray-500 block">{key}</span>
                                <span className="font-medium text-gray-800">{typeof val === "boolean" ? (val ? "Yes" : "No") : val || "—"}</span>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-gray-400">No fields filled.</p>}
                      </div>
                    ))}
                  </div>
                ) : Object.keys(parsedFields).length > 0 ? (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{record.template?.name || "Fields"}</h3>
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {Object.entries(parsedFields).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-xs text-gray-500 block">{key}</span>
                          <span className="font-medium text-gray-800">{typeof val === "boolean" ? (val ? "Yes" : "No") : val || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const PatientRecords = () => {
  const { patient_id } = useParams();
  const [searchParams] = useSearchParams();
  const appointment_id = searchParams.get("appointment_id");
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pRes, rRes] = await Promise.all([
          patientService.getPatientById(patient_id),
          recordsService.getAllRecords({ patient_id }),
        ]);
        setPatient(pRes.data || pRes);
        setRecords(rRes.data?.data?.data || rRes.data?.data || rRes.data || []);
      } catch (err) {
        console.error("Failed to load patient records", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patient_id]);

  const handleCreateRecord = () => {
    const params = new URLSearchParams({ patient_id });
    if (appointment_id) params.set("appointment_id", appointment_id);
    navigate(`/records/create?${params.toString()}`);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 h-9 px-3 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {patient ? `${patient.first_name} ${patient.last_name}` : "Patient"} — Medical Records
            </h1>
            {patient && (
              <p className="text-sm text-gray-500">
                {patient.patient_code} · {patient.gender} · {patient.phone || "—"}
                {appointment_id && <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-xs border border-indigo-100">Appointment linked</span>}
              </p>
            )}
          </div>
        </div>
        <button onClick={handleCreateRecord} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
          <Plus className="h-4 w-4" /> Create Record
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading records...</div>
        ) : (
          <>
            <table className="w-full text-sm text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Date", "Record Type", "Description", "Appointment", "Status"].map((h) => (
                    <th key={h} className="h-10 px-4 font-semibold text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((r) => <RecordRow key={r.id} record={r} />)
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400">
                      No records found for this patient.
                      <br />
                      <button onClick={handleCreateRecord} className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
                        <Plus className="h-4 w-4" /> Create First Record
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
              {records.length} record{records.length !== 1 ? "s" : ""} found
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;
