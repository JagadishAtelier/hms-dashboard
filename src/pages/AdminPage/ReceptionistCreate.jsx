import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import receptionistsService from "../../service/receptionistsService.js";
import { toast } from "sonner";

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
    qualification: "",  
    emergency_contact: {
      name: "",
      relationship: "",
      phone: "",
    },
  },
});
useEffect(() => {
  if (!id) return;

  const fetchData = async () => {
    try {
      const res = await receptionistsService.getReceptionistById(id);
      const data = res?.data || res;

      const staff = data?.staff_profiles || {};

      setForm({
        email: data.receptionist_email || "",
        phone: data.receptionist_phone || "",
        password: "",
        shift: data.shift || "",
        date_of_joining: staff.date_of_joining || "",
        is_active: data.is_active ?? true,

        staff: {
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          gender: staff.gender || "",
          dob: staff.dob?.split("T")[0] || "",
          address: staff.address || "",
          emergency_contact: staff.emergency_contact || {
            name: "",
            relationship: "",
            phone: "",
          },
        },
      });
    } catch {
      toast.error("Failed to load data");
    }
  };

  fetchData();
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
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.staff.first_name) {
    return toast.error("First name required");
  }

  if (!form.email) {
    return toast.error("Email required");
  }

  if (!form.password && !isEdit) {
    return toast.error("Password required");
  }
  if (!form.shift) {
    return toast.error("Shift required");
  }
  if (!form.staff.qualification) {
  return toast.error("Qualification required");
}
  // ✅ STEP 1: EXTRA VALIDATION
if (!form.staff.first_name || !form.staff.last_name) {
  return toast.error("Staff first & last name required");
}

  const payload = {
  receptionist_name: `${form.staff.first_name || ""} ${form.staff.last_name || ""}`.trim(),
  receptionist_email: form.email || "",
receptionist_phone: form.phone || "",
counter_no: "1", // keep string
shift: form.shift || "Morning", // fallback
is_active: form.is_active ?? true,

  staff: {
    first_name: form.staff.first_name,
    last_name: form.staff.last_name,
    gender: form.staff.gender || "Male",
    dob: form.staff.dob,
    address: form.staff.address,

  date_of_joining: form.date_of_joining
  ? new Date(form.date_of_joining).toISOString().split("T")[0]
  : null,

    emergency_contact: {
      name: form.staff.emergency_contact.name,
      relationship:
        form.staff.emergency_contact.relationship || "Friend",
      phone: form.staff.emergency_contact.phone,
    },
  },

 user: {
  password: form.password,
}
};
  console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

  try {
    if (isEdit) {
      await receptionistsService.updateReceptionist(id, payload);
      toast.success("Updated successfully");
    } else {
  const receptionistData = {
    receptionist_name: payload.receptionist_name,
    receptionist_email: payload.receptionist_email,
    receptionist_phone: payload.receptionist_phone,
    counter_no: payload.counter_no,
    shift: payload.shift,
    is_active: payload.is_active,
  };

  const staffData = {
    first_name: form.staff.first_name || "Default",
    last_name: form.staff.last_name || "User",
    gender: form.staff.gender || "Male",
    dob: form.staff.dob,
    address: form.staff.address,
     qualification: form.staff.qualification || "General", // ✅ ADD THIS
    date_of_joining: form.date_of_joining,

    emergency_contact: {
      name: form.staff.emergency_contact.name || "Test",
      relationship: form.staff.emergency_contact.relationship || "Friend",
      phone: form.staff.emergency_contact.phone || "9999999999",
    },
  };

console.log("FINAL SEND:", JSON.stringify({
  receptionistData,
  staffData,
  password: form.password,
}, null, 2));

await receptionistsService.createReceptionist({
  receptionist_name: receptionistData.receptionist_name,
  receptionist_email: receptionistData.receptionist_email,
  receptionist_phone: receptionistData.receptionist_phone,
  counter_no: receptionistData.counter_no,
  shift: receptionistData.shift,
  is_active: receptionistData.is_active,

  staff: staffData,

  user: {
    password: form.password,
  },
});
  toast.success("Created successfully");
}

    navigate("/receptionist");
  } catch (err) {
    console.error("ERROR:", err);
    toast.error(err?.response?.data?.message || "API Failed");
  }
};
const handleChange = (key, value) => {
  setForm({ ...form, [key]: value });
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
              value={form.staff.last_name}
              onChange={(e) => handleStaffChange("last_name", e.target.value)}
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

        <label>
          Address
          <Textarea
           value={form.staff.address}
onChange={(e) => handleStaffChange("address", e.target.value)}
          />
        </label>
        <label>
  Qualification *
  <Input
    value={form.staff.qualification}
    onChange={(e) => handleStaffChange("qualification", e.target.value)}
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
onChange={(e) => handleEmergencyChange("phone", e.target.value)}
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