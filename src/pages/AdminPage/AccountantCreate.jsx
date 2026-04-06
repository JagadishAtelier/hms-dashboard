import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import accountantsService from "../../service/accountantsService.js";
import departmentService from "../../service/departmentService.js";
import designationService from "../../service/designationService.js";

export default function AccountantCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [form, setForm] = useState({
    accountant_email: "",
    accountant_phone: "",
    ledger_code: "",
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

  useEffect(() => {
    if (!id) return;
    const fetchAccountant = async () => {
      setFetching(true);
      try {
        const res = await accountantsService.getAccountantById(id);
        const data = res?.data?.data || res?.data || res;
        const staffData = data?.staff_profiles || {};
        setForm({
          accountant_email: data.accountant_email || "",
          accountant_phone: data.accountant_phone || "",
          ledger_code: data.ledger_code || "",
          user: { password: "" },
          staff: {
            first_name: staffData.first_name || "",
            last_name: staffData.last_name || "",
            gender: staffData.gender || "",
            dob: staffData.dob ? staffData.dob.split("T")[0] : "",
            address: staffData.address || "",
            qualification: staffData.qualification || "",
            department_id: staffData.department_id || "",
            designation_id: staffData.designation_id || "",
            date_of_joining: staffData.date_of_joining ? staffData.date_of_joining.split("T")[0] : "",
            emergency_contact: staffData.emergency_contact || { name: "", relationship: "", phone: "" },
          },
        });
      } catch {
        toast.error("Failed to load accountant details");
      } finally {
        setFetching(false);
      }
    };
    fetchAccountant();
  }, [id]);

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
    if (!form.accountant_email.trim()) { toast.error("Email is required"); return false; }
    if (!form.accountant_phone.trim()) { toast.error("Phone is required"); return false; }
    if (!isEdit && !form.user.password.trim()) { toast.error("Password is required"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const staffPayload = {
      first_name: form.staff.first_name,
      last_name: form.staff.last_name,
      gender: form.staff.gender,
      dob: form.staff.dob,
      address: form.staff.address,
      qualification: form.staff.qualification,
      date_of_joining: form.staff.date_of_joining,
      emergency_contact: form.staff.emergency_contact,
    };
    if (form.staff.department_id) staffPayload.department_id = form.staff.department_id;
    if (form.staff.designation_id) staffPayload.designation_id = form.staff.designation_id;

    const payload = {
      accountant_name: `${form.staff.first_name} ${form.staff.last_name}`.trim(),
      accountant_email: form.accountant_email,
      accountant_phone: form.accountant_phone,
      ledger_code: form.ledger_code,
      staff: staffPayload,
      user: { password: form.user.password },
    };

    setLoading(true);
    try {
      if (isEdit) {
        await accountantsService.updateAccountant(id, payload);
        toast.success("Accountant updated successfully");
      } else {
        await accountantsService.createAccountant(payload);
        toast.success("Accountant created successfully");
      }
      navigate("/accountant");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Accountant" : "Create Accountant"}
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
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 w-full">
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
              Qualification
              <Input value={form.staff.qualification} onChange={(e) => handleStaffChange("qualification", e.target.value)} />
            </label>
            <label>
              Ledger Code
              <Input value={form.ledger_code} onChange={(e) => setForm({ ...form, ledger_code: e.target.value })} placeholder="e.g. ACC-001" />
            </label>
          </div>

          {/* Account Information */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label>
              Email <span className="text-red-500">*</span>
              <Input value={form.accountant_email} onChange={(e) => setForm({ ...form, accountant_email: e.target.value })} />
            </label>
            <label>
              Phone <span className="text-red-500">*</span>
              <Input value={form.accountant_phone} onChange={(e) => setForm({ ...form, accountant_phone: e.target.value })} />
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
            <Button type="button" variant="outline" onClick={() => navigate("/accountant")}>Cancel</Button>
            <Button type="submit" className="bg-[#0E1680] text-white" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Accountant" : "Create Accountant"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
