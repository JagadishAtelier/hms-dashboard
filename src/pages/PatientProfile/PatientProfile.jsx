import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  Droplet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Pill, 
  FlaskConical, 
  Bed, 
  Stethoscope, 
  Printer, 
  Plus, 
  MapPin, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import patientService from "../../service/patientService.js";
import PatientOverviewFields from "./PatientOverviewFields.jsx";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedCode, setCopiedCode] = useState(false);

  const query = new URLSearchParams(location.search);
  const appointmentId = query.get("appointmentId");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientRes, historyRes] = await Promise.all([
          patientService.getPatientById(id),
          patientService.getHistory(id),
        ]);

        const rawHistory = historyRes?.data || {};

        const getLatest = (arr, dateField = "createdAt") =>
          Array.isArray(arr) && arr.length
            ? [...arr].sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]))[0]
            : null;

        const formattedHistory = {
          latestEncounter: getLatest(rawHistory.encounters, "encounter_date"),
          latestAdmission: getLatest(rawHistory.admissions, "createdAt"),
          latestVital: getLatest(rawHistory.vitals, "createdAt"),
          latestDiagnosis: getLatest(rawHistory.diagnoses, "createdAt"),
          latestAppointment: getLatest(rawHistory.appointments, "createdAt"),
          latestNote: getLatest(rawHistory.clinicalNotes, "createdAt"),
          ...rawHistory,
        };

        setPatient(patientRes?.data || {});
        setHistory(formattedHistory);
      } catch (err) {
        console.error("Error fetching patient profile:", err);
        toast.error("Failed to load patient profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fullName = useMemo(() => {
    return `${patient?.first_name || ""} ${patient?.last_name || ""}`.trim() || "Patient Profile";
  }, [patient]);

  const handleCopyCode = () => {
    if (!patient?.patient_code) return;
    navigator.clipboard.writeText(patient.patient_code);
    setCopiedCode(true);
    toast.success("Patient UHID copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTodayConsultation = () => {
    if (appointmentId) {
      navigate(`/doctor-notes/${appointmentId}`);
    } else if (history?.latestAppointment?.id) {
      navigate(`/doctor-notes/${history.latestAppointment.id}`);
    } else {
      navigate(`/today-appoinments`);
    }
  };

  const latestVitals = history?.latestVital;
  const currentAdmission = history?.latestAdmission;
  const isAdmitted = currentAdmission && currentAdmission.status?.toLowerCase() === "admitted";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-500">Loading patient records...</span>
      </div>
    );
  }

  if (!patient || Object.keys(patient).length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12">
        <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">No Patient Record Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">The requested patient ID does not exist or may have been deleted.</p>
        <button
          onClick={() => navigate('/patient-list')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
        >
          Return to Patient List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-safe">
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/patient-list')}
            className="min-w-[38px] min-h-[38px] flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 active:scale-95 transition-all cursor-pointer"
            title="Back to Patients List"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">PATIENT DOSSIER</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {isAdmitted ? "Inpatient (IPD)" : "Outpatient (OPD)"}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
              {fullName}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 active:scale-95 transition-all cursor-pointer"
            title="Click to copy UHID"
          >
            {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-slate-400" />}
            <span>#{patient.patient_code || "UHID-N/A"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/appointment/create?patientId=${patient.id}`)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            <Calendar size={14} className="text-indigo-600" />
            <span className="hidden sm:inline">Book</span> Appt
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
            title="Print Medical Summary"
          >
            <Printer size={14} className="text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handleTodayConsultation}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Stethoscope size={15} />
            <span>Consultation</span>
          </button>
        </div>
      </div>

      {/* 2. PATIENT HERO IDENTITY BANNER */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50/80 rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          {/* Avatar & Primary Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                {patient.first_name ? patient.first_name.charAt(0).toUpperCase() : "P"}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white ${isAdmitted ? "bg-emerald-500 animate-pulse" : "bg-indigo-500"}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {fullName}
                </h2>
                {patient.gender && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {patient.gender}
                  </span>
                )}
                {patient.blood_group && (
                  <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                    <Droplet size={11} className="fill-rose-500 text-rose-500" />
                    {patient.blood_group}
                  </span>
                )}
              </div>

              {/* Patient Key Demographics */}
              <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs font-semibold text-slate-600 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  {patient.age ? `${patient.age} Yrs` : "Age N/A"}
                </span>

                {patient.dob && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    {new Date(patient.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}

                {patient.phone && (
                  <a href={`tel:${patient.phone}`} className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                    <Phone size={13} />
                    {patient.phone}
                  </a>
                )}

                {patient.email && (
                  <span className="hidden md:flex items-center gap-1.5 text-slate-500">
                    <Mail size={13} />
                    {patient.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current Inpatient Status or OPD Status Card */}
          <div className="w-full lg:w-auto bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Hospital Location</p>
            {isAdmitted ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Bed size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {currentAdmission.ward?.name || "General Ward"} · Room {currentAdmission.room?.room_no || "N/A"}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                    Bed #{currentAdmission.bed?.bed_number || "Allocated"} · Admitted {new Date(currentAdmission.admission_date || currentAdmission.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-tight">Outpatient (OPD Consultation)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No active inpatient bed admission</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emergency contact & address strip if available */}
        {(patient.emergency_contact_phone || patient.address) && (
          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-3 mt-4 border-t border-slate-100 flex-wrap">
            {patient.emergency_contact_phone && (
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-indigo-600" />
                Emergency: <strong className="text-slate-700 font-semibold">{patient.emergency_contact_name || "Contact"}: {patient.emergency_contact_phone}</strong>
              </span>
            )}
            {patient.address && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-slate-400" />
                Address: <span className="text-slate-700">{patient.address} {patient.city ? `, ${patient.city}` : ""}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. CLINICAL VITALS DASHBOARD MATRIX (4 Metrics) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-indigo-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Latest Physiological Vitals</h3>
          </div>
          {latestVitals && (
            <span className="text-[11px] text-slate-400 font-medium">
              Recorded: {new Date(latestVitals.recorded_at || latestVitals.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* VITAL 1: BLOOD PRESSURE */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Blood Pressure</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Activity size={15} />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {latestVitals?.blood_pressure || "— / —"}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>mmHg</span>
                <span className="font-semibold text-emerald-600">Normal &lt; 120/80</span>
              </div>
            </div>
          </div>

          {/* VITAL 2: HEART RATE / PULSE */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-rose-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Heart Rate</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart size={15} />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {latestVitals?.pulse ? `${latestVitals.pulse}` : "—"}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>bpm</span>
                <span className="font-semibold text-slate-600">60 - 100 bpm</span>
              </div>
            </div>
          </div>

          {/* VITAL 3: OXYGEN SATURATION (SpO2) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Oxygen (SpO2)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wind size={15} />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {latestVitals?.spo2 ? `${latestVitals.spo2}%` : "—"}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Saturation</span>
                <span className="font-semibold text-emerald-600">Normal &ge; 95%</span>
              </div>
            </div>
          </div>

          {/* VITAL 4: TEMPERATURE */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-amber-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Body Temp</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Thermometer size={15} />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {latestVitals?.temperature ? `${latestVitals.temperature}°C` : "—"}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Celsius</span>
                <span className="font-semibold text-slate-600">36.5 - 37.5°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CLINICAL HISTORY & DETAILED TABS */}
      <div className="space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 no-scrollbar">
          {[
            { id: "overview", label: "Consultation & Overview", icon: Stethoscope },
            { id: "notes", label: `Clinical Encounters (${history?.encounters?.length || 0})`, icon: FileText },
            { id: "labs", label: `Lab Diagnostics (${history?.labOrders?.length || 0})`, icon: FlaskConical },
            { id: "meds", label: `Prescriptions (${history?.medications?.length || 0})`, icon: Pill },
            { id: "admissions", label: `Inpatient Stays (${history?.admissions?.length || 0})`, icon: Bed },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80"
              }`}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Consultation & Overview */}
        {activeTab === "overview" && (
          <PatientOverviewFields patient={patient} history={history} />
        )}

        {/* Tab 2: Encounters Timeline */}
        {activeTab === "notes" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Encounter History & Clinical Notes</h3>
            {Array.isArray(history?.encounters) && history.encounters.length > 0 ? (
              <div className="space-y-3">
                {history.encounters.map((enc, idx) => (
                  <div key={enc.id || idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-600">Consultation #{idx + 1}</span>
                      <span className="text-slate-400">{new Date(enc.encounter_date || enc.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Chief Complaint:</p>
                      <p className="text-xs text-slate-600 mt-0.5">{enc.chief_complaint || "None recorded"}</p>
                    </div>
                    {enc.plan && (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Clinical Plan:</p>
                        <p className="text-xs text-slate-600 mt-0.5">{enc.plan}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No past clinical encounters recorded.</p>
            )}
          </div>
        )}

        {/* Tab 3: Lab Diagnostic Orders */}
        {activeTab === "labs" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Laboratory Orders & Pathology Reports</h3>
            {Array.isArray(history?.labOrders) && history.labOrders.length > 0 ? (
              <div className="space-y-3">
                {history.labOrders.map((order, idx) => (
                  <div key={order.id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-800">#{order.order_no || "ORD-" + order.id}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          order.status?.toLowerCase() === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {order.status || "Pending"}
                        </span>
                        {order.priority && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {order.priority}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Test Items */}
                    <div className="space-y-1 pt-1">
                      {(order.items || []).map((item, i) => (
                        <div key={item.id || i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800">{item.test_name || item.sample_type || "Lab Investigation"}</span>
                            {item.sample_type && <span className="text-slate-400 ml-1.5">({item.sample_type})</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            {item.result_value && (
                              <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {item.result_value}
                              </span>
                            )}
                            {item.result_file_url && (
                              <a
                                href={item.result_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                Report <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No lab diagnostic orders found for this patient.</p>
            )}
          </div>
        )}

        {/* Tab 4: Prescriptions & Medications */}
        {activeTab === "meds" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Current & Past Medication Regimen</h3>
            {Array.isArray(history?.medications) && history.medications.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {history.medications.map((med, idx) => (
                  <div key={med.id || idx} className="p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Rx #{idx + 1}
                        </span>
                        <Pill size={14} className="text-indigo-600" />
                      </div>
                      <p className="font-bold text-sm text-slate-900 mt-2">{med.medicine_name || "Medicine"}</p>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">Dosage: {med.dosage || "As advised"}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      {med.instructions && <p className="italic">"{med.instructions}"</p>}
                      <p className="mt-1 text-slate-400">{med.duration ? `Duration: ${med.duration}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No active or past medications found.</p>
            )}
          </div>
        )}

        {/* Tab 5: Admissions History */}
        {activeTab === "admissions" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Inpatient Hospital Admissions Timeline</h3>
            {Array.isArray(history?.admissions) && history.admissions.length > 0 ? (
              <div className="space-y-3">
                {history.admissions.map((adm, idx) => (
                  <div key={adm.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <Bed size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Admission #{adm.admission_no || adm.id} · {adm.ward?.name || "General Ward"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Room: {adm.room?.room_no || adm.room_id || "N/A"} · Bed: #{adm.bed?.bed_number || adm.bed_id || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        adm.status?.toLowerCase() === "admitted" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-700"
                      }`}>
                        {adm.status || "Completed"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(adm.admission_date || adm.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No inpatient admissions recorded for this patient.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

