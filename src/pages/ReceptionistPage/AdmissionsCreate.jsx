import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming you have ScrollArea
import { Separator } from "@/components/ui/separator"; // Assuming you have Separator
import {
  Loader2,
  BedSingle,
  CheckCircle2,
  Search,
  User,
  XCircle,
  Stethoscope,
  ChevronDown,
  ChevronLeft,
  Building,
} from "lucide-react";

// Assuming these service imports are correct
import patientService from "../../service/patientService.js";
import bedsService from "../../service/bedsService.js";
import admissionsService from "../../service/addmissionsService.js";

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

  // ---------------- Functional Logic (Unchanged) ----------------
  const fetchPatients = async (query = "") => {
    // ... (unchanged logic)
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

  const fetchBeds = async () => {
    // ... (unchanged logic)
    setLoadingBeds(true);
    try {
      const res = await bedsService.getAllBeds({ status: "available" });
      const arr = res?.data?.data?.data || res?.data?.data || res?.data || [];
      const filteredBeds = arr.filter((b) => !b.is_occupied);
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
    setPatientQuery(""); // Reset query when clearing
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

  // ---------------- Render (Refactored) ----------------
  return (
    <div className="p-2 sm:p-2 max-w-5xl mx-auto bg-white rounded-lg shadow-sm">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center p-1">
        <div className="flex items-start mb-4 gap-3">
          <div
            className="bg-white cursor-pointer hover:bg-gray-100 hover:border-gray-300 rounded-full p-1 shadow-sm border border-gray-100"
            title="Go Back"
          >
            <ChevronLeft
              size={22}
              className="cursor-pointer"
              onClick={() => navigate(-1)}
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#0E1680]">
              New Patient Admission
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details to assign a patient to an available bed.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* CARD WRAPPER */}
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl text-[#0E1680]">
              Admission Details
            </CardTitle>
            <CardDescription>
              Select the patient, assign a bed, and note the reason.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. PATIENT SELECTION */}
            <div ref={patientBoxRef} className="relative">
              <Label
                htmlFor="patient-search"
                className="mb-2 flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Patient <span className="text-red-500 ml-1">*</span>
              </Label>

              {selectedPatient ? (
                // Selected Patient Display
                <div
                  className={`flex justify-between items-center p-3 rounded-lg border-2 ${
                    errors.patient_id
                      ? "border-red-400"
                      : "border-blue-400 bg-blue-50/50"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="font-semibold text-gray-800">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Code: {selectedPatient.patient_code} | Phone:{" "}
                      {selectedPatient.phone}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedPatient}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Change
                  </Button>
                </div>
              ) : (
                // Patient Search Input and List
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="patient-search"
                      placeholder={
                        loadingPatients
                          ? "Loading patients..."
                          : "Search patient by name, phone, or code..."
                      }
                      value={patientQuery}
                      onChange={(e) => {
                        setPatientQuery(e.target.value);
                        setShowPatientList(true);
                      }}
                      onFocus={() => setShowPatientList(true)}
                      className={`pl-10 ${
                        errors.patient_id
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      autoComplete="off"
                    />
                    {loadingPatients && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                    )}
                  </div>

                  {showPatientList && (
                    <ScrollArea className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto">
                      {patients.length > 0 ? (
                        patients.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => selectPatient(p)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="font-medium text-gray-800">
                              {p.first_name} {p.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.patient_code} | {p.phone}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No patients found. Try a different search.
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </>
              )}

              {errors.patient_id && (
                <p className="text-sm text-red-500 mt-2 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" /> {errors.patient_id}
                </p>
              )}
            </div>

            <Separator />

            {/* 2. BED SELECTION */}
            <div>
              <Label className="mb-2 flex items-center">
                <BedSingle className="h-4 w-4 mr-2" />
                Bed Selection <span className="text-red-500 ml-1">*</span>
              </Label>

              {loadingBeds ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <Loader2 className="animate-spin h-6 w-6 mb-2" />
                  <p>Loading available beds...</p>
                </div>
              ) : (
                <ScrollArea className="h-64 pr-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {beds.length === 0 ? (
                      <p className="text-gray-500 text-sm col-span-full p-4 border rounded-lg text-center bg-gray-50">
                        No beds currently available for admission.
                      </p>
                    ) : (
                      beds.map((bed) => (
                        <button
                          type="button"
                          key={bed.id}
                          onClick={() => selectBed(bed)}
                          className={`flex cursor-pointer flex-col items-start  text-left w-full h-full border rounded-xl p-4 shadow-sm transition-all duration-200 ease-in-out
                            ${
                              selectedBed?.id === bed.id
                                ? "border-blue-600 border-2 bg-blue-50 shadow-lg"
                                : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md"
                            }`}
                        >
                          <div className="flex justify-between items-start w-full mb-1">
                            <span className="font-bold text-lg text-gray-800">
                              Bed {bed.bed_no}
                            </span>
                            {selectedBed?.id === bed.id && (
                              <CheckCircle2
                                className="text-blue-600 h-6 w-6 shrink-0"
                                fill="white"
                              />
                            )}
                          </div>

                          <div className="text-xs text-gray-600 leading-tight mb-1">
                            <Building
                              size={14}
                              className="inline-block text-blue-500"
                            />{" "}
                            <span className="font-medium">{bed.ward_name}</span>{" "}
                            Ward
                          </div>
                          <div className="text-xs text-gray-500 leading-tight">
                            <BedSingle
                              size={14}
                              className="inline-block text-blue-500"
                            />{" "}
                            Room {bed.room_name}
                          </div>

                          <div className="mt-3 flex items-center gap-1 text-green-700 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                            <BedSingle size={12} />
                            Available
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
              {errors.bed_id && (
                <p className="text-sm text-red-500 mt-2 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" /> {errors.bed_id}
                </p>
              )}
            </div>

            <Separator />

            {/* 3. REASON */}
            <div>
              <Label htmlFor="reason" className="mb-2 flex items-center">
                <Stethoscope className="h-4 w-4 mr-2" />
                Reason for Admission{" "}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="reason"
                name="reason"
                rows={4}
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Briefly describe the primary reason for the patient's admission (e.g., 'Severe abdominal pain', 'Post-operative observation')."
                className={`mt-1 ${
                  errors.reason
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {errors.reason && (
                <p className="text-sm text-red-500 mt-2 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" /> {errors.reason}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FORM SUBMISSION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admissions")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#0E1680] hover:bg-blue-700 mb-2 text-white font-semibold transition-colors"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {loading ? "Admitting..." : "Admit Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
