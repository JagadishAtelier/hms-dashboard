import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useEffect } from "react"; // ✅ add at top
import labTechniciansService from "../../service/labTechniciansService.js";
export default function LabTechnicianCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    labtech_name: "",
    labtech_email: "",
    labtech_phone: "",
    certifications: "",
    is_active: true,

    staff: {
      first_name: "",
      last_name: "",
      gender: "",
      dob: "",
      address: "",
      qualification: "",
      date_of_joining: "",
      emergency_contact: {
        name: "",
        relationship: "",
        phone: "",
      },
    },

    user: {
      password: "",
    },
  });

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.labtech_name || !form.labtech_email) {
      return toast.error("Name & Email required");
    }

    const payload = {
      labtech_name: form.labtech_name,
      labtech_email: form.labtech_email,
      labtech_phone: form.labtech_phone,

      certifications: form.certifications
        ? form.certifications.split(",").map((c) => c.trim())
        : [],

      is_active: form.is_active,

      staff: form.staff,
      user: {
        password: form.user.password,
      },
    };

    console.log("FINAL PAYLOAD:", payload);

    setLoading(true);
    try {
      // 👉 connect API here later
      

if (isEdit) {
  await labTechniciansService.updateLabTechnician(id, payload);
  toast.success("Updated successfully");
} else {
  await labTechniciansService.createLabTechnician(payload);
  toast.success("Created successfully");
}
toast.success("Lab Technician created successfully");
navigate("/labtechnician");
    
    } catch (err) {
      toast.error("Failed");
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
        emergency_contact: {
          ...form.staff.emergency_contact,
          [key]: value,
        },
      },
    });
useEffect(() => {
  if (!id) return;

  const fetchLabTech = async () => {
    try {
      const res = await labTechniciansService.getLabTechnicianById(id);

      const data = res?.data?.data || res?.data;
      const staff = data?.staff_profiles || {};

      setForm({
        labtech_name: data.labtech_name || "",
        labtech_email: data.labtech_email || "",
        labtech_phone: data.labtech_phone || "",
        certifications: Array.isArray(data.certifications)
          ? data.certifications.join(", ")
          : "",
        is_active: data.is_active ?? true,

        staff: {
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          gender: staff.gender || "",
          dob: staff.dob ? staff.dob.split("T")[0] : "",
          address: staff.address || "",
          qualification: staff.qualification || "",
          date_of_joining: staff.date_of_joining
            ? staff.date_of_joining.split("T")[0]
            : "",
          emergency_contact: staff.emergency_contact || {
            name: "",
            relationship: "",
            phone: "",
          },
        },

        user: { password: "" },
      });
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  fetchLabTech();
}, [id]);
  return (
    <div className="md:p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
  {isEdit ? "Edit Lab Technician" : "Create Lab Technician"}
</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        {/* 👤 PERSONAL */}
        <h3 className="text-lg font-semibold border-b pb-2">
          Personal Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <label>
            First Name *
            <Input
              value={form.staff.first_name}
              onChange={(e) =>
                handleStaffChange("first_name", e.target.value)
              }
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
              className="border p-2 rounded w-full"
              value={form.staff.gender}
              onChange={(e) =>
                handleStaffChange("gender", e.target.value)
              }
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            DOB
            <Input
              type="date"
              value={form.staff.dob}
              onChange={(e) =>
                handleStaffChange("dob", e.target.value)
              }
            />
          </label>
        </div>

        <label>
          Address
          <Textarea
            value={form.staff.address}
            onChange={(e) =>
              handleStaffChange("address", e.target.value)
            }
          />
        </label>

        {/* 🧪 LAB INFO */}
        <h3 className="text-lg font-semibold border-b pb-2">
          Lab Technician Info
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <label>
            Technician Name *
            <Input
              value={form.labtech_name}
              onChange={(e) =>
                setForm({ ...form, labtech_name: e.target.value })
              }
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

          <label>
            Date of Joining *
            <Input
              type="date"
              value={form.staff.date_of_joining}
              onChange={(e) =>
                handleStaffChange("date_of_joining", e.target.value)
              }
            />
          </label>

          <label>
            Certifications (comma separated)
            <Input
              value={form.certifications}
              onChange={(e) =>
                setForm({ ...form, certifications: e.target.value })
              }
            />
          </label>
        </div>

        {/* 💼 ACCOUNT */}
        <h3 className="text-lg font-semibold border-b pb-2">
          Account Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <label>
            Email *
            <Input
              value={form.labtech_email}
              onChange={(e) =>
                setForm({ ...form, labtech_email: e.target.value })
              }
            />
          </label>

          <label>
            Phone
            <Input
              value={form.labtech_phone}
              onChange={(e) =>
                setForm({ ...form, labtech_phone: e.target.value })
              }
            />
          </label>

          <label>
            Password *
            <Input
              type="password"
              value={form.user.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  user: { password: e.target.value },
                })
              }
            />
          </label>
        </div>

        {/* 🔘 STATUS */}
        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_active}
            onCheckedChange={(val) =>
              setForm({ ...form, is_active: val })
            }
          />
          <label>Active Status</label>
        </div>

        {/* 🚨 EMERGENCY */}
        <h3 className="text-lg font-semibold border-b pb-2">
          Emergency Contact
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder="Name"
            value={form.staff.emergency_contact.name}
            onChange={(e) =>
              handleEmergencyChange("name", e.target.value)
            }
          />
          <Input
            placeholder="Relationship"
            value={form.staff.emergency_contact.relationship}
            onChange={(e) =>
              handleEmergencyChange("relationship", e.target.value)
            }
          />
          <Input
            placeholder="Phone"
            value={form.staff.emergency_contact.phone}
            onChange={(e) =>
              handleEmergencyChange("phone", e.target.value)
            }
          />
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col md:flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/labtechnician")}>
            Cancel
          </Button>
<Button className="bg-[#0E1680] text-white" disabled={loading}>
  {loading
    ? "Saving..."
    : isEdit
    ? "Update Lab Technician"
    : "Create Lab Technician"}
</Button>
        </div>
      </form>
    </div>
  );
}