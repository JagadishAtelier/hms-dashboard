import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import sessionService from "../../service/sessionService.js";
import patientService from "../../service/patientService.js";
import doctorsService from "../../service/doctorsService.js";

const DAYS = [
    { v: 0, l: "Sun" }, { v: 1, l: "Mon" }, { v: 2, l: "Tue" },
    { v: 3, l: "Wed" }, { v: 4, l: "Thu" }, { v: 5, l: "Fri" }, { v: 6, l: "Sat" },
];

export default function SessionPlanCreate() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patientSearch, setPatientSearch] = useState("");
    const [doctorSearch, setDoctorSearch] = useState("");
    const [showPatientDrop, setShowPatientDrop] = useState(false);
    const [showDoctorDrop, setShowDoctorDrop] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const [form, setForm] = useState({
        plan_name: "",
        frequency_type: "weekly",
        sessions_per_period: 2,
        total_sessions: 8,
        preferred_days: [1, 3],
        preferred_time: "09:00",
        start_date: new Date().toISOString().split("T")[0],
        visit_type: "OPD",
        reason: "",
        notes: "",
    });

    useEffect(() => {
        patientService.getAllPatients({ limit: 500 })
            .then(r => { const d = r?.data?.data; setPatients(Array.isArray(d) ? d : d?.data ?? []); })
            .catch(() => {});
        doctorsService.getAllDoctors({ limit: 200 })
            .then(r => { const d = r?.data?.data; setDoctors(Array.isArray(d) ? d : d?.data ?? []); })
            .catch(() => {});
    }, []);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const toggleDay = (day) => {
        const days = form.preferred_days.includes(day)
            ? form.preferred_days.filter(d => d !== day)
            : [...form.preferred_days, day].sort();
        set("preferred_days", days);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) { toast.error("Select a patient"); return; }
        if (!selectedDoctor) { toast.error("Select a doctor"); return; }
        if (!form.plan_name.trim()) { toast.error("Plan name is required"); return; }
        setSaving(true);
        try {
            await sessionService.createPlan({
                ...form,
                patient_id: selectedPatient.id,
                doctor_id: selectedDoctor.id,
            });
            toast.success(`Session plan created — ${form.total_sessions} sessions scheduled`);
            navigate("/session-plans");
        } catch (e) { toast.error(e?.response?.data?.message || "Failed to create plan"); }
        finally { setSaving(false); }
    };

    const filteredPatients = (patientSearch.trim()
        ? patients.filter(p => `${p.first_name} ${p.last_name} ${p.patient_code} ${p.phone || ""}`.toLowerCase().includes(patientSearch.toLowerCase()))
        : patients
    ).slice(0, 10);

    const filteredDoctors = (doctorSearch.trim()
        ? doctors.filter(d => (d.doctor_name || "").toLowerCase().includes(doctorSearch.toLowerCase()))
        : doctors
    ).slice(0, 10);

    // Estimated end date preview
    const estimatedSessions = form.total_sessions;
    const perPeriod = form.sessions_per_period;
    const weeks = form.frequency_type === "weekly" ? Math.ceil(estimatedSessions / perPeriod) : null;
    const months = form.frequency_type === "monthly" ? Math.ceil(estimatedSessions / perPeriod) : null;

    return (
        <div className="md:p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#0E1680]">Create Session Plan</h2>
                <p className="text-sm text-gray-500 mt-0.5">Assign a recurring session schedule to a patient</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Patient & Doctor */}
                <div className="bg-white p-6 rounded-lg shadow space-y-5">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Patient & Doctor</h3>
                    <div className="grid md:grid-cols-2 gap-5">

                        {/* Patient */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Patient <span className="text-red-500">*</span>
                            </label>
                            {selectedPatient ? (
                                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                        <p className="text-xs text-gray-500">{selectedPatient.patient_code} · {selectedPatient.phone}</p>
                                    </div>
                                    <button type="button" onClick={() => { setSelectedPatient(null); setPatientSearch(""); setShowPatientDrop(false); }} className="text-xs text-red-500 hover:underline ml-2">Change</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                    <input
                                        value={patientSearch}
                                        onChange={e => setPatientSearch(e.target.value)}
                                        onFocus={() => setShowPatientDrop(true)}
                                        onBlur={() => setTimeout(() => setShowPatientDrop(false), 150)}
                                        placeholder="Click to select patient..."
                                        className="w-full pl-8 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30"
                                    />
                                    {showPatientDrop && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                            {filteredPatients.length === 0
                                                ? <p className="px-3 py-3 text-sm text-gray-400">No patients found</p>
                                                : filteredPatients.map(p => (
                                                    <button key={p.id} type="button"
                                                        onMouseDown={() => { setSelectedPatient(p); setPatientSearch(""); setShowPatientDrop(false); }}
                                                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                                                        <p className="text-sm font-medium text-gray-800">{p.first_name} {p.last_name}</p>
                                                        <p className="text-xs text-gray-400">{p.patient_code} · {p.phone}</p>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Doctor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Doctor <span className="text-red-500">*</span>
                            </label>
                            {selectedDoctor ? (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                                    <p className="text-sm font-semibold text-gray-800">{selectedDoctor.doctor_name}</p>
                                    <button type="button" onClick={() => { setSelectedDoctor(null); setDoctorSearch(""); setShowDoctorDrop(false); }} className="text-xs text-red-500 hover:underline ml-2">Change</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                    <input
                                        value={doctorSearch}
                                        onChange={e => setDoctorSearch(e.target.value)}
                                        onFocus={() => setShowDoctorDrop(true)}
                                        onBlur={() => setTimeout(() => setShowDoctorDrop(false), 150)}
                                        placeholder="Click to select doctor..."
                                        className="w-full pl-8 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30"
                                    />
                                    {showDoctorDrop && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                            {filteredDoctors.length === 0
                                                ? <p className="px-3 py-3 text-sm text-gray-400">No doctors found</p>
                                                : filteredDoctors.map(d => (
                                                    <button key={d.id} type="button"
                                                        onMouseDown={() => { setSelectedDoctor(d); setDoctorSearch(""); setShowDoctorDrop(false); }}
                                                        className="w-full text-left px-3 py-2.5 hover:bg-green-50 border-b border-gray-50 last:border-0">
                                                        <p className="text-sm font-medium text-gray-800">{d.doctor_name}</p>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Plan Details */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Plan Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="block text-sm">
                            Plan Name <span className="text-red-500">*</span>
                            <Input value={form.plan_name} onChange={e => set("plan_name", e.target.value)}
                                placeholder="e.g. Physiotherapy Course" className="mt-1" />
                        </label>
                        <label className="block text-sm">
                            Visit Type
                            <select value={form.visit_type} onChange={e => set("visit_type", e.target.value)}
                                className="border rounded-md p-2 w-full mt-1">
                                <option>OPD</option><option>teleconsult</option><option>emergency</option>
                            </select>
                        </label>
                        <label className="block text-sm">
                            Start Date
                            <Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} className="mt-1" />
                        </label>
                        <label className="block text-sm">
                            Preferred Time
                            <Input type="time" value={form.preferred_time} onChange={e => set("preferred_time", e.target.value)} className="mt-1" />
                        </label>
                    </div>
                    <label className="block text-sm">
                        Reason / Diagnosis
                        <textarea value={form.reason} onChange={e => set("reason", e.target.value)} rows={2}
                            className="border rounded-md p-2 w-full mt-1 text-sm" placeholder="e.g. Post-surgery physiotherapy" />
                    </label>
                </div>

                {/* Frequency */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Frequency & Schedule</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <label className="block text-sm">
                            Frequency
                            <select value={form.frequency_type} onChange={e => set("frequency_type", e.target.value)}
                                className="border rounded-md p-2 w-full mt-1">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </label>
                        <label className="block text-sm">
                            Sessions per {form.frequency_type === "daily" ? "Day" : form.frequency_type === "weekly" ? "Week" : "Month"}
                            <Input type="number" min={1} max={7} value={form.sessions_per_period}
                                onChange={e => set("sessions_per_period", Number(e.target.value))} className="mt-1" />
                        </label>
                        <label className="block text-sm">
                            Total Sessions
                            <Input type="number" min={1} value={form.total_sessions}
                                onChange={e => set("total_sessions", Number(e.target.value))} className="mt-1" />
                        </label>
                    </div>

                    {form.frequency_type === "weekly" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Days of Week</label>
                            <div className="flex gap-2 flex-wrap">
                                {DAYS.map(d => (
                                    <button key={d.v} type="button" onClick={() => toggleDay(d.v)}
                                        className={`w-12 h-10 rounded-lg text-sm font-semibold border transition-all ${form.preferred_days.includes(d.v)
                                            ? "bg-[#506EE4] text-white border-[#506EE4] shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-[#506EE4] hover:text-[#506EE4]"}`}>
                                        {d.l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary preview */}
                    <div className="bg-[#F0F4FF] border border-[#506EE4]/20 rounded-xl p-4 text-sm space-y-1">
                        <p className="font-semibold text-[#0E1680] mb-1">📋 Plan Summary</p>
                        <p className="text-gray-600"><span className="font-medium">{form.total_sessions}</span> total sessions</p>
                        <p className="text-gray-600">
                            <span className="font-medium capitalize">{form.frequency_type}</span> · {form.sessions_per_period} session{form.sessions_per_period > 1 ? "s" : ""} per {form.frequency_type === "daily" ? "day" : form.frequency_type === "weekly" ? "week" : "month"}
                        </p>
                        {form.frequency_type === "weekly" && form.preferred_days.length > 0 && (
                            <p className="text-gray-600">Days: <span className="font-medium">{form.preferred_days.map(d => DAYS.find(x => x.v === d)?.l).join(", ")}</span></p>
                        )}
                        {weeks && <p className="text-gray-600">Estimated duration: <span className="font-medium">~{weeks} weeks</span></p>}
                        {months && <p className="text-gray-600">Estimated duration: <span className="font-medium">~{months} months</span></p>}
                        <p className="text-gray-600">Starting: <span className="font-medium">{form.start_date}</span> at <span className="font-medium">{form.preferred_time}</span></p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate("/session-plans")}>Cancel</Button>
                    <Button type="submit" className="bg-[#0E1680] text-white px-6" disabled={saving}>
                        {saving ? <><Loader2 size={14} className="animate-spin mr-2" />Creating...</> : "Create Plan & Schedule Sessions"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
