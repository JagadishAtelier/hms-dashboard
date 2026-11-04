// src/pages/lab/LabTestResults.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Info,
  X,
} from "lucide-react";
import { toast } from "sonner";
import labTestOrderService from "../../service/labtestorderService.js";
import BASE_API from "../../api/baseurl.js";

function LabTestResults() {
  const { patient_id } = useParams();
  const location = useLocation();
  const appointment_id = new URLSearchParams(location.search).get("appointment_id");
  const admission_id = new URLSearchParams(location.search).get("admission_id");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [resultValue, setResultValue] = useState("");
  const [resultFileUrl, setResultFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("user"));
  const userRole = userInfo?.role;

  useEffect(() => {
    if (admission_id) {
      fetchByAdmission(admission_id);
    } else if (appointment_id) {
      fetchLabTestOrder(appointment_id);
    }
  }, [appointment_id, admission_id]);

  const fetchByAdmission = async (admId) => {
    try {
      setLoading(true);
      const res = await labTestOrderService.getLabTestOrderByAdmissionId(admId);
      setOrder(res?.data ?? null);
    } catch (err) {
      console.error("Failed to fetch lab test results", err);
      toast.error(err?.response?.data?.message || "Failed to load lab test results");
    } finally {
      setLoading(false);
    }
  };

  const fetchLabTestOrder = async (apptId) => {
    try {
      setLoading(true);
      const res = await labTestOrderService.getLabTestOrderByAppointmentId(apptId);
      setOrder(res?.data ?? null);
    } catch (err) {
      console.error("Failed to fetch lab test results", err);
      toast.error(err?.response?.data?.message || "Failed to load lab test results");
    } finally {
      setLoading(false);
    }
  };

  const handleAddResult = (item) => {
    setSelectedItem(item);
    setResultValue(item?.result_value || "");
    setResultFileUrl(item?.result_file_url || "");
    setShowModal(true);
  };

  const handleSubmitResult = async () => {
    if (!resultValue.trim()) {
      toast.error("Please enter a diagnostic result value");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await labTestOrderService.markLabTestItemResulted(selectedItem.id, {
        result_value: resultValue,
        result_file_url: resultFileUrl,
      });

      if (res?.is_panic_value) {
        toast.error("CRITICAL PANIC VALUE BREACH: Emergency alert dispatched to attending clinicians.");
      } else {
        toast.success(res?.message || "Result saved successfully");
      }

      setShowModal(false);
      if (admission_id) fetchByAdmission(admission_id);
      else fetchLabTestOrder(appointment_id);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to record result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading diagnostic file...");
    try {
      const res = await labTestOrderService.uploadFile(formData);
      const relativePath = res?.fileUrl || res?.data?.fileUrl;
      if (relativePath) {
        setResultFileUrl(relativePath);
        toast.success("File uploaded successfully", { id: toastId });
      } else {
        toast.error("Failed to get file URL from server", { id: toastId });
      }
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Failed to upload file", { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Biological & panic calculation helpers for modal
  const numVal = parseFloat(resultValue);
  const testObj = selectedItem?.test;
  const isPanic =
    !isNaN(numVal) &&
    testObj &&
    ((testObj.critical_low !== null && numVal < testObj.critical_low) ||
      (testObj.critical_high !== null && numVal > testObj.critical_high));

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-[#0E1680]" size={40} />
      </div>
    );

  const patient = order?.patient;
  const items = order?.items || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0E1680]">
            Diagnostic Laboratory Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified analytical measurements, reference intervals, and panic value audit trails
          </p>
        </div>
        {order?.has_panic_alert && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold animate-pulse">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            CRITICAL PANIC ALERT BREACH
          </div>
        )}
      </div>

      {/* Patient & Order Details Card */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          <div className="space-y-1.5 text-sm">
            <h3 className="font-bold text-[#0E1680] text-sm uppercase tracking-wider mb-2">
              Patient Information
            </h3>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">Name:</span>{" "}
              {patient?.first_name} {patient?.last_name}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">UHID:</span>{" "}
              {patient?.patient_code || "PAT-N/A"}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">Gender / Age:</span>{" "}
              {patient?.gender || "N/A"} / {patient?.age ? `${patient.age} yrs` : "N/A"}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">Phone:</span>{" "}
              {patient?.phone || "N/A"}
            </p>
          </div>

          <div className="space-y-1.5 text-sm">
            <h3 className="font-bold text-[#0E1680] text-sm uppercase tracking-wider mb-2">
              Order Requisition Details
            </h3>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">Order No:</span>{" "}
              <span className="font-mono font-bold text-slate-900">{order?.order_no}</span>
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">Clinical Priority:</span>{" "}
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${
                order?.priority === "stat"
                  ? "bg-red-100 text-red-800"
                  : order?.priority === "urgent"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-800"
              }`}>
                {order?.priority || "Routine"}
              </span>
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">Requisition Date:</span>{" "}
              {new Date(order?.order_date).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="pt-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-[#0E1680]">
              Diagnostic Items & Analytical Results
            </h3>
            <span className="text-xs text-slate-500">Total Items: {items.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-sm rounded-lg overflow-hidden">
              <thead className="bg-[#0E1680] text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Diagnostic Test</th>
                  <th className="p-3 text-left">Biological Specimen</th>
                  <th className="p-3 text-left">Result Value</th>
                  <th className="p-3 text-left">Units</th>
                  <th className="p-3 text-left">Reference Interval</th>
                  <th className="p-3 text-left">Clinical Status</th>
                  <th className="p-3 text-left">Attachment</th>
                  {userRole === "Lab Technician" && (
                    <th className="p-3 text-left">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items?.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 text-xs text-slate-400 font-medium">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{it?.test?.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{it?.test?.code} • {it?.test?.category}</div>
                    </td>
                    <td className="p-3 text-xs text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {it?.sample_type || "Specimen Unassigned"}
                      </span>
                    </td>
                    <td className="p-3">
                      {it?.result_value ? (
                        <span className={`font-bold font-mono text-base ${
                          it.is_panic_value
                            ? "text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200"
                            : "text-slate-900"
                        }`}>
                          {it.result_value}
                        </span>
                      ) : (
                        <span className="italic text-xs text-slate-400">Awaiting result</span>
                      )}
                    </td>
                    <td className="p-3 text-xs font-semibold text-slate-600">{it?.test?.units || "-"}</td>
                    <td className="p-3 text-xs text-slate-600 font-medium">{it?.test?.reference_range || "-"}</td>
                    <td className="p-3">
                      {it.is_panic_value ? (
                        <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Panic Alert
                        </span>
                      ) : it.result_value ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Resulted
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> In Process
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {it?.result_file_url ? (
                        <a
                          href={`${BASE_API}/hms/${it.result_file_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" /> View
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    {userRole === "Lab Technician" && (
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#0E1680] border-[#0E1680] hover:bg-indigo-50 text-xs cursor-pointer"
                          onClick={() => handleAddResult(it)}
                        >
                          {it.result_value ? "Amend Result" : "Enter Result"}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Result Entry Modal with Clinical Guidance & Live Reference Bounds */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#0E1680]">
                  Record Diagnostic Result
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedItem?.test?.name} ({selectedItem?.test?.code})
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Reference Intervals & Panic Bounds Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-semibold uppercase block text-[10px]">Reference Range</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {testObj?.reference_range} {testObj?.units}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase block text-[10px]">Specimen Type</span>
                  <span className="font-medium text-slate-800 text-xs">
                    {selectedItem?.sample_type || "N/A"}
                  </span>
                </div>
              </div>

              {(testObj?.critical_low !== null || testObj?.critical_high !== null) && (
                <div className="border-t border-slate-200 pt-1.5 flex items-center gap-2 text-slate-600 text-[11px]">
                  <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span>
                    Critical Thresholds: Low &lt; <strong>{testObj?.critical_low ?? "N/A"}</strong> | High &gt; <strong>{testObj?.critical_high ?? "N/A"}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Live Panic Alert Warning */}
            {isPanic && (
              <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-pulse">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <strong className="block font-bold">CRITICAL PANIC VALUE BREACH</strong>
                  Entered value is outside physiological safety bounds. Saving will broadcast an immediate hospital-wide clinical alert.
                </div>
              </div>
            )}

            {/* Result Value Input with Attached Unit Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                Observed Measurement Value *
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value)}
                  placeholder={`Enter value (e.g. 95)`}
                  className="font-mono text-base font-bold flex-1"
                  autoFocus
                />
                <span className="bg-slate-100 border border-slate-300 px-3 py-2 rounded-md font-semibold text-xs text-slate-700">
                  {testObj?.units || "units"}
                </span>
              </div>
            </div>

            {/* Diagnostic Document File Upload */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                Analyzer Printout / PDF Report (Optional)
              </label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="text-xs"
              />
              {resultFileUrl && (
                <span className="text-[11px] text-emerald-600 font-medium block">
                  File attached: {resultFileUrl.split("/").pop()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResult}
                disabled={isSubmitting}
                className="bg-[#0E1680] hover:bg-[#0b1163] text-white font-semibold cursor-pointer gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? "Validating & Submitting..." : "Submit Diagnostic Result"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabTestResults;
