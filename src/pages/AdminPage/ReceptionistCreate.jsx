import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
function ReceptionistCreate() {
  const navigate = useNavigate();
const { id } = useParams();
const isEdit = Boolean(id);
  const [form, setForm] = useState({
  email: "",
  phone: "",
  password: "",
  shift: "",
  date_of_joining: "",
  is_active: true,

  staff: {
    first_name: "",
    last_name: "",
    gender: "",
    dob: "",
    address: "",
    emergency_contact: {
      name: "",
      relationship: "",
      phone: "",
    },
  },
});
useEffect(() => {
  if (!id) return;

  const stored =
    JSON.parse(localStorage.getItem("receptionists")) || [];

  const existing = stored.find((item) => String(item.id) === String(id));

  if (existing) {
    const names = existing.name ? existing.name.split(" ") : [];

    setForm({
      email: existing.email || "",
      phone: existing.phone || "",
      password: "",
      shift: existing.shift || "",
      date_of_joining: existing.date_of_joining || "",
      is_active: existing.is_active ?? true,

      staff: {
        first_name: names[0] || "",
        last_name: names.slice(1).join(" ") || "",
        gender: existing.gender || "",
        dob: existing.dob || "",
        address: existing.address || "",
        emergency_contact: {
          name: existing.emergency_name || "",
          relationship: existing.emergency_relation || "",
          phone: existing.emergency_phone || "",
        },
      },
    });
  }
}, [id]);
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
const handleSubmit = (e) => {
  e.preventDefault();

  const stored =
    JSON.parse(localStorage.getItem("receptionists")) || [];

  const payload = {
    id: isEdit ? id : Date.now(),
    name: `${form.staff.first_name} ${form.staff.last_name}`.trim(),
    email: form.email,
    phone: form.phone,
    role: "Receptionist",
    shift: form.shift,
    date_of_joining: form.date_of_joining,
    is_active: form.is_active,

    // optional extra
    gender: form.staff.gender,
    dob: form.staff.dob,
    address: form.staff.address,
    emergency_name: form.staff.emergency_contact.name,
    emergency_relation: form.staff.emergency_contact.relationship,
    emergency_phone: form.staff.emergency_contact.phone,
  };

  let updated;

  if (isEdit) {
    updated = stored.map((item) =>
      item.id == id ? payload : item
    );
    toast.success("Receptionist Updated Successfully");
  } else {
    updated = [...stored, payload];
    toast.success("Receptionist Created Successfully");
  }

  localStorage.setItem("receptionists", JSON.stringify(updated));
  navigate("/receptionist");
};
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* TITLE */}
     <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
  {isEdit ? "Edit Receptionist" : "Create Receptionist"}
</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        {/* PERSONAL INFO */}
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Personal Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <label>
            First Name *
            <Input
              value={form.staff.first_name}
onChange={(e) => handleStaffChange("first_name", e.target.value)}
            />
          </label>

          <label>
            Last Name
            <Input
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
          </label>

          <label>
            Gender
            <select
              className="border rounded-md p-2 w-full"
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
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
              value={form.dob}
              onChange={(e) => handleChange("dob", e.target.value)}
            />
          </label>
        </div>

        <label>
          Address
          <Textarea
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </label>

        {/* ✅ PROFESSIONAL INFO */}
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Professional Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <label>
            Date of Joining *
            <Input
              type="date"
              value={form.date_of_joining}
              onChange={(e) =>
                handleChange("date_of_joining", e.target.value)
              }
            />
          </label>

          <label>
            Shift *
            <select
              className="border rounded-md p-2 w-full"
              value={form.shift}
              onChange={(e) => handleChange("shift", e.target.value)}
            >
              <option value="">Select Shift</option>
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </label>
        </div>

        {/* ✅ STATUS */}
        <div className="flex items-center gap-3">
          <Switch
            checked={form.is_active}
            onCheckedChange={(val) =>
              handleChange("is_active", val)
            }
          />
          <span className="text-sm text-gray-700">
            Active Status
          </span>
        </div>

        {/* ACCOUNT */}
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Account Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <label>
            Email *
            <Input
              value={form.email}
onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Phone *
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </label>
        </div>

        <label>
          Password *
          <Input
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </label>

        {/* EMERGENCY */}
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Emergency Contact
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <label>
            Name
            <Input
             value={form.staff.emergency_contact.name}
onChange={(e) => handleEmergencyChange("name", e.target.value)}
            />
          </label>

          <label>
            Relationship
            <Input
              value={form.emergency_relation}
              onChange={(e) =>
                handleChange("emergency_relation", e.target.value)
              }
            />
          </label>

          <label>
            Phone
            <Input
              value={form.emergency_phone}
              onChange={(e) =>
                handleChange("emergency_phone", e.target.value)
              }
            />
          </label>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/receptionist")}
          >
            Cancel
          </Button>

         <Button className="bg-[#0E1680] text-white">
  {isEdit ? "Update Receptionist" : "Create Receptionist"}
</Button>
        </div>
      </form>
    </div>
  );
}

export default ReceptionistCreate;