import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import patientService from "../../service/patientService.js";
import bedsService from "../../service/bedsService.js";
import admissionsService from "../../service/addmissionsService.js";
import { Loader2, BedSingle, CheckCircle2 } from "lucide-react";

export default function AdmissionsCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    patient_id: "",
    bed_id: "",
    ward_id: "",
    room_id: "",
    reason: "",
    admission_date: new Date().toISOString(),
  });

  const [patients, setPatients] = useState([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const patientBoxRef = useRef(null);

  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);

  // ---------------- Fetch Patients ----------------
  const fetchPatients = async (query = "") => {
    setLoadingPatients(true);
    try {
      const params = { search: query, limit: 50 };
      const res = await patientService.getAllPatients(params);
      const arr = res?.data?.data?.data || res?.data?.data || res?.data || [];
      setPatients(Array.isArray(arr) ? arr : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch patients");
    } finally {
      setLoadingPatients(false);
    }
  };

  // ---------------- Fetch Beds ----------------
  const fetchBeds = async () => {
    setLoadingBeds(true);
    try {
      const res = await bedsService.getAllBeds({ status: "available" });
      const arr = res?.data?.data?.data || res?.data?.data || res?.data || [];

      // Only include non-occupied beds
      const filteredBeds = arr.filter((b) => !b.is_occupied);

      // Group by ward/room for better visual grouping
      const formatted = filteredBeds.map((b) => ({
        id: b.id,
        bed_no: b.bed_no,
        is_occupied: b.is_occupied,
        ward_name: b.room?.ward?.name || "Ward N/A",
        ward_id: b.room?.ward?.id || "",
        room_name: b.room?.room_no || "Room N/A",
        room_id: b.room?.id || "",
      }));

      setBeds(formatted);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch beds");
    } finally {
      setLoadingBeds(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchBeds();
  }, []);

  // ---------------- Patient Search ----------------
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPatients(patientQuery.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (patientBoxRef.current && !patientBoxRef.current.contains(e.target)) {
        setShowPatientList(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setForm((prev) => ({ ...prev, patient_id: p.id }));
    setShowPatientList(false);
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    setForm((prev) => ({ ...prev, patient_id: "" }));
  };

  const selectBed = (bed) => {
    setSelectedBed(bed);
    setForm((prev) => ({
      ...prev,
      bed_id: bed.id,
      ward_id: bed.ward_id,
      room_id: bed.room_id,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.patient_id) newErrors.patient_id = "Patient is required";
    if (!form.reason || form.reason.length < 3)
      newErrors.reason = "Reason must be at least 3 characters";
    if (!form.bed_id) newErrors.bed_id = "Please select a bed";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    const payload = {
      ...form,
      status: "admitted",
      admission_date: new Date().toISOString(),
    };

    setLoading(true);
    try {
      await admissionsService.createAdmission(payload);
      toast.success("Patient admitted successfully!");
      navigate("/admissions");
    } catch (err) {
      console.error("Create Admission Error:", err);
      toast.error(err?.response?.data?.message || "Failed to admit patient");
      if (err?.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-4">
        New Admission
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PATIENT SELECTION */}
        <div ref={patientBoxRef} className="relative">
          <label className="text-sm font-medium">
            Patient <span className="text-red-500">*</span>
          </label>

          {selectedPatient ? (
            <div className="flex justify-between items-center border p-2 rounded mt-1">
              <div>
                <div className="font-medium">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </div>
                <div className="text-xs text-gray-600">
                  {selectedPatient.patient_code} — {selectedPatient.phone}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={clearSelectedPatient}
                className="text-xs"
              >
                Change
              </Button>
            </div>
          ) : (
            <>
              <Input
                placeholder={
                  loadingPatients
                    ? "Loading patients..."
                    : "Search patient by name / phone / code"
                }
                value={patientQuery}
                onChange={(e) => {
                  setPatientQuery(e.target.value);
                  setShowPatientList(true);
                }}
                onFocus={() => setShowPatientList(true)}
                className="mt-1"
              />

              {showPatientList && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPatient(p)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    >
                      <div className="font-medium">
                        {p.first_name} {p.last_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {p.patient_code} — {p.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {errors.patient_id && (
            <p className="text-xs text-red-500 mt-1">{errors.patient_id}</p>
          )}
        </div>

        {/* ADVANCED BED SELECTION */}
        <div>
          <label className="text-sm font-medium">
            Bed Selection <span className="text-red-500">*</span>
          </label>

          {loadingBeds ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
              {beds.length === 0 ? (
                <p className="text-gray-500 text-sm">No beds available.</p>
              ) : (
                beds.map((bed) => (
                  <div
                    key={bed.id}
                    onClick={() => selectBed(bed)}
                    className={`cursor-pointer border rounded-lg p-3 shadow-sm hover:shadow-md transition-all
                      ${
                        selectedBed?.id === bed.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">
                        Bed {bed.bed_no}
                      </span>
                      {selectedBed?.id === bed.id && (
                        <CheckCircle2
                          className="text-blue-600"
                          size={18}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      Ward: <span className="font-semibold">{bed.ward_name}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Room: <span className="font-semibold">{bed.room_name}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-green-700 text-xs">
                      <BedSingle size={14} />
                      Available
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {errors.bed_id && (
            <p className="text-xs text-red-500 mt-1">{errors.bed_id}</p>
          )}
        </div>

        {/* REASON */}
        <div>
          <label className="text-sm font-medium">
            Reason for Admission <span className="text-red-500">*</span>
          </label>
          <Textarea
            name="reason"
            value={form.reason}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, reason: e.target.value }))
            }
            placeholder="Enter reason (min 3 characters)"
            className="mt-1"
          />
          {errors.reason && (
            <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admissions")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#0E1680] text-white"
            disabled={loading}
          >
            {loading ? "Saving..." : "Admit Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
