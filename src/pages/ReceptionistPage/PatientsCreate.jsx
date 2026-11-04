import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User2,
  Droplet,
  Heart,
  Calendar,
  Lock,
  UserCircle2,
  Loader2,
  AlertTriangle,
  Siren,
  Baby,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";
import patientService from "../../service/patientService";
import dayjs from "dayjs";

export default function PatientsCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [loading, setLoading] = useState(false);
  const [loadingCreateAndUse, setLoadingCreateAndUse] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    patient_code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    age: "",
    address: "",
    blood_group: "",
    marital_status: "",
    notes: "",
    password: "",
    is_emergency_alias: false,
    parent_patient_id: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [motherSearch, setMotherSearch] = useState("");
  const [motherResults, setMotherResults] = useState([]);

  // Fetch patient data if edit mode
  useEffect(() => {
    if (!isEdit) return;

    const fetchPatient = async () => {
      setFetching(true);
      try {
        const res = await patientService.getPatientById(id);
        const patient = res?.data || res;

        setForm({
          patient_code: patient.patient_code || "",
          first_name: patient.first_name || "",
          last_name: patient.last_name || "",
          email: patient.email || "",
          phone: patient.phone || "",
          gender: patient.gender || "",
          dob: patient.dob ? dayjs(patient.dob).format("YYYY-MM-DD") : "",
          age: patient.age !== undefined && patient.age !== null ? String(patient.age) : "",
          address: patient.address || "",
          blood_group: patient.blood_group || "",
          marital_status: patient.marital_status || "",
          notes: patient.notes || "",
          password: "",
          is_emergency_alias: Boolean(patient.is_emergency_alias),
          parent_patient_id: patient.parent_patient_id || "",
        });
      } catch (err) {
        console.error("Error fetching patient:", err);
        toast.error("Failed to fetch patient details");
        navigate("/patient-list");
      } finally {
        setFetching(false);
      }
    };

    fetchPatient();
  }, [id, isEdit, navigate]);

  // Duplicate patient detection when phone or names are typed
  useEffect(() => {
    if (isEdit) return;
    const query = form.phone?.trim() || (form.first_name?.trim() && form.last_name?.trim() ? `${form.first_name} ${form.last_name}` : "");
    if (!query || query.length < 3) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await patientService.getAllPatients({ search: query, limit: 3 });
        const list = res?.data?.data || res?.data || [];
        const matches = Array.isArray(list) ? list.filter((p) => p.id !== id) : [];
        setDuplicates(matches);
      } catch (e) {
        // quiet ignore
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.phone, form.first_name, form.last_name, isEdit, id]);

  // Bi-directional Date of Birth & Age calculations
  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    let computedAge = form.age;
    if (dobVal) {
      computedAge = String(dayjs().diff(dayjs(dobVal), "year"));
    }
    setForm((p) => ({ ...p, dob: dobVal, age: computedAge }));
    setFieldErrors((p) => ({ ...p, dob: undefined, age: undefined }));
  };

  const handleAgeChange = (e) => {
    const ageVal = e.target.value;
    let approxDob = form.dob;
    if (ageVal && !isNaN(parseInt(ageVal)) && parseInt(ageVal) >= 0) {
      const birthYear = dayjs().subtract(parseInt(ageVal), "year").year();
      approxDob = `${birthYear}-01-01`;
    }
    setForm((p) => ({ ...p, age: ageVal, dob: approxDob }));
    setFieldErrors((p) => ({ ...p, dob: undefined, age: undefined }));
  };

  // Quick Emergency Unknown Patient Registration Mode
  const handleEmergencyAliasToggle = () => {
    const nowSuffix = Date.now().toString().slice(-4);
    setForm((p) => ({
      ...p,
      first_name: "EMERGENCY",
      last_name: `TRAUMA-${nowSuffix}`,
      email: `emergency.${nowSuffix}@hospital.internal`,
      phone: "0000000000",
      gender: "Other",
      dob: "2000-01-01",
      age: "26",
      blood_group: "O-",
      marital_status: "Single",
      address: "Trauma Emergency Triage Bay",
      is_emergency_alias: true,
      notes: "Emergency unidentified patient registered under trauma protocol. Forensic identity merge pending.",
      password: `TempPass@${nowSuffix}`,
    }));
    toast.info("Emergency unidentified alias populated. Ready for immediate admission.");
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name?.trim()) errs.first_name = "First name is required";
    if (!form.last_name?.trim()) errs.last_name = "Last name is required";
    if (!form.email?.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format";
    if (!form.gender) errs.gender = "Gender is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    if (!form.address?.trim()) errs.address = "Address is required";
    if (!form.blood_group) errs.blood_group = "Blood group is required";
    if (!form.marital_status) errs.marital_status = "Marital status is required";

    if (!isEdit && !form.password?.trim()) errs.password = "Password is required";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: undefined }));
  };

  const doSubmit = async (options = { redirect: false }) => {
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    const payload = {
      ...form,
      age: form.age ? parseInt(form.age) : null,
    };

    if (form.password) {
      payload.user = { password: form.password };
    } else {
      delete payload.password;
    }

    try {
      if (options.redirect) setLoadingCreateAndUse(true);
      else setLoading(true);

      if (isEdit) {
        await patientService.updatePatient(id, payload);
        toast.success("Patient updated successfully!");
      } else {
        await patientService.createPatient(payload);
        toast.success("Patient created successfully with UHID!");
      }

      navigate(returnTo || "/patient-list");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} patient`);
    } finally {
      setLoading(false);
      setLoadingCreateAndUse(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await doSubmit();
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-[#0E1680]" size={32} />
      </div>
    );
  }

  return (
    <div className="md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header and Quick Emergency Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0E1680] flex items-center gap-2">
            <UserCircle2 className="text-[#0E1680]" size={26} />
            {isEdit ? "Edit Patient Record" : "New Patient Registration"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Universal Health Identifier (UHID), automated demographic verification, and trauma alias support
          </p>
        </div>

        {!isEdit && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleEmergencyAliasToggle}
            className="text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
          >
            <Siren className="h-4 w-4" /> Trauma Emergency Quick-Fill
          </Button>
        )}
      </div>

      {/* Duplicate Patient Alert Banner */}
      {duplicates.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Duplicate Patient Detection Alert ({duplicates.length} Potential Matches Found)
          </div>
          <div className="space-y-1">
            {duplicates.map((d) => (
              <div key={d.id} className="flex justify-between items-center bg-white p-2 rounded border border-amber-200">
                <div>
                  <span className="font-bold text-slate-900">{d.first_name} {d.last_name}</span>{" "}
                  <span className="text-slate-500">({d.gender}, {d.age ? `${d.age} yrs` : "Age N/A"})</span> —{" "}
                  <span className="font-mono text-indigo-700 font-semibold">UHID: {d.patient_code}</span> | Phone: {d.phone || "None"}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => navigate(`/patient-profile/${d.id}`)}
                >
                  View Existing Record
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        noValidate
        className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6"
      >
        {/* UHID Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-500 uppercase font-semibold">Universal Health Identifier (UHID)</span>
            <div className="font-mono font-bold text-sm text-[#0E1680]">
              {form.patient_code || "UHID-AUTO-GENERATED (Assigned upon creation)"}
            </div>
          </div>
          {form.is_emergency_alias && (
            <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
              <Siren className="h-3.5 w-3.5" /> Emergency Unknown Alias
            </span>
          )}
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FIRST NAME */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="first_name"
              placeholder="Enter first name"
              value={form.first_name}
              onChange={handleChange}
              className="rounded"
            />
            {fieldErrors.first_name && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>
            )}
          </div>

          {/* LAST NAME */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="last_name"
              placeholder="Enter last name"
              value={form.last_name}
              onChange={handleChange}
              className="rounded"
            />
            {fieldErrors.last_name && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              placeholder="patient@example.com"
              value={form.email}
              className="rounded"
              onChange={handleChange}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Contact Phone
            </label>
            <Input
              name="phone"
              placeholder="e.g. +91 9876543210"
              value={form.phone}
              className="rounded"
              onChange={handleChange}
            />
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Residential Address <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="address"
              placeholder="Enter residential address"
              className="rounded"
              rows={2}
              value={form.address}
              onChange={handleChange}
            />
            {fieldErrors.address && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.address}</p>
            )}
          </div>

          {/* GENDER & BLOOD GROUP */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Biological Gender <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.gender}
              onValueChange={(value) => handleChange({ target: { name: "gender", value } })}
            >
              <SelectTrigger className="w-full h-[42px]">
                <User2 size={16} className="mr-2 text-slate-500" />
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                {["Male", "Female", "Other"].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.gender && <p className="text-xs text-red-500 mt-1">{fieldErrors.gender}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Blood Group <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.blood_group}
              onValueChange={(value) => handleChange({ target: { name: "blood_group", value } })}
            >
              <SelectTrigger className="w-full h-[42px]">
                <Droplet size={16} className="mr-2 text-red-500" />
                <SelectValue placeholder="Select Blood Group" />
              </SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.blood_group && <p className="text-xs text-red-500 mt-1">{fieldErrors.blood_group}</p>}
          </div>

          {/* BI-DIRECTIONAL DOB & AGE SYNCHRONIZATION */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-indigo-600 font-medium">Syncs with Age</span>
            </div>
            <Input
              type="date"
              name="dob"
              className="rounded"
              value={form.dob}
              onChange={handleDobChange}
              max={new Date().toISOString().split("T")[0]}
            />
            {fieldErrors.dob && <p className="text-xs text-red-500 mt-1">{fieldErrors.dob}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Age (Years)
              </label>
              <span className="text-[11px] text-indigo-600 font-medium">Syncs with DOB</span>
            </div>
            <Input
              type="number"
              min="0"
              max="130"
              placeholder="e.g. 35"
              value={form.age}
              onChange={handleAgeChange}
              className="rounded"
            />
          </div>

          {/* MARITAL STATUS */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Marital Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.marital_status}
              onValueChange={(value) => handleChange({ target: { name: "marital_status", value } })}
            >
              <SelectTrigger className="w-full h-[42px]">
                <Heart size={16} className="mr-2 text-rose-500" />
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {["Single", "Married", "Divorced", "Widowed"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.marital_status && <p className="text-xs text-red-500 mt-1">{fieldErrors.marital_status}</p>}
          </div>

          {/* MOTHER LINKAGE (FOR NEWBORNS) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Mother Record (Newborn Linkage)
            </label>
            <div className="relative">
              <Baby size={16} className="absolute left-3 top-3 text-slate-400" />
              <Input
                name="parent_patient_id"
                placeholder="Mother UHID / Patient ID (Optional)"
                value={form.parent_patient_id}
                onChange={handleChange}
                className="pl-9 rounded"
              />
            </div>
          </div>

          {/* CLINICAL NOTES */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Clinical & Triage Notes
            </label>
            <Textarea
              name="notes"
              rows={2}
              placeholder="Allergies, chronic conditions, emergency contacts, or initial presentation notes"
              className="rounded"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          {/* PASSWORD */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              {isEdit ? "Set New Password" : "Set Password"}{" "}
              {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={isEdit ? "Leave empty to keep current" : "Set password for patient portal"}
                  value={form.password}
                  onChange={handleChange}
                  className="pl-9 rounded"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded cursor-pointer"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading || loadingCreateAndUse}
          >
            Cancel
          </Button>
          {!isEdit && returnTo && (
            <Button
              type="button"
              className="bg-[#0E1680] text-white hover:bg-[#0c136d] cursor-pointer"
              onClick={() => doSubmit({ redirect: true })}
              disabled={loading || loadingCreateAndUse}
            >
              {loadingCreateAndUse ? "Creating..." : "Create & Use"}
            </Button>
          )}
          <Button
            type="submit"
            className="bg-[#0E1680] text-white hover:bg-[#0c136d] font-semibold cursor-pointer"
            disabled={loading || loadingCreateAndUse}
          >
            {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Patient" : "Complete Registration")}
          </Button>
        </div>
      </form>
    </div>
  );
}
