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

  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch patient data if edit mode
  useEffect(() => {
    if (!isEdit) return;

    const fetchPatient = async () => {
      setFetching(true);
      try {
        const res = await patientService.getPatientById(id);
        const patient = res?.data || res; // Adjust based on API response structure

        setForm({
          first_name: patient.first_name || "",
          last_name: patient.last_name || "",
          email: patient.email || "",
          phone: patient.phone || "",
          gender: patient.gender || "",
          dob: patient.dob ? dayjs(patient.dob).format("YYYY-MM-DD") : "",
          address: patient.address || "",
          blood_group: patient.blood_group || "",
          marital_status: patient.marital_status || "",
          notes: patient.notes || "",
          password: "", // Don't populate password
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

    // Password required only for create, optional for edit
    if (!isEdit && !form.password?.trim()) errs.password = "Password is required";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleDobChange = (e) => {
    setForm((p) => ({ ...p, dob: e.target.value }));
  };

  const doSubmit = async (options = { redirect: false }) => {
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    const payload = { ...form };

    // Handle password logic
    if (form.password) {
      payload.user = { password: form.password };
    } else {
      // If password is empty, remove it from payload (backend shouldn't update it)
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
        toast.success("Patient created successfully!");
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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#0E1680] mb-6 flex items-center gap-2">
        <UserCircle2 className="text-[#0E1680]" size={24} />
        {isEdit ? "Edit Patient" : "Add New Patient"}
      </h1>

      <form
        onSubmit={onSubmit}
        noValidate
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6"
      >
        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FIRST NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700">
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
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.first_name}
              </p>
            )}
          </div>

          {/* LAST NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700">
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
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.last_name}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              placeholder="example@email.com"
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
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              className="rounded"
              onChange={handleChange}
            />
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="address"
              placeholder="Enter address"
              className="rounded"
              rows={2}
              value={form.address}
              onChange={handleChange}
            />
            {fieldErrors.address && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.address}
              </p>
            )}
          </div>

          <div className="grid grid-col-1 sm:grid-cols-2 gap-4">
            {/* GENDER */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.gender}
                onValueChange={(value) =>
                  handleChange({ target: { name: "gender", value } })
                }
              >
                <SelectTrigger className="w-full h-[42px] text-sm border border-gray-200 bg-white rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all flex items-center">
                  <User2 size={16} className="mr-2 text-gray-500" />
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="rounded-md shadow-lg border border-gray-100 bg-white">
                  {["Male", "Female", "Other"].map((g) => (
                    <SelectItem
                      key={g}
                      value={g}
                      className="py-2 px-3 text-sm text-gray-700 hover:bg-[#F4F6FA]"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.gender && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.gender}
                </p>
              )}
            </div>

            {/* DOB */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="date"
                  name="dob"
                  className="rounded"
                  value={form.dob}
                  onChange={handleDobChange}
                  max={new Date().toISOString().split("T")[0]}
                />
                <div className="bg-white">
                  <Calendar
                    className=" absolute right-3 -z-50 top-3 text-gray-400"
                    size={16}
                  />
                </div>
              </div>
              {fieldErrors.dob && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.dob}</p>
              )}
            </div>
          </div>
          <div className="grid grid-col-1 sm:grid-cols-2 gap-4">
            {/* BLOOD GROUP */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Blood Group <span className="text-red-500">*</span>
              </label>

              <Select
                value={form.blood_group}
                onValueChange={(value) =>
                  handleChange({ target: { name: "blood_group", value } })
                }
              >
                <SelectTrigger className="w-full h-[42px] text-sm border border-gray-200 bg-white rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all flex items-center">
                  <Droplet size={16} className="mr-2 text-gray-500" />
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>

                <SelectContent className="rounded-md shadow-lg border border-gray-100 bg-white">
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (g) => (
                      <SelectItem
                        key={g}
                        value={g}
                        className="py-2 px-3 text-sm text-gray-700 hover:bg-[#F4F6FA]"
                      >
                        {g}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.blood_group && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.blood_group}
                </p>
              )}
            </div>

            {/* MARITAL STATUS */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Marital Status <span className="text-red-500">*</span>
              </label>

              <Select
                value={form.marital_status}
                onValueChange={(value) =>
                  handleChange({ target: { name: "marital_status", value } })
                }
              >
                <SelectTrigger className="w-full h-[42px] text-sm border border-gray-200 bg-white rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all flex items-center">
                  <Heart size={16} className="mr-2 text-gray-500" />
                  <SelectValue placeholder="Select Marital Status" />
                </SelectTrigger>

                <SelectContent className="rounded-md shadow-lg border border-gray-100 bg-white">
                  {["Single", "Married"].map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="py-2 px-3 text-sm text-gray-700 hover:bg-[#F4F6FA]"
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.marital_status && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.marital_status}
                </p>
              )}
            </div>
          </div>

          {/* NOTES */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <Textarea
              name="notes"
              rows={3}
              placeholder="Add any patient notes"
              className="rounded"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          {/* PASSWORD */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              {isEdit ? "Set New Password" : "Set Password"}{" "}
              {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={isEdit ? "Leave empty to keep current" : "Set password"}
                  value={form.password}
                  onChange={handleChange}
                  className="pl-9 rounded"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
              className="bg-[#0E1680] text-white hover:bg-[#0c136d]"
              onClick={() => doSubmit({ redirect: true })}
              disabled={loading || loadingCreateAndUse}
            >
              {loadingCreateAndUse ? "Creating..." : "Create & Use"}
            </Button>
          )}
          <Button
            type="submit"
            className="bg-[#0E1680] text-white hover:bg-[#0c136d]"
            disabled={loading || loadingCreateAndUse}
          >
            {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Patient" : "Create Patient")}
          </Button>
        </div>
      </form>
    </div>
  );
}
