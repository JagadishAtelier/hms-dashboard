import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    Stethoscope,
    HeartPulse,
    ClipboardList,
    FileText,
} from "lucide-react";

import encounterService from "../../service/encounterService.js";
import vitalsService from "../../service/vitalsService.js";
import diagnosisService from "../../service/diagnosisService.js";
import clinicalNoteService from "../../service/clinicalnoteService.js";

function DoctorNotes() {
    const { appointment_id } = useParams();
    const navigate = useNavigate();

    // 🩺 Encounter state
    const [encounter, setEncounter] = useState({
        appointment_id: "",
        encounter_date: new Date().toISOString().split("T")[0],
        chief_complaint: "",
        history: "",
        examination: "",
        plan: "",
        notes: "",
    });
    const [encounterId, setEncounterId] = useState(null);

    // ❤️ Vitals state
    const [vitals, setVitals] = useState({
        appointment_id: "",
        encounter_id: null,
        height: "",
        weight: "",
        temperature: "",
        pulse: "",
        blood_pressure: "",
        respiratory_rate: "",
        spo2: "",
        vitals_notes: "",
    });
    const [vitalsId, setVitalsId] = useState(null);

    // 🧠 Diagnosis state
    const [diagnosis, setDiagnosis] = useState({
        appointment_id: "",
        encounter_id: null,
        icd_code: "",
        description: "",
        primary: false,
    });
    const [diagnosisId, setDiagnosisId] = useState(null);

    // 📋 Clinical Note state
    const [clinical, setClinical] = useState({
        encounter_id: null,
        note_type: "doctor",
        note: "",
    });
    const [clinicalId, setClinicalId] = useState(null);

    // 💡 Tabs
    const [activeTab, setActiveTab] = useState("encounter");

    // ✅ Initialize states and fetch encounter
    useEffect(() => {
        if (appointment_id) {
            setEncounter((p) => ({ ...p, appointment_id }));
            setVitals((p) => ({ ...p, appointment_id }));
            setDiagnosis((p) => ({ ...p, appointment_id }));
            fetchEncounter(appointment_id);
        }
    }, [appointment_id]);

    // 🔍 Fetch encounter
    const fetchEncounter = async (id) => {
        try {
            const res = await encounterService.getEncounterById(id);
            const data = res?.data || res;

            if (data) {
                setEncounter({
                    appointment_id: data.appointment_id,
                    encounter_date: data.encounter_date?.split("T")[0] || "",
                    chief_complaint: data.chief_complaint || "",
                    history: data.history || "",
                    examination: data.examination || "",
                    plan: data.plan || "",
                    notes: data.notes || "",
                });

                setEncounterId(data.id);
                setVitals((prev) => ({ ...prev, encounter_id: data.id }));
                setDiagnosis((prev) => ({ ...prev, encounter_id: data.id }));
                setClinical((prev) => ({ ...prev, encounter_id: data.id }));

                fetchVitals(data.id);
                fetchDiagnosis(data.id);
                fetchClinical(data.id);
            }
        } catch (err) {
            console.log("No encounter found for this appointment");
        }
    };

    // 🔍 Fetch Vitals
    const fetchVitals = async (id) => {
        try {
            const res = await vitalsService.getVitalsByAdmissionId(id);
            const dataArray = res?.data || res;
            const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;

            if (data) {
                setVitals({
                    appointment_id: data.appointment_id || "",
                    encounter_id: data.encounter_id || "",
                    height: data.height ?? "",
                    weight: data.weight ?? "",
                    temperature: data.temperature ?? "",
                    pulse: data.pulse ?? "",
                    blood_pressure: data.blood_pressure ?? "",
                    respiratory_rate: data.respiratory_rate ?? "",
                    spo2: data.spo2 ?? "",
                    vitals_notes: data.notes || "",
                });
                setVitalsId(data.id);
            }
        } catch (err) {
            console.log("No vitals found:", err);
        }
    };

    // 🔍 Fetch Diagnosis
    const fetchDiagnosis = async (encounterId) => {
        try {
            const res = await diagnosisService.getDiagnosesByEncounterId(encounterId);
            const dataArray = res?.data || res;
            const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;

            if (data) {
                setDiagnosis({
                    appointment_id: data.appointment_id || "",
                    encounter_id: data.encounter_id || "",
                    icd_code: data.icd_code || "",
                    description: data.description || "",
                    primary: data.primary || false,
                });
                setDiagnosisId(data.id);
            }
        } catch (err) {
            console.log("No diagnosis found:", err);
        }
    };

    // 🔍 Fetch Clinical Note
    const fetchClinical = async (encounterId) => {
        try {
            const res = await clinicalNoteService.getClinicalNotesByEncounterId(encounterId);
            const dataArray = res?.data || res;
            const doctorNote = Array.isArray(dataArray)
                ? dataArray.find((n) => n.note_type === "doctor")
                : dataArray;

            if (doctorNote) {
                setClinical({
                    encounter_id: doctorNote.encounter_id,
                    note_type: doctorNote.note_type,
                    note: doctorNote.note,
                });
                setClinicalId(doctorNote.id);
            }
        } catch (err) {
            console.log("No clinical note found:", err);
        }
    };

    // 🧩 Input handler
    const handleChange = (e, setter) => {
        const { name, value, type, checked } = e.target;
        setter((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ✅ Save Encounter
    const handleSaveEncounter = async () => {
        try {
            const payload = {
                ...encounter,
                encounter_date: encounter.encounter_date
                    ? encounter.encounter_date.split("T")[0]
                    : new Date().toISOString().split("T")[0],
            };

            if (encounterId) {
                await encounterService.updateEncounter(encounterId, payload);
                toast.success("Encounter updated successfully!");
            } else {
                const res = await encounterService.createEncounter(payload);
                const newId = res?.data?.id;
                setEncounterId(newId);
                setVitals((p) => ({ ...p, encounter_id: newId }));
                setDiagnosis((p) => ({ ...p, encounter_id: newId }));
                setClinical((p) => ({ ...p, encounter_id: newId }));
                toast.success("Encounter saved successfully!");
            }
            setActiveTab("vitals");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save encounter");
        }
    };

    // ✅ Save Vitals
    const handleSaveVitals = async () => {
        try {
            if (!vitals.encounter_id) {
                toast.error("Please save the encounter before adding vitals");
                return;
            }

            const payload = {
                ...vitals,
                height: Number(vitals.height) || null,
                weight: Number(vitals.weight) || null,
                temperature: Number(vitals.temperature) || null,
                pulse: Number(vitals.pulse) || null,
                respiratory_rate: Number(vitals.respiratory_rate) || null,
                spo2: Number(vitals.spo2) || null,
            };

            if (vitalsId) {
                await vitalsService.updateVitals(vitalsId, payload);
                toast.success("Vitals updated successfully!");
            } else {
                const res = await vitalsService.createVitals(payload);
                setVitalsId(res?.data?.id);
                toast.success("Vitals saved successfully!");
            }
            setActiveTab("diagnosis");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save vitals");
        }
    };

    // ✅ Save Diagnosis
    const handleSaveDiagnosis = async () => {
        try {
            if (!encounterId) {
                toast.error("Please save the encounter first");
                return;
            }

            const payload = { ...diagnosis, encounter_id: encounterId };

            if (diagnosisId) {
                await diagnosisService.updateDiagnosis(diagnosisId, payload);
                toast.success("Diagnosis updated successfully!");
            } else {
                const res = await diagnosisService.createDiagnosis(payload);
                setDiagnosisId(res?.data?.id);
                toast.success("Diagnosis saved successfully!");
            }

            setActiveTab("clinical");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save diagnosis");
        }
    };

    // ✅ Save Clinical Note
    const handleSaveClinicalNote = async () => {
        try {
            if (!encounterId) {
                toast.error("Please save encounter first");
                return;
            }

            const payload = {
                encounter_id: encounterId,
                note_type: "doctor",
                note: clinical.note,
            };

            if (clinicalId) {
                await clinicalNoteService.updateClinicalNote(clinicalId, payload);
                toast.success("Clinical note updated successfully!");
            } else {
                const res = await clinicalNoteService.createClinicalNote(payload);
                setClinicalId(res?.data?.id);
                toast.success("Clinical note saved successfully!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save clinical note");
        }
    };

    // const handleGenerateReport = () => {
    //     toast.info("Generate Report clicked");
    // };

    const handleViewTest = () => {
        // prefer the saved encounter DB id; fall back to the appointment route param
        const targetId = encounterId || appointment_id;
        if (!targetId) {
            toast.error("No encounter id available — please save the encounter first.");
            return;
        }
        // navigate to testresults route and include appointment_id as a query param
        // so TestResults can access both encounter_id (in path) and appointment_id (from query)
        const query = appointment_id ? `?appointment_id=${encodeURIComponent(appointment_id)}` : "";
        navigate(`/testresults/${targetId}${query}`);
    };

    const handleLabTestOrder = () => {
        // prefer the saved encounter DB id; fall back to the appointment route param
        const targetId = encounterId || appointment_id;
        if (!targetId) {
            toast.error("No encounter id available — please save the encounter first.");
            return;
        }
        // navigate to labtestorder route and include appointment_id as a query param
        // so LabTestOrder can access both encounter_id (in path) and appointment_id (from query)
        const query = appointment_id ? `?appointment_id=${encodeURIComponent(appointment_id)}` : "";
        navigate(`/labtestorder/${targetId}${query}`);
    };

    return (
        <div className="p-6 w-full flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#0E1680]">
                    Doctor’s Consultation Notes
                </h2>
                <div className="flex gap-3">
                    {/* <Button
                        onClick={handleGenerateReport}
                        className="bg-gradient-to-r from-[#0E1680] to-[#2433D3] text-white shadow-md"
                    >
                        Generate Report
                    </Button> */}
                    <Button
                        onClick={handleLabTestOrder}
                        className="bg-gradient-to-r from-[#0E1680] to-[#2433D3] text-white shadow-md"
                    >
                        Lab Test Order
                    </Button>
                    <Button
                        onClick={handleViewTest}
                        className="bg-gradient-to-r from-[#0E1680] to-[#2433D3] text-white shadow-md"
                    >
                        View Test
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex bg-[#EEF0FF] rounded-2xl p-1 w-fit shadow-inner">
                    {[
                        { value: "encounter", label: "Encounter", icon: <Stethoscope size={18} /> },
                        { value: "vitals", label: "Vitals", icon: <HeartPulse size={18} /> },
                        { value: "diagnosis", label: "Diagnosis", icon: <ClipboardList size={18} /> },
                        { value: "clinical", label: "Clinical Note", icon: <FileText size={18} /> },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className={`flex items-center gap-2 px-6 py-2 mx-1 rounded-lg text-sm font-semibold transition-all duration-300
                ${activeTab === tab.value
                                    ? "bg-gradient-to-r from-[#0E1680] to-[#2433D3] text-white shadow-md scale-105"
                                    : "text-[#0E1680]/70 hover:bg-[#DDE0FF] hover:text-[#0E1680]"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* 🩺 Encounter */}
                <TabsContent value="encounter">
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <h3 className="text-lg font-semibold text-[#0E1680]">
                                Encounter Details
                            </h3>
                            {[
                                ["chief_complaint", "Chief Complaint"],
                                ["history", "Medical History"],
                                ["examination", "Examination"],
                                ["plan", "Treatment Plan"],
                            ].map(([name, label]) => (
                                <div key={name}>
                                    <label className="text-sm font-medium">{label}</label>
                                    <Textarea
                                        name={name}
                                        value={encounter[name]}
                                        onChange={(e) => handleChange(e, setEncounter)}
                                        placeholder={`Enter ${label.toLowerCase()}`}
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <Button
                                    className="bg-[#0E1680] text-white px-8"
                                    onClick={handleSaveEncounter}
                                >
                                    {encounterId ? "Update Encounter" : "Save Encounter"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ❤️ Vitals */}
                <TabsContent value="vitals">
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <h3 className="text-lg font-semibold text-[#0E1680]">
                                Patient Vitals
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    ["height", "Height (cm)"],
                                    ["weight", "Weight (kg)"],
                                    ["temperature", "Temperature (°C)"],
                                    ["pulse", "Pulse (bpm)"],
                                    ["blood_pressure", "Blood Pressure (mmHg)"],
                                    ["respiratory_rate", "Respiratory Rate (/min)"],
                                    ["spo2", "SpO₂ (%)"],
                                ].map(([name, label]) => (
                                    <div key={name}>
                                        <label className="text-sm font-medium">{label}</label>
                                        <Input
                                            name={name}
                                            value={vitals[name]}
                                            onChange={(e) => handleChange(e, setVitals)}
                                            placeholder={label}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    className="bg-[#0E1680] text-white px-8"
                                    onClick={handleSaveVitals}
                                >
                                    {vitalsId ? "Update Vitals" : "Save Vitals"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 🧠 Diagnosis */}
                <TabsContent value="diagnosis">
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <h3 className="text-lg font-semibold text-[#0E1680]">
                                Diagnosis Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">ICD Code</label>
                                    <Input
                                        name="icd_code"
                                        value={diagnosis.icd_code}
                                        onChange={(e) => handleChange(e, setDiagnosis)}
                                        placeholder="Enter ICD code"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input
                                        type="checkbox"
                                        name="primary"
                                        checked={diagnosis.primary}
                                        onChange={(e) => handleChange(e, setDiagnosis)}
                                        className="w-4 h-4 accent-[#0E1680]"
                                    />
                                    <label className="text-sm font-medium">
                                        Primary Diagnosis
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    name="description"
                                    value={diagnosis.description}
                                    onChange={(e) => handleChange(e, setDiagnosis)}
                                    placeholder="Enter diagnosis description"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    className="bg-[#0E1680] text-white px-8"
                                    onClick={handleSaveDiagnosis}
                                >
                                    {diagnosisId ? "Update Diagnosis" : "Save Diagnosis"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 🩸 Clinical Note */}
                <TabsContent value="clinical">
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <h3 className="text-lg font-semibold text-[#0E1680]">
                                Doctor’s Clinical Note
                            </h3>
                            <div>
                                <label className="text-sm font-medium">Clinical Note</label>
                                <Textarea
                                    name="note"
                                    value={clinical.note}
                                    onChange={(e) => handleChange(e, setClinical)}
                                    placeholder="Enter clinical note"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    className="bg-[#0E1680] text-white px-8"
                                    onClick={handleSaveClinicalNote}
                                >
                                    {clinicalId ? "Update Note" : "Save Note"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default DoctorNotes;
