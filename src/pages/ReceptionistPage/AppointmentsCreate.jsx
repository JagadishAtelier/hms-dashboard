// src/pages/appointments/AppointmentsCreate.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import appointmentsService from "../../service/appointmentsService.js";
import patientService from "../../service/patientService.js";
import { toast } from "sonner";

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

export default function AppointmentsCreate() {
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
    if (p) {
      // attempt to select patient locally if present later
      setPatientQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAvailableSlots();
    // fetch a small patient list for quick picks (no query = latest)
    fetchPatients("");
  }, []);

  // click outside to close patient list
  useEffect(() => {
    function handleClickOutside(e) {
      if (patientBoxRef.current && !patientBoxRef.current.contains(e.target)) {
        setShowPatientList(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Debounced search when patientQuery changes
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchPatients(patientQuery.trim());
    }, 300);
    return () => clearTimeout(searchDebounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientQuery]);

  /** Fetch patients (async search) */
  const fetchPatients = async (query = "") => {
    setLoadingPatients(true);
    try {
      // backend supports params: search, limit, page
      const params = {};
      if (query) params.search = query;
      params.limit = 50;

      const res = await patientService.getAllPatients(params);

      // handle nested response: res.data.data.data
      const patientsArray =
        res?.data?.data?.data || res?.data?.data || res?.data || [];

      if (Array.isArray(patientsArray)) {
        setPatients(patientsArray);

        // if form.patient_id already set (via query param), ensure selectedPatient is set
        if (form.patient_id) {
          const found = patientsArray.find((p) => p.id === form.patient_id);
          if (found) {
            setSelectedPatient(found);
          }
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

  /** Fetch available slots for doctors */
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
      toast.error(err?.response?.data?.message || "Failed to fetch available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  // When doctor changes, pick first date/slot
  useEffect(() => {
    if (!selectedDoctorId) {
      setSelectedDate("");
      setSelectedSlot("");
      return;
    }
    const doc = doctors.find((d) => d.doctor_id === selectedDoctorId);
    if (!doc) return;
    const firstDateObj = doc.dates.find((d) => (d.available_slots || []).length > 0);
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
      setForm((prev) => ({ ...prev, doctor_id: selectedDoctorId, scheduled_at: "", scheduled_time: "" }));
    }
  }, [selectedDoctorId, doctors]);

  // When date changes -> update slot
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;
    const doc = doctors.find((d) => d.doctor_id === selectedDoctorId);
    const dateObj = doc?.dates?.find((dd) => dd.date === selectedDate);
    const slot = dateObj?.available_slots?.[0] ?? "";
    setSelectedSlot(slot);
    setForm((prev) => ({ ...prev, scheduled_at: selectedDate, scheduled_time: slot || "" }));
  }, [selectedDate]);

  // When slot changes -> update form
  useEffect(() => {
    if (selectedSlot) setForm((prev) => ({ ...prev, scheduled_time: selectedSlot }));
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
    // keep focus on input for quick re-search
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
      const createdId = res?.data?.id || res?.id;
      if (createdId) navigate(`/appointment`);
      else navigate("/appointment");
    } catch (err) {
      console.error("Create appointment error:", err);
      toast.error(err?.response?.data?.message || "Failed to create appointment");
      if (err?.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setLoading(false);
    }
  };

  // Derived lists
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
    <div className="p-6 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-4">Add Appointment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">        
        {/* Patient search + select */}
        <div ref={patientBoxRef} className="relative">
          <label className="text-sm font-medium">Patient <span className="text-red-500">*</span></label>

          {/* Selected patient pill */}
          {selectedPatient ? (
            <div className="flex items-center justify-between gap-2 border rounded p-2 mt-1">
              <div>
                <div className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name || ''}</div>
                <div className="text-xs text-gray-600">{selectedPatient.patient_code || ''} — {selectedPatient.phone || ''}</div>
              </div>
              <button
                type="button"
                onClick={clearSelectedPatient}
                className="text-xs px-2 py-1 border rounded"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <Input
                name="patient_search"
                ref={patientInputRef}
                value={patientQuery}
                onChange={handlePatientQueryChange}
                onFocus={() => setShowPatientList(true)}
                placeholder={loadingPatients ? 'Loading patients...' : 'Search patient by name / phone / code'}
                className="mt-1"
              />

              {/* dropdown list */}
              {showPatientList && (
                <div className="absolute z-40 left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
                  {loadingPatients && (
                    <div className="p-3 text-sm text-gray-600">Loading...</div>
                  )}

                  {!loadingPatients && patients.length === 0 && (
                    <div className="p-3 text-sm text-gray-600">No patients found</div>
                  )}

                  {!loadingPatients && patients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPatient(p)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    >
                      <div className="font-medium">{p.first_name} {p.last_name || ''}</div>
                      <div className="text-xs text-gray-600">{p.patient_code ? `${p.patient_code} — ` : ''}{p.phone || p.email}</div>
                    </button>
                  ))}
                </div>
              )}

              {errors.patient_id && (
                <div className="text-xs text-red-500 mt-1">{errors.patient_id}</div>
              )}
            </>
          )}
        </div>

        {/* Doctor */}
        <div>
          <label className="text-sm font-medium">Doctor <span className="text-red-500">*</span></label>
          <select
            value={selectedDoctorId}
            onChange={(e) => {
              const did = e.target.value;
              setSelectedDoctorId(did);
              setForm((prev) => ({ ...prev, doctor_id: did }));
            }}
            className="w-full h-10 border rounded px-2 mt-1"
          >
            <option value="">{loadingSlots ? "Loading doctors..." : "Select doctor"}</option>
            {doctorOptions.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>
                {d.doctor_name} {d.department_name ? `— ${d.department_name}` : ""}
              </option>
            ))}
          </select>
          {errors.doctor_id && <div className="text-xs text-red-500 mt-1">{errors.doctor_id}</div>}
        </div>

        {/* Date + Slot */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Available Date <span className="text-red-500">*</span></label>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full h-10 border rounded px-2 mt-1">
              <option value="">Select date</option>
              {dateOptions.map((d) => (
                <option key={d.date} value={d.date}>{d.date} ({(d.available_slots || []).length} slots)</option>
              ))}
            </select>
            {errors.scheduled_at && <div className="text-xs text-red-500 mt-1">{errors.scheduled_at}</div>}
          </div>

          <div>
            <label className="text-sm font-medium">Available Slot <span className="text-red-500">*</span></label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full h-10 border rounded px-2 mt-1"
              disabled={!selectedDate || slotOptions.length === 0}
            >
              <option value="">{selectedDate ? "Select slot" : "Choose date first"}</option>
              {slotOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.scheduled_time && <div className="text-xs text-red-500 mt-1">{errors.scheduled_time}</div>}
          </div>
        </div>

        {/* Visit Type */}
        <div>
          <label className="text-sm font-medium">Visit Type <span className="text-red-500">*</span></label>
          <select name="visit_type" value={form.visit_type} onChange={handleChange} className="w-full h-10 border rounded px-2 mt-1">
            {visitTypes.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="text-sm font-medium">Reason (optional)</label>
          <Input name="reason" value={form.reason} onChange={handleChange} placeholder="Reason for appointment (max 255 chars)" className="mt-1" />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium">Notes (optional)</label>
          <Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes" className="mt-1" />
        </div>

        {/* Source */}
        <div>
          <label className="text-sm font-medium">Source</label>
          <select name="source" value={form.source} onChange={handleChange} className="w-full h-10 border rounded px-2 mt-1">
            {sources.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/appointments")} className="h-10" disabled={loading}>Cancel</Button>
          <Button type="submit" className="bg-[#0E1680] text-white h-10" disabled={loading || loadingSlots}>{loading ? "Saving..." : "Create Appointment"}</Button>
        </div>
      </form>
    </div>
  );
}
