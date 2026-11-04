import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  User,
  HeartPulse,
  Activity,
  ClipboardCheck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCheck,
  XCircle,
  FileText,
  Sliders,
  Send,
  AlertCircle
} from "lucide-react";
import clinicalEngineService from "../../service/clinicalEngineService.js";
import admissionsService from "../../service/addmissionsService.js";
import doctorsService from "../../service/doctorsService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";

export default function ClinicalTasksPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("roundings"); // 'roundings' | 'followups'

  // Rounding States
  const [admissions, setAdmissions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState("");
  const [patientRoundings, setPatientRoundings] = useState([]);
  const [roundingFormOpen, setRoundingFormOpen] = useState(false);
  const [roundingData, setRoundingData] = useState({
    doctor_id: "",
    soap_subjective: "",
    soap_objective: "",
    soap_assessment: "",
    soap_plan: "",
    vital_status: "STABLE",
    discharge_readiness_score: 5,
    ready_for_discharge: false,
    notes: "",
  });
  const [savingRounding, setSavingRounding] = useState(false);

  // Follow-ups States
  const [followUps, setFollowUps] = useState([]);
  const [followUpFilterStatus, setFollowUpFilterStatus] = useState("SCHEDULED");
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    admission_id: "",
    doctor_id: "",
    follow_up_date: dayjs().add(7, "day").format("YYYY-MM-DD"),
    follow_up_type: "PHYSICAL_OPD",
    clinical_summary: "",
  });
  const [schedulingFollowUp, setSchedulingFollowUp] = useState(false);

  // Vital Generation State
  const [generatingVitals, setGeneratingVitals] = useState(false);

  const fetchInitialData = async () => {
    try {
      setRefreshing(true);
      const [admRes, docRes, fupRes] = await Promise.all([
        admissionsService.getAll({ status: "admitted", limit: 100 }),
        doctorsService.getAllDoctors({ is_active: true, limit: 100 }),
        clinicalEngineService.getPendingFollowUps({ status: followUpFilterStatus }),
      ]);

      const admList = admRes?.data?.data || admRes?.data || [];
      setAdmissions(Array.isArray(admList) ? admList : []);

      const docList = docRes?.data?.data || docRes?.data || [];
      setDoctors(Array.isArray(docList) ? docList : []);

      if (fupRes?.data) setFollowUps(fupRes.data);

      if (admList.length > 0 && !selectedAdmissionId) {
        setSelectedAdmissionId(admList[0].id);
      }
    } catch (err) {
      console.error("Failed to load clinical data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPatientRoundings = async (admissionId) => {
    if (!admissionId) return;
    try {
      const res = await clinicalEngineService.getPatientRoundings(admissionId);
      if (res?.data) setPatientRoundings(res.data);
    } catch (err) {
      console.error("Failed to load patient roundings:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [followUpFilterStatus]);

  useEffect(() => {
    if (selectedAdmissionId) {
      fetchPatientRoundings(selectedAdmissionId);
    }
  }, [selectedAdmissionId]);

  const handleRecordRounding = async (e) => {
    e.preventDefault();
    if (!selectedAdmissionId) {
      alert("Please select an active inpatient");
      return;
    }
    if (!roundingData.doctor_id) {
      alert("Please select the rounding physician");
      return;
    }
    try {
      setSavingRounding(true);
      await clinicalEngineService.recordPhysicianRounding({
        admission_id: selectedAdmissionId,
        ...roundingData,
      });
      setRoundingFormOpen(false);
      setRoundingData({
        doctor_id: "",
        soap_subjective: "",
        soap_objective: "",
        soap_assessment: "",
        soap_plan: "",
        vital_status: "STABLE",
        discharge_readiness_score: 5,
        ready_for_discharge: false,
        notes: "",
      });
      await fetchPatientRoundings(selectedAdmissionId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record physician rounding");
    } finally {
      setSavingRounding(false);
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!newFollowUp.admission_id) {
      alert("Please select a patient admission");
      return;
    }
    try {
      setSchedulingFollowUp(true);
      await clinicalEngineService.scheduleFollowUp(newFollowUp);
      setFollowUpModalOpen(false);
      setNewFollowUp({
        admission_id: "",
        doctor_id: "",
        follow_up_date: dayjs().add(7, "day").format("YYYY-MM-DD"),
        follow_up_type: "PHYSICAL_OPD",
        clinical_summary: "",
      });
      const res = await clinicalEngineService.getPendingFollowUps({ status: followUpFilterStatus });
      if (res?.data) setFollowUps(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to schedule follow up");
    } finally {
      setSchedulingFollowUp(false);
    }
  };

  const handleCompleteFollowUp = async (id) => {
    const notes = prompt("Enter clinical consultation follow-up outcome notes:");
    if (notes === null) return;
    try {
      await clinicalEngineService.completeFollowUp(id, {
        status: "COMPLETED",
        patient_status_notes: notes || "Follow-up consultation successfully conducted",
      });
      const res = await clinicalEngineService.getPendingFollowUps({ status: followUpFilterStatus });
      if (res?.data) setFollowUps(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete follow up");
    }
  };

  const handleGenerateVitalTasks = async () => {
    try {
      setGeneratingVitals(true);
      const res = await clinicalEngineService.generateVitalTasks();
      alert(`Successfully generated ${res?.data?.tasksGenerated || 0} scheduled vital check tasks based on ward intervals!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate vital tasks");
    } finally {
      setGeneratingVitals(false);
    }
  };

  if (loading) return <Loading />;

  const selectedAdmission = admissions.find((a) => a.id === selectedAdmissionId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 🏥 Top Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Clinical Task & Follow-Up Engine
            </h1>
            <p className="text-sm text-gray-500">
              Structured SOAP rounding notes, discharge readiness scoring, and automated post-discharge follow-ups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateVitalTasks}
            disabled={generatingVitals}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-all shadow-sm"
          >
            <HeartPulse className="w-4 h-4" />
            {generatingVitals ? "Generating..." : "Generate Ward Vital Checks"}
          </button>

          <button
            onClick={fetchInitialData}
            disabled={refreshing}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 🧭 Tabs Switcher */}
      <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("roundings")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "roundings"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ClipboardCheck className="w-4 h-4 text-blue-600" />
          Physician Daily Rounding & SOAP
        </button>

        <button
          onClick={() => setActiveTab("followups")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "followups"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          Post-Discharge Follow-Up Engine
        </button>
      </div>

      {/* 🩺 Tab 1: Physician Rounding & SOAP Notes */}
      {activeTab === "roundings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inpatients Selector List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Active Inpatients ({admissions.length})
              </h3>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {admissions.map((adm) => {
                const isSelected = adm.id === selectedAdmissionId;
                return (
                  <div
                    key={adm.id}
                    onClick={() => setSelectedAdmissionId(adm.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-300 shadow-sm"
                        : "bg-gray-50/40 border-gray-200 hover:bg-gray-100/60"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span>
                        {adm.patient?.first_name} {adm.patient?.last_name || ""}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600">
                        Bed {adm.bed?.bed_no || "N/A"}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      {adm.ward?.name || "Ward"} • Room {adm.room?.room_no || "N/A"}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Admitted: {dayjs(adm.admission_date).format("MMM D, YYYY")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chronological Rounding Notes & Actions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            {selectedAdmission ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedAdmission.patient?.first_name} {selectedAdmission.patient?.last_name || ""}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedAdmission.patient?.patient_code} • {selectedAdmission.patient?.gender} • Bed {selectedAdmission.bed?.bed_no} ({selectedAdmission.ward?.name})
                    </p>
                  </div>

                  <button
                    onClick={() => setRoundingFormOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                    New Physician Round
                  </button>
                </div>

                {/* Rounding History Stream */}
                <div className="space-y-4">
                  {patientRoundings.map((round) => (
                    <div
                      key={round.id}
                      className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-gray-900 text-xs">
                            Dr. {round.doctor_name || round.doctor?.doctor_name || "Attending Doctor"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              round.vital_status === "STABLE"
                                ? "bg-emerald-50 text-emerald-700"
                                : round.vital_status === "CRITICAL"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {round.vital_status}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {dayjs(round.rounding_date).format("MMM D, YYYY")}
                          </span>
                        </div>
                      </div>

                      {/* SOAP Matrix */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                          <span className="font-bold text-gray-700 block text-[11px]">Subjective (S):</span>
                          <p className="text-gray-600 mt-0.5">{round.soap_subjective || "No complaints recorded."}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                          <span className="font-bold text-gray-700 block text-[11px]">Objective (O):</span>
                          <p className="text-gray-600 mt-0.5">{round.soap_objective || "Vitals within acceptable limits."}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                          <span className="font-bold text-gray-700 block text-[11px]">Assessment (A):</span>
                          <p className="text-gray-600 mt-0.5">{round.soap_assessment || "Condition progressing as expected."}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                          <span className="font-bold text-gray-700 block text-[11px]">Plan (P):</span>
                          <p className="text-gray-600 mt-0.5">{round.soap_plan || "Continue supportive management."}</p>
                        </div>
                      </div>

                      {/* Discharge Readiness Badge */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-500">Discharge Readiness:</span>
                          <span className="font-bold text-gray-900 px-2 py-0.5 bg-white rounded border">
                            {round.discharge_readiness_score}/10
                          </span>
                        </div>
                        {round.ready_for_discharge && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved for Discharge Protocol
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {patientRoundings.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-xs">
                      No rounding notes recorded for this admission yet. Click "New Physician Round" above.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-400 text-xs">
                Select an inpatient from the left panel to view clinical rounding history
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📅 Tab 2: Post-Discharge Follow-ups */}
      {activeTab === "followups" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Post-Discharge Follow-Up Schedule</h2>
              <p className="text-xs text-gray-500">Track outpatient visits, teleconsultations, and recovery touchpoints</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={followUpFilterStatus}
                onChange={(e) => setFollowUpFilterStatus(e.target.value)}
                className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Follow-ups</option>
                <option value="SCHEDULED">Scheduled Only</option>
                <option value="COMPLETED">Completed Only</option>
                <option value="MISSED">Missed Only</option>
              </select>

              <button
                onClick={() => setFollowUpModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule Follow-Up
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Follow-Up Date</th>
                  <th className="py-2.5 px-3">Attending Doctor</th>
                  <th className="py-2.5 px-3">Clinical Plan / Summary</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {followUps.map((fup) => (
                  <tr key={fup.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {fup.patient?.first_name} {fup.patient?.last_name || ""}
                      <div className="text-[11px] text-gray-400 font-normal">
                        {fup.patient?.phone || "No Phone"}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                        {fup.follow_up_type}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-medium">
                      {dayjs(fup.follow_up_date).format("MMM D, YYYY")}
                    </td>

                    <td className="py-2.5 px-3">
                      Dr. {fup.doctor?.doctor_name || "Care Team"}
                    </td>

                    <td className="py-2.5 px-3 max-w-xs truncate text-gray-500">
                      {fup.clinical_summary || fup.patient_status_notes || "—"}
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          fup.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {fup.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {fup.status === "SCHEDULED" && (
                        <button
                          onClick={() => handleCompleteFollowUp(fup.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {followUps.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs">
              No follow-up records found matching the status filter.
            </div>
          )}
        </div>
      )}

      {/* 🩺 Modal: New Physician Rounding Form */}
      {roundingFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Record Physician Daily Round (SOAP)
              </h3>
              <button onClick={() => setRoundingFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordRounding} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Attending Physician *</label>
                  <select
                    required
                    value={roundingData.doctor_id}
                    onChange={(e) => setRoundingData({ ...roundingData, doctor_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.doctor_name} ({d.specialties || "General"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-1">Vital Status</label>
                  <select
                    value={roundingData.vital_status}
                    onChange={(e) => setRoundingData({ ...roundingData, vital_status: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="STABLE">Stable</option>
                    <option value="GUARDED">Guarded</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="IMPROVING">Improving</option>
                  </select>
                </div>
              </div>

              {/* SOAP Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Subjective (Symptoms / Chief Complaints)</label>
                  <textarea
                    rows={2}
                    placeholder="Patient states headache improved, mild nausea..."
                    value={roundingData.soap_subjective}
                    onChange={(e) => setRoundingData({ ...roundingData, soap_subjective: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-1">Objective (Vitals, Lab, Exam findings)</label>
                  <textarea
                    rows={2}
                    placeholder="BP 125/80, SpO2 98%, abdomen soft non-tender..."
                    value={roundingData.soap_objective}
                    onChange={(e) => setRoundingData({ ...roundingData, soap_objective: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-1">Assessment (Clinical Impression)</label>
                  <textarea
                    rows={2}
                    placeholder="Post-operative recovery uncomplicated, resolving..."
                    value={roundingData.soap_assessment}
                    onChange={(e) => setRoundingData({ ...roundingData, soap_assessment: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-1">Plan (Orders & Medications)</label>
                  <textarea
                    rows={2}
                    placeholder="Wean IV fluids, initiate oral analgesics, stepdown..."
                    value={roundingData.soap_plan}
                    onChange={(e) => setRoundingData({ ...roundingData, soap_plan: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Discharge Readiness Slider */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">
                    Discharge Readiness Score: {roundingData.discharge_readiness_score} / 10
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {roundingData.discharge_readiness_score >= 8
                      ? "Eligible for Discharge Protocol"
                      : "Continued Inpatient Care"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={roundingData.discharge_readiness_score}
                  onChange={(e) =>
                    setRoundingData({
                      ...roundingData,
                      discharge_readiness_score: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600"
                />

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="ready_for_discharge"
                    checked={roundingData.ready_for_discharge}
                    onChange={(e) =>
                      setRoundingData({
                        ...roundingData,
                        ready_for_discharge: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="ready_for_discharge" className="font-semibold text-gray-900 cursor-pointer">
                    Certify patient as ready for discharge (triggers Pharmacy & Billing auto-cascade)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoundingFormOpen(false)}
                  className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRounding}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Save Physician Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📅 Modal: Schedule Follow-up */}
      {followUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Schedule Clinical Follow-Up</h3>
              <button onClick={() => setFollowUpModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-gray-700 block mb-1">Inpatient Admission *</label>
                <select
                  required
                  value={newFollowUp.admission_id}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, admission_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Inpatient</option>
                  {admissions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.patient?.first_name} {a.patient?.last_name || ""} ({a.patient?.patient_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Follow-Up Date *</label>
                  <input
                    type="date"
                    required
                    value={newFollowUp.follow_up_date}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, follow_up_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-1">Consultation Mode</label>
                  <select
                    value={newFollowUp.follow_up_type}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, follow_up_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PHYSICAL_OPD">Physical OPD</option>
                    <option value="TELECONSULT">Teleconsultation</option>
                    <option value="PHONE_CALL">Nurse Phone Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Physician</label>
                <select
                  value={newFollowUp.doctor_id}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, doctor_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Attending Care Team</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.doctor_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Clinical Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Suture removal, repeat liver enzymes, surgical scar check..."
                  value={newFollowUp.clinical_summary}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, clinical_summary: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFollowUpModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingFollowUp}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Confirm Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

