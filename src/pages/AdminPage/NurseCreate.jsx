import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import nursesService from "../../service/nursesService.js";
import departmentService from "../../service/departmentService.js";
import designationService from "../../service/designationService.js";

export default function NurseCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [form, setForm] = useState({
    nurse_name: "",
    nurse_email: "",
    nurse_phone: "",
    shift: "",
    license_no: "",
    skills: "",
    user: { password: "" },
    staff: {
      first_name: "",
      last_name: "",
      gender: "",
      dob: "",
      address: "",
      department_id: "",
      designation_id: "",
      date_of_joining: "",
      emergency_contact: { name: "", relationship: "", phone: "" },
    },
  });

  // Fetch nurse for edit
  useEffect(() => {
    if (!id) return;
    const fetchNurse = async () => {
      setFetching(true);
      try {
        const res = await nursesService.getNurseById(id);
        const data = res?.data?.data || res?.data || res;
        const staffData = data?.staff_profiles || {};

        setForm({
          nurse_name: data.nurse_name || "",
          nurse_email: data.nurse_email || "",
          nurse_phone: data.nurse_phone || "",
          shift: data.shift || "",
          license_no: data.license_no || "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : data.skills || "",
          user: { password: "" },
          staff: {
            first_name: staffData.first_name || "",
            last_name: staffData.last_name || "",
            gender: staffData.gender || "",
            dob: staffData.dob ? staffData.dob.split("T")[0] : "",
            address: staffData.address || "",
            department_id: staffData.department_id || "",
            designation_id: staffData.designation_id || "",
            date_of_joining: staffData.date_of_joining ? staffData.date_of_joining.split("T")[0] : "",
            emergency_contact: staffData.emergency_contact || { name: "", relationship: "", phone: "" },
          },
        });
      } catch (err) {
        toast.error("Failed to load nurse details");
      } finally {
        setFetching(false);
      }
    };
    fetchNurse();
  }, [id]);

  // Fetch dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          departmentService.getAllDepartments(),
          designationService.getAllDesignations(),
        ]);
        const deptData = deptRes?.data?.data || deptRes?.data || (Array.isArray(deptRes) ? deptRes : []);
        const desigData = desigRes?.data?.data || desigRes?.data || (Array.isArray(desigRes) ? desigRes : []);
        setDepartments(Array.isArray(deptData) ? deptData : []);
        setDesignations(Array.isArray(desigData) ? desigData : []);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdowns();
  }, []);

  const handleStaffChange = (key, value) =>
    setForm({ ...form, staff: { ...form.staff, [key]: value } });

  const handleEmergencyChange = (key, value) =>
    setForm({ ...form, staff: { ...form.staff, emergency_contact: { ...form.staff.emergency_contact, [key]: value } } });

  const validate = () => {
    if (!form.staff.first_name.trim()) { toast.error("First name is required"); return false; }
    if (!form.nurse_email.trim()) { toast.error("Email is required"); return false; }
    if (!form.nurse_phone.trim()) { toast.error("Phone is required"); return false; }
    if (!form.license_no.trim()) { toast.error("License number is required"); return false; }
    if (!form.skills.trim()) { toast.error("At least one skill is required"); return false; }
    if (!isEdit && !form.user.password.trim()) { toast.error("Password is required"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const skillsArray = form.skills.split(",").map((s) => s.trim()).filter(Boolean);

    const staffPayload = {
      first_name: form.staff.first_name,
      last_name: form.staff.last_name,
      gender: form.staff.gender,
      dob: form.staff.dob,
      address: form.staff.address,
      date_of_joining: form.staff.date_of_joining,
      emergency_contact: form.staff.emergency_contact,
    };
    // Only include department_id / designation_id if actually selected
    if (form.staff.department_id) staffPayload.department_id = form.staff.department_id;
    if (form.staff.designation_id) staffPayload.designation_id = form.staff.designation_id;

    const payload = {
      nurse_name: `${form.staff.first_name} ${form.staff.last_name}`.trim(),
      nurse_email: form.nurse_email,
      nurse_phone: form.nurse_phone,
      shift: form.shift,
      license_no: form.license_no,
      skills: skillsArray,
      staff: staffPayload,
      user: { password: form.user.password },
    };

    setLoading(true);
    try {
      if (isEdit) {
        await nursesService.updateNurse(id, payload);
        toast.success("Nurse updated successfully");
      } else {
        await nursesService.createNurse(payload);
        toast.success("Nurse created successfully");
      }
      navigate("/nurses");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Nurse" : "Create Nurse"}
      </h2>

      {fetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">

          {/* Personal Information */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label>
              First Name <span className="text-red-500">*</span>
              <Input value={form.staff.first_name} onChange={(e) => handleStaffChange("first_name", e.target.value)} />
            </label>
            <label>
              Last Name
              <Input value={form.staff.last_name} onChange={(e) => handleStaffChange("last_name", e.target.value)} />
            </label>
            <label>
              Gender
              <select className="border rounded-md p-2 w-full" value={form.staff.gender} onChange={(e) => handleStaffChange("gender", e.target.value)}>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Date of Birth
              <Input type="date" value={form.staff.dob} onChange={(e) => handleStaffChange("dob", e.target.value)} />
            </label>
          </div>
          <label className="block">
            Address
            <Textarea value={form.staff.address} onChange={(e) => handleStaffChange("address", e.target.value)} />
          </label>

          {/* Professional Information */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label>
              Department
              <select className="border rounded-md p-2 w-full" value={form.staff.department_id} onChange={(e) => handleStaffChange("department_id", e.target.value)}>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label>
              Designation
              <select className="border rounded-md p-2 w-full" value={form.staff.designation_id} onChange={(e) => handleStaffChange("designation_id", e.target.value)}>
                <option value="">Select Designation</option>
                {designations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </label>
            <label>
              Date of Joining
              <Input type="date" value={form.staff.date_of_joining} onChange={(e) => handleStaffChange("date_of_joining", e.target.value)} />
            </label>
            <label>
              Shift
              <select className="border rounded-md p-2 w-full" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
                <option value="">Select Shift</option>
                <option>Morning</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </label>
            <label>
              License No <span className="text-red-500">*</span>
              <Input value={form.license_no} onChange={(e) => setForm({ ...form, license_no: e.target.value })} />
            </label>
            <label>
              Skills (comma separated) <span className="text-red-500">*</span>
              <Input placeholder="e.g. IV Therapy, Wound Care" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </label>
          </div>

          {/* Account Information */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label>
              Email <span className="text-red-500">*</span>
              <Input value={form.nurse_email} onChange={(e) => setForm({ ...form, nurse_email: e.target.value })} />
            </label>
            <label>
              Phone <span className="text-red-500">*</span>
              <Input value={form.nurse_phone} onChange={(e) => setForm({ ...form, nurse_phone: e.target.value })} />
            </label>
            {!isEdit && (
              <label>
                Password <span className="text-red-500">*</span>
                <Input type="password" value={form.user.password} onChange={(e) => setForm({ ...form, user: { password: e.target.value } })} />
              </label>
            )}
          </div>

          {/* Emergency Contact */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <label>
              Name
              <Input value={form.staff.emergency_contact.name} onChange={(e) => handleEmergencyChange("name", e.target.value)} />
            </label>
            <label>
              Relationship
              <Input value={form.staff.emergency_contact.relationship} onChange={(e) => handleEmergencyChange("relationship", e.target.value)} />
            </label>
            <label>
              Phone
              <Input value={form.staff.emergency_contact.phone} onChange={(e) => handleEmergencyChange("phone", e.target.value)} />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/nurses")}>Cancel</Button>
            <Button type="submit" className="bg-[#0E1680] text-white" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Nurse" : "Create Nurse"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
