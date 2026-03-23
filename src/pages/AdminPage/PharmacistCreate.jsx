import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import pharmacistsService from "../../service/pharmacistsService.js";
import departmentService from "../../service/departmentService.js";
import designationService from "../../service/designationService.js";

export default function PharmacistCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [form, setForm] = useState({
    pharmacist_email: "",
    pharmacist_phone: "",
    license_no: "",
    store_location: "",
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

  // Fetch for edit
  useEffect(() => {
    if (!id) return;
    const fetchPharmacist = async () => {
      setFetching(true);
      try {
        const res = await pharmacistsService.getPharmacistById(id);
        const data = res?.data?.data || res?.data || res;
        const staffData = data?.staff_profiles || {};
        setForm({
          pharmacist_email: data.pharmacist_email || "",
          pharmacist_phone: data.pharmacist_phone || "",
          license_no: data.license_no || "",
          store_location: data.store_location || "",
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
      } catch {
        toast.error("Failed to load pharmacist details");
      } finally {
        setFetching(false);
      }
    };
    fetchPharmacist();
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
    if (!form.pharmacist_email.trim()) { toast.error("Email is required"); return false; }
    if (!form.pharmacist_phone.trim()) { toast.error("Phone is required"); return false; }
    if (!form.license_no.trim()) { toast.error("License number is required"); return false; }
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
      date_of_joining: form.staff.date_of_joining,
      emergency_contact: form.staff.emergency_contact,
    };
    if (form.staff.department_id) staffPayload.department_id = form.staff.department_id;
    if (form.staff.designation_id) staffPayload.designation_id = form.staff.designation_id;

    const payload = {
      pharmacist_name: `${form.staff.first_name} ${form.staff.last_name}`.trim(),
      pharmacist_email: form.pharmacist_email,
      pharmacist_phone: form.pharmacist_phone,
      license_no: form.license_no,
      store_location: form.store_location,
      staff: staffPayload,
      user: { password: form.user.password },
    };

    setLoading(true);
    try {
      if (isEdit) {
        await pharmacistsService.updatePharmacist(id, payload);
        toast.success("Pharmacist updated successfully");
      } else {
        await pharmacistsService.createPharmacist(payload);
        toast.success("Pharmacist created successfully");
      }
      navigate("/pharmacists");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Pharmacist" : "Create Pharmacist"}
      </h2>

      {fetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">

          {/* Personal Information */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
              License No <span className="text-red-500">*</span>
              <Input value={form.license_no} onChange={(e) => setForm({ ...form, license_no: e.target.value })} />
            </label>
            <label className="col-span-2">
              Store Location
              <Input value={form.store_location} onChange={(e) => setForm({ ...form, store_location: e.target.value })} placeholder="e.g. Main Pharmacy, Block A" />
            </label>
          </div>

          {/* Account Information */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <label>
              Email <span className="text-red-500">*</span>
              <Input value={form.pharmacist_email} onChange={(e) => setForm({ ...form, pharmacist_email: e.target.value })} />
            </label>
            <label>
              Phone <span className="text-red-500">*</span>
              <Input value={form.pharmacist_phone} onChange={(e) => setForm({ ...form, pharmacist_phone: e.target.value })} />
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
          <div className="grid grid-cols-3 gap-4">
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
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/pharmacists")}>Cancel</Button>
            <Button type="submit" className="bg-[#0E1680] text-white" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Pharmacist" : "Create Pharmacist"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
