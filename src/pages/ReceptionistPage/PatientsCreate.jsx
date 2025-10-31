// src/pages/patients/PatientsCreate.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import patientService from "../../service/patientService";

export default function PatientsCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo"); // e.g. /appointments/create

  const [loading, setLoading] = useState(false);
  const [loadingCreateAndUse, setLoadingCreateAndUse] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    blood_group: "",
    marital_status: "",
    notes: "",
    password: "",
  });

  // field-level errors (server or client)
  const [fieldErrors, setFieldErrors] = useState({});

  // helper: extract created patient from many possible response shapes
  const extractCreatedPatient = (res) => {
    const maybe = res?.data ?? res;
    if (!maybe) return null;
    if (maybe.patient) return maybe.patient;
    if (maybe.data?.patient) return maybe.data.patient;
    if (maybe.id && maybe.first_name) return maybe;
    return maybe;
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = "First name is required";
    if (!form.last_name.trim()) errs.last_name = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format";
    if (!form.gender) errs.gender = "Gender is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.blood_group) errs.blood_group = "Blood group is required";
    if (!form.marital_status) errs.marital_status = "Marital status is required";
    if (!form.password.trim()) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: undefined }));
  };

  // keep DOB but do not calculate age in frontend (backend will calculate)
  const handleDobChange = (e) => {
    const dob = e.target.value;
    setForm((p) => ({ ...p, dob }));
    setFieldErrors((p) => ({ ...p, dob: undefined }));
  };

  // handle server error mapping to fields (if backend returns structured errors)
  const mapServerErrors = (err) => {
    const serverErrors = {};
    const data = err?.response?.data ?? err?.response ?? {};
    if (data?.errors && typeof data.errors === "object") {
      Object.assign(serverErrors, data.errors);
    } else if (data?.validation && typeof data.validation === "object") {
      Object.assign(serverErrors, data.validation);
    }
    return serverErrors;
  };

  // create patient action (optionally redirectToReturn)
  const doCreate = async (options = { redirect: false }) => {
    const valid = validate();
    if (!valid) {
      toast.error("Please fix validation errors");
      return null;
    }

    const payload = {
      ...form,
      user: { password: form.password }, // backend expects nested user.password
    };

    try {
      if (options.redirect) setLoadingCreateAndUse(true);
      else setLoading(true);

      const res = await patientService.createPatient(payload);
      const created = extractCreatedPatient(res);
      const patientId =
        created?.id ||
        created?.patient?.id ||
        created?.patient_id ||
        created?.patientId ||
        "";

      toast.success("Patient created successfully!");

      if (returnTo) {
        // normalize and attach patientId
        try {
          const url = new URL(window.location.origin + returnTo);
          if (patientId) url.searchParams.set("patientId", patientId);
          const relative = url.pathname + url.search;
          navigate(relative);
        } catch (e) {
          // fallback if returnTo isn't a valid path for URL constructor
          const sep = returnTo.includes("?") ? "&" : "?";
          navigate(`${returnTo}${sep}patientId=${patientId}`);
        }
        return created;
      }

      navigate("/patients");
      return created;
    } catch (err) {
      console.error("Create patient error:", err);
      const serverFieldErrors = mapServerErrors(err);
      if (Object.keys(serverFieldErrors).length > 0) {
        setFieldErrors(serverFieldErrors);
      }
      const message =
        err?.response?.data?.message || err?.message || "Failed to create patient";
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
      setLoadingCreateAndUse(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await doCreate({ redirect: false });
  };

  const onCreateAndUse = async (e) => {
    e.preventDefault();
    if (!returnTo) {
      toast.error("No returnTo specified");
      return;
    }
    await doCreate({ redirect: true });
  };

  // password strength simple helper
  const computePasswordStrength = (pwd = "") => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0..4
  };

  const pwScore = computePasswordStrength(form.password);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#0E1680] mb-6">Add New Patient</h1>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow"
        noValidate
      >
        {/* Left column */}
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="first_name" className="text-sm font-medium">
              First name <span className="text-red-500">*</span>
            </label>
            <Input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First Name"
            />
            {fieldErrors.first_name && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</div>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="text-sm font-medium">
              Last name <span className="text-red-500">*</span>
            </label>
            <Input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last Name"
            />
            {fieldErrors.last_name && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</div>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
            />
            {fieldErrors.email && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.email}</div>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <Input
              id="phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
            />
            {fieldErrors.phone && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.phone}</div>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="text-sm font-medium">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full h-10 border rounded px-2"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {fieldErrors.gender && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.gender}</div>
            )}
          </div>

          <div>
            <label htmlFor="dob" className="text-sm font-medium">
              Date of birth <span className="text-red-500">*</span>
            </label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleDobChange}
              max={new Date().toISOString().split("T")[0]}
            />
            {fieldErrors.dob && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.dob}</div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="address" className="text-sm font-medium">
              Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
            />
            {fieldErrors.address && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.address}</div>
            )}
          </div>

          <div>
            <label htmlFor="blood_group" className="text-sm font-medium">
              Blood group <span className="text-red-500">*</span>
            </label>
            <select
              id="blood_group"
              name="blood_group"
              value={form.blood_group}
              onChange={handleChange}
              className="w-full h-10 border rounded px-2"
            >
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {fieldErrors.blood_group && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.blood_group}</div>
            )}
          </div>

          <div>
            <label htmlFor="marital_status" className="text-sm font-medium">
              Marital status <span className="text-red-500">*</span>
            </label>
            <select
              id="marital_status"
              name="marital_status"
              value={form.marital_status}
              onChange={handleChange}
              className="w-full h-10 border rounded px-2"
            >
              <option value="">Select Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
            {fieldErrors.marital_status && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.marital_status}</div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
              rows={3}
            />
            {fieldErrors.notes && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.notes}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Set password <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Set Password"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-sm px-3 py-2 border rounded whitespace-nowrap"
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.password}</div>
            )}

            {/* password strength */}
            {/* <div className="text-xs mt-2">
              <div>
                Password strength:
                <span className="ml-2 font-medium">
                  {["Very weak", "Weak", "Okay", "Good", "Strong"][pwScore]}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded mt-1 overflow-hidden">
                <div style={{ width: `${(pwScore / 4) * 100}%` }} className="h-full" />
              </div>
            </div> */}
          </div>
        </div>

        {/* actions */}
        <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading || loadingCreateAndUse}
          >
            Cancel
          </Button>

          {returnTo ? (
            <Button
              type="button"
              onClick={onCreateAndUse}
              disabled={loading || loadingCreateAndUse}
              className="bg-[#0E1680] text-white"
            >
              {loadingCreateAndUse ? "Creating..." : "Create & Use"}
            </Button>
          ) : null}

          <Button
            type="submit"
            className="bg-[#0E1680] text-white"
            disabled={loading || loadingCreateAndUse}
          >
            {loading ? "Creating..." : "Create Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
