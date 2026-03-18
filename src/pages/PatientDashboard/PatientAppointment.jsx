// src/pages/appointments/AppointmentsCreate.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import appointmentsService from "../../service/appointmentsService.js";
import patientService from "../../service/patientService.js";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";

/**
 * AppointmentsCreate.jsx
 * - Doctor/date/slot selection from appointmentsService.getAvailableSlots()
 * - Searchable patient dropdown (async search + keyboard + click-to-select)
 */

const visitTypes = [
    { value: "OPD", label: "OPD" },
    { value: "teleconsult", label: "Teleconsult" },
    { value: "emergency", label: "Emergency" },
];

const sources = [
    { value: "Online", label: "Online" },
    { value: "phone", label: "Phone" },
    { value: "Offline", label: "Offline" },
];

export default function PatientAppointment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState({
        patient_id: "",
        doctor_id: "",
        scheduled_at: "",
        scheduled_time: "",
        visit_type: "OPD",
        reason: "",
        notes: "",
        source: "Online",
    });

    const [loading, setLoading] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [errors, setErrors] = useState({});

    // Dropdown / search data
    const [patients, setPatients] = useState([]);
    const [patientQuery, setPatientQuery] = useState("");
    const [showPatientList, setShowPatientList] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");

    const patientBoxRef = useRef(null);
    const patientInputRef = useRef(null);
    const searchDebounceRef = useRef(null);
    const [contact, setContact] = useState(null);
    const [patient, setPatient] = useState(null);
    // ✅ Get logged-in user contact
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            const user = JSON.parse(storedUser);
            console.log(user)
            setContact({
                email: user.email,
                phone: user.phone
            });
        }
    }, []);

    useEffect(() => {
        if (!contact) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const patientRes = await patientService.getByEmailOrPhone(contact);
                const patientData = patientRes?.data;

                setPatient(patientData);

                // ✅ Set patient_id in form
                setForm((prev) => ({
                    ...prev,
                    patient_id: patientData?.id || ""
                }));

            } catch (err) {
                console.error("Error fetching patient:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [contact]);
    // Prefill from query params
    useEffect(() => {
        const p = searchParams.get("patientId") || searchParams.get("patient_id");
        const d = searchParams.get("doctorId") || searchParams.get("doctor_id");
        setForm((prev) => ({
            ...prev,
            patient_id: p || prev.patient_id,
            doctor_id: d || prev.doctor_id,
        }));
        if (d) setSelectedDoctorId(d);
        if (p) setPatientQuery("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchAvailableSlots();
        fetchPatients("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Click outside to close patient list
    useEffect(() => {
        function handleClickOutside(e) {
            if (patientBoxRef.current && !patientBoxRef.current.contains(e.target)) {
                setShowPatientList(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            fetchPatients(patientQuery.trim());
        }, 300);
        return () => clearTimeout(searchDebounceRef.current);
    }, [patientQuery]);

    /** Fetch patients */
    const fetchPatients = async (query = "") => {
        setLoadingPatients(true);
        try {
            const params = {};
            if (query) params.search = query;
            params.limit = 50;

            const res = await patientService.getAllPatients(params);
            const patientsArray =
                res?.data?.data?.data || res?.data?.data || res?.data || [];

            if (Array.isArray(patientsArray)) {
                setPatients(patientsArray);
                if (form.patient_id) {
                    const found = patientsArray.find((p) => p.id === form.patient_id);
                    if (found) setSelectedPatient(found);
                }
            } else {
                setPatients([]);
            }
        } catch (err) {
            console.error("Failed to fetch patients", err);
            toast.error(err?.response?.data?.message || "Failed to fetch patients");
        } finally {
            setLoadingPatients(false);
        }
    };

    /** Fetch available slots */
    const fetchAvailableSlots = async () => {
        setLoadingSlots(true);
        try {
            const res = await appointmentsService.getAvailableSlots();
            const payload = res?.data ?? res;
            const arr = Array.isArray(payload) ? payload : payload?.data ?? [];
            const map = new Map();

            for (const item of arr) {
                const did = item.doctor_id;
                if (!map.has(did)) {
                    map.set(did, {
                        doctor_id: did,
                        doctor_name: item.doctor_name || "Unknown",
                        department_name: item.department_name || "",
                        dates: [],
                    });
                }
                map.get(did).dates.push({
                    date: item.date,
                    available_slots: Array.isArray(item.available_slots)
                        ? item.available_slots
                        : [],
                });
            }

            const doctorsArr = Array.from(map.values()).map((d) => {
                d.dates.sort((a, b) => (a.date > b.date ? 1 : -1));
                return d;
            });
            setDoctors(doctorsArr);

            if (!selectedDoctorId && doctorsArr.length > 0) {
                setSelectedDoctorId(doctorsArr[0].doctor_id);
            }
        } catch (err) {
            console.error("Failed to fetch available slots", err);
            toast.error(
                err?.response?.data?.message || "Failed to fetch available slots"
            );
        } finally {
            setLoadingSlots(false);
        }
    };

    // When doctor changes
    useEffect(() => {
        if (!selectedDoctorId) {
            setSelectedDate("");
            setSelectedSlot("");
            return;
        }
        const doc = doctors.find((d) => d.doctor_id === selectedDoctorId);
        if (!doc) return;
        const firstDateObj = doc.dates.find(
            (d) => (d.available_slots || []).length > 0
        );
        if (firstDateObj) {
            setSelectedDate(firstDateObj.date);
            setSelectedSlot(firstDateObj.available_slots[0] || "");
            setForm((prev) => ({
                ...prev,
                doctor_id: selectedDoctorId,
                scheduled_at: firstDateObj.date,
                scheduled_time: firstDateObj.available_slots[0] || prev.scheduled_time,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                doctor_id: selectedDoctorId,
                scheduled_at: "",
                scheduled_time: "",
            }));
        }
    }, [selectedDoctorId, doctors]);

    useEffect(() => {
        if (!selectedDoctorId || !selectedDate) return;
        const doc = doctors.find((d) => d.doctor_id === selectedDoctorId);
        const dateObj = doc?.dates?.find((dd) => dd.date === selectedDate);
        const slot = dateObj?.available_slots?.[0] ?? "";
        setSelectedSlot(slot);
        setForm((prev) => ({
            ...prev,
            scheduled_at: selectedDate,
            scheduled_time: slot || "",
        }));
    }, [selectedDate]);

    useEffect(() => {
        if (selectedSlot)
            setForm((prev) => ({ ...prev, scheduled_time: selectedSlot }));
    }, [selectedSlot]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handlePatientQueryChange = (e) => {
        setPatientQuery(e.target.value);
        setShowPatientList(true);
    };

    const selectPatient = (p) => {
        setSelectedPatient(p);
        setForm((prev) => ({ ...prev, patient_id: p.id }));
        setShowPatientList(false);
    };

    const clearSelectedPatient = () => {
        setSelectedPatient(null);
        setForm((prev) => ({ ...prev, patient_id: "" }));
        if (patientInputRef.current) patientInputRef.current.focus();
    };

    const validate = () => {
        const newErrors = {};
        if (!form.patient_id) newErrors.patient_id = "Patient is required";
        if (!form.doctor_id) newErrors.doctor_id = "Doctor is required";
        if (!form.scheduled_at) newErrors.scheduled_at = "Scheduled date required";
        if (!form.scheduled_time) newErrors.scheduled_time = "Slot required";
        if (!form.visit_type) newErrors.visit_type = "Visit type required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            doctor_id: selectedDoctorId || form.doctor_id,
            scheduled_time:
                form.scheduled_time && /^\d{2}:\d{2}$/.test(form.scheduled_time)
                    ? `${form.scheduled_time}:00`
                    : form.scheduled_time,
        };

        if (!validate()) {
            toast.error("Please fill the required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await appointmentsService.createAppointment(payload);
            toast.success("Appointment created successfully!");
            navigate("/patient-dashboard");
        } catch (err) {
            console.error("Create appointment error:", err);
            toast.error(
                err?.response?.data?.message || "Failed to create appointment"
            );
            if (err?.response?.data?.errors) setErrors(err.response.data.errors);
        } finally {
            setLoading(false);
        }
    };

    const doctorOptions = useMemo(() => doctors || [], [doctors]);
    const dateOptions = useMemo(() => {
        const doc = doctors.find((d) => d.doctor_id === selectedDoctorId);
        return doc ? doc.dates : [];
    }, [doctors, selectedDoctorId]);
    const slotOptions = useMemo(() => {
        const d = dateOptions.find((dd) => dd.date === selectedDate);
        return d?.available_slots ?? [];
    }, [dateOptions, selectedDate]);

    return (
        <div className="p-6 w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center mb-4 gap-3">
                <div className="bg-white rounded-full p-1 shadow-sm border border-gray-100" title="Go Back">
                    <ChevronLeft size={22} className="cursor-pointer" onClick={() => navigate(-1)} />
                </div>
                <h2 className="text-2xl text-right font-semibold text-[#0E1680]">
                    Create Appointment
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* ✅ Patient Search + Add New */}
                <div>
                    <label className="text-sm font-medium">
                        Patient <span className="text-red-500">*</span>
                    </label>

                    <Input
                        value={
                            loading
                                ? "Fetching patient..."
                                : patient
                                    ? `${patient.first_name || ""} ${patient.last_name || ""}`
                                    : "No patient found"
                        }
                        disabled
                        className="mt-1 bg-gray-100 cursor-not-allowed"
                    />

                    {errors.patient_id && (
                        <div className="text-xs text-red-500 mt-1">
                            {errors.patient_id}
                        </div>
                    )}
                </div>

                {/* Doctor */}
                <div>
                    <label className="text-sm font-medium">
                        Doctor <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={selectedDoctorId || "none"}
                        onValueChange={(value) => {
                            const did = value === "none" ? "" : value;
                            setSelectedDoctorId(did);
                            setForm((prev) => ({ ...prev, doctor_id: did }));
                        }}
                    >
                        <SelectTrigger className="w-full h-10 mt-1 border border-gray-200 rounded bg-white text-sm shadow-sm hover:bg-gray-50 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
                            <SelectValue
                                placeholder={
                                    loadingSlots ? "Loading doctors..." : "Select doctor"
                                }
                            />
                        </SelectTrigger>

                        <SelectContent className="rounded-md shadow-md border border-gray-100 bg-white text-sm max-h-60 overflow-auto">
                            <SelectItem value="none">
                                {loadingSlots ? "Loading doctors..." : "Select doctor"}
                            </SelectItem>

                            {doctorOptions.map((d) => (
                                <SelectItem key={d.doctor_id} value={d.doctor_id}>
                                    {d.doctor_name}{" "}
                                    {d.department_name ? `— ${d.department_name}` : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {errors.doctor_id && (
                        <div className="text-xs text-red-500 mt-1">{errors.doctor_id}</div>
                    )}
                </div>

                {/* Date + Slot */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">
                            Available Date <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={selectedDate || "none"}
                            onValueChange={(value) =>
                                setSelectedDate(value === "none" ? "" : value)
                            }
                        >
                            <SelectTrigger className="w-full h-10 mt-1 rounded text-sm bg-white">
                                <SelectValue placeholder="Select date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select date</SelectItem>
                                {dateOptions.map((d) => (
                                    <SelectItem key={d.date} value={d.date}>
                                        {d.date} ({(d.available_slots || []).length} slots)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.scheduled_at && (
                            <div className="text-xs text-red-500 mt-1">
                                {errors.scheduled_at}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Available Slot <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={selectedSlot || "none"}
                            onValueChange={(value) =>
                                setSelectedSlot(value === "none" ? "" : value)
                            }
                            disabled={!selectedDate || slotOptions.length === 0}
                        >
                            <SelectTrigger
                                className={`w-full h-10 mt-1 text-sm rounded bg-white ${!selectedDate || slotOptions.length === 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                    }`}
                            >
                                <SelectValue
                                    placeholder={
                                        selectedDate ? "Select slot" : "Choose date first"
                                    }
                                />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="none">
                                    {selectedDate ? "Select slot" : "Choose date first"}
                                </SelectItem>

                                {slotOptions.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.scheduled_time && (
                            <div className="text-xs text-red-500 mt-1">
                                {errors.scheduled_time}
                            </div>
                        )}
                    </div>
                </div>

                {/* Visit Type */}
                <div>
                    <label className="text-sm font-medium">
                        Visit Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={form.visit_type || "none"}
                        onValueChange={(value) =>
                            handleChange({ target: { name: "visit_type", value } })
                        }
                    >
                        <SelectTrigger className="w-full h-10 mt-1 border border-gray-200 rounded bg-white text-sm shadow-sm hover:bg-gray-50 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
                            <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>

                        <SelectContent>
                            {visitTypes.map((v) => (
                                <SelectItem key={v.value} value={v.value}>
                                    {v.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Reason */}
                <div>
                    <label className="text-sm font-medium">Reason (optional)</label>
                    <Input
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        placeholder="Reason for appointment (max 255 chars)"
                        className="mt-1 bg-white rounded"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="text-sm font-medium">Notes (optional)</label>
                    <Textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Any notes"
                        className="mt-1 bg-white rounded"
                    />
                </div>

                {/* Source */}
                <div>
                    <label className="text-sm font-medium">Source</label>
                    <Select
                        value={form.source || "none"}
                        onValueChange={(value) =>
                            handleChange({ target: { name: "source", value } })
                        }
                    >
                        <SelectTrigger className="w-full h-10 mt-1 border border-gray-200 rounded bg-white text-sm shadow-sm hover:bg-gray-50 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
                            <SelectValue placeholder="Select source" />
                        </SelectTrigger>

                        <SelectContent>
                            {sources.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/appointments")}
                        className="h-10 rounded"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-[#0E1680] hover:bg-[#1823c2] rounded text-white h-10"
                        disabled={loading || loadingSlots}
                    >
                        {loading ? "Saving..." : "Create Appointment"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
