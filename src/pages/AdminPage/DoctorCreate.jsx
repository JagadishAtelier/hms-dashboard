import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import doctorsService from "../../service/doctorsService.js";
import departmentService from "../../service/departmentService.js";
import designationService from "../../service/designationService.js";

export default function DoctorCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [form, setForm] = useState({
    doctor_email: "",
    doctor_phone: "",
    consultation_fee: "",
    available_online: true,
    specialties: "",
    user: { password: "" },
    staff: {
      first_name: "",
      last_name: "",
      gender: "",
      dob: "",
      address: "",
      qualification: "",
      department_id: "",
      designation_id: "",
      date_of_joining: "",
      emergency_contact: { name: "", relationship: "", phone: "" },
    },
  });

  // ✅ Fetch doctor details (Edit)
  // ✅ Fetch doctor details (Edit)
useEffect(() => {
  if (!id) return;
  const fetchDoctor = async () => {
    setFetching(true);
    try {
      const res = await doctorsService.getDoctorById(id);
      const data = res?.data?.data || res?.data || res;

      // Extract nested staff_profiles data safely
      const staffData = data?.staff_profiles || {};

      setForm({
        doctor_email: data.doctor_email || "",
        doctor_phone: data.doctor_phone || "",
        consultation_fee: data.consultation_fee || "",
        available_online: Boolean(data.available_online),
        specialties: Array.isArray(data.specialties)
          ? data.specialties.join(", ")
          : data.specialties || "",
        user: { password: "" }, // Password not editable

        staff: {
          first_name: staffData.first_name || "",
          last_name: staffData.last_name || "",
          gender: staffData.gender || "",
          dob: staffData.dob ? staffData.dob.split("T")[0] : "",
          address: staffData.address || "",
          qualification: staffData.qualification || "",
          department_id: staffData.department_id || "",
          designation_id: staffData.designation_id || "",
          date_of_joining: staffData.date_of_joining
            ? staffData.date_of_joining.split("T")[0]
            : "",
          emergency_contact: staffData.emergency_contact || {
            name: "",
            relationship: "",
            phone: "",
          },
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doctor details");
    } finally {
      setFetching(false);
    }
  };
  fetchDoctor();
  // eslint-disable-next-line
}, [id]);


  // ✅ Fetch departments & designations
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          departmentService.getAllDepartments(),
          designationService.getAllDesignations(),
        ]);

        const deptData =
          deptRes?.data?.data ||
          deptRes?.data ||
          (Array.isArray(deptRes) ? deptRes : []);
        const desigData =
          desigRes?.data?.data ||
          desigRes?.data ||
          (Array.isArray(desigRes) ? desigRes : []);

        setDepartments(Array.isArray(deptData) ? deptData : []);
        setDesignations(Array.isArray(desigData) ? desigData : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdowns();
  }, []);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!form.staff.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!form.doctor_email.trim())
      newErrors.doctor_email = "Doctor email is required";
    if (!form.doctor_phone.trim())
      newErrors.doctor_phone = "Doctor phone is required";
    if (!form.staff.department_id)
      newErrors.department_id = "Department is required";
    if (!form.staff.designation_id)
      newErrors.designation_id = "Designation is required";
    if (!form.staff.date_of_joining)
      newErrors.date_of_joining = "Date of joining is required";
    if (!form.consultation_fee)
      newErrors.consultation_fee = "Consultation fee is required";
    if (!isEdit && !form.user.password.trim())
      newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error("Please fix validation errors");

    const payload = {
      ...form,
      specialties: form.specialties
        ? form.specialties.split(",").map((s) => s.trim())
        : [],
    };

    setLoading(true);
    try {
      if (isEdit) {
        await doctorsService.updateDoctor(id, payload);
        toast.success("Doctor updated successfully");
      } else {
        await doctorsService.createDoctor(payload);
        toast.success("Doctor created successfully");
      }
      navigate("/doctors");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStaffChange = (key, value) =>
    setForm({ ...form, staff: { ...form.staff, [key]: value } });

  const handleEmergencyChange = (key, value) =>
    setForm({
      ...form,
      staff: {
        ...form.staff,
        emergency_contact: { ...form.staff.emergency_contact, [key]: value },
      },
    });

  // ✅ Render
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Doctor" : "Create Doctor"}
      </h2>

      {fetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow"
        >
          {/* 👤 PERSONAL INFORMATION */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <label>
              First Name <span className="text-red-500">*</span>
              <Input
                value={form.staff.first_name}
                onChange={(e) =>
                  handleStaffChange("first_name", e.target.value)
                }
                required
              />
            </label>

            <label>
              Last Name
              <Input
                value={form.staff.last_name}
                onChange={(e) =>
                  handleStaffChange("last_name", e.target.value)
                }
              />
            </label>

            <label>
              Gender
              <select
                className="border rounded-md p-2 w-full"
                value={form.staff.gender}
                onChange={(e) => handleStaffChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Date of Birth
              <Input
                type="date"
                value={form.staff.dob}
                onChange={(e) => handleStaffChange("dob", e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            Address
            <Textarea
              value={form.staff.address}
              onChange={(e) => handleStaffChange("address", e.target.value)}
            />
          </label>

          {/* 🩺 PROFESSIONAL INFORMATION */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Professional Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <label>
              Department <span className="text-red-500">*</span>
              <select
                className="border rounded-md p-2 w-full"
                value={form.staff.department_id}
                onChange={(e) =>
                  handleStaffChange("department_id", e.target.value)
                }
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Designation <span className="text-red-500">*</span>
              <select
                className="border rounded-md p-2 w-full"
                value={form.staff.designation_id}
                onChange={(e) =>
                  handleStaffChange("designation_id", e.target.value)
                }
                required
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date of Joining <span className="text-red-500">*</span>
              <Input
                type="date"
                value={form.staff.date_of_joining}
                onChange={(e) =>
                  handleStaffChange("date_of_joining", e.target.value)
                }
                required
              />
            </label>

            <label>
              Qualification
              <Input
                value={form.staff.qualification}
                onChange={(e) =>
                  handleStaffChange("qualification", e.target.value)
                }
              />
            </label>
          </div>

          <label>
            Consultation Fee <span className="text-red-500">*</span>
            <Input
              type="number"
              value={form.consultation_fee}
              onChange={(e) =>
                setForm({ ...form, consultation_fee: e.target.value })
              }
              required
            />
          </label>

          <label>
            Specialties (comma separated)
            <Input
              value={form.specialties}
              onChange={(e) =>
                setForm({ ...form, specialties: e.target.value })
              }
            />
          </label>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.available_online}
              onCheckedChange={(val) =>
                setForm({ ...form, available_online: val })
              }
            />
            <label className="text-sm">
              Available for Online Consultation
            </label>
          </div>

          {/* 💼 ACCOUNT INFORMATION */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Account Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <label>
              Email <span className="text-red-500">*</span>
              <Input
                value={form.doctor_email}
                onChange={(e) =>
                  setForm({ ...form, doctor_email: e.target.value })
                }
                required
              />
            </label>

            <label>
              Phone <span className="text-red-500">*</span>
              <Input
                value={form.doctor_phone}
                onChange={(e) =>
                  setForm({ ...form, doctor_phone: e.target.value })
                }
                required
              />
            </label>

            {!isEdit && (
              <label>
                Password <span className="text-red-500">*</span>
                <Input
                  type="password"
                  value={form.user.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      user: { ...form.user, password: e.target.value },
                    })
                  }
                  required
                />
              </label>
            )}
          </div>

          {/* 🚨 EMERGENCY CONTACT */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <label>
              Name
              <Input
                value={form.staff.emergency_contact.name}
                onChange={(e) =>
                  handleEmergencyChange("name", e.target.value)
                }
              />
            </label>
            <label>
              Relationship
              <Input
                value={form.staff.emergency_contact.relationship}
                onChange={(e) =>
                  handleEmergencyChange("relationship", e.target.value)
                }
              />
            </label>
            <label>
              Phone
              <Input
                value={form.staff.emergency_contact.phone}
                onChange={(e) =>
                  handleEmergencyChange("phone", e.target.value)
                }
              />
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/doctors")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0E1680] text-white"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Doctor"
                : "Create Doctor"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
