import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
// import accountantsService from "../../service/accountantsService.js";
// import departmentService from "../../service/departmentService.js";
// import designationService from "../../service/designationService.js";
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
    accountant_name: "",
    accountant_email: "",
    accountant_phone: "",
    ledger_code: "",
    is_active: true,

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

  // ✅ ADD THIS
  emergency_contact: {
    name: "",
    relationship: "",
    phone: "",
  },
},
  });

  // ✅ Fetch dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          departmentService.getAllDepartments(),
          designationService.getAllDesignations(),
        ]);

        setDepartments(deptRes?.data?.data || []);
        setDesignations(desigRes?.data?.data || []);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdowns();
  }, []);

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
  ...form,
  staff: {
    ...form.staff,

    // ✅ MUST SEND THIS
    emergency_contact: form.staff.emergency_contact || {
      name: "N/A",
      relationship: "N/A",
      phone: "0000000000",
    },
  },
  user: { password: form.user.password },
};

    setLoading(true);
    try {
      if (isEdit) {
        await accountantsService.updateAccountant(id, payload);
        toast.success("Updated successfully");
      } else {
        await accountantsService.createAccountant(payload);
        toast.success("Created successfully");
      }
      navigate("/accountant");
    } catch {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStaffChange = (key, value) =>
    setForm({ ...form, staff: { ...form.staff, [key]: value } });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Accountant" : "Create Accountant"}
      </h2>

      {fetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow"
        >
          {/* 👤 PERSONAL */}
          <h3 className="text-lg font-semibold border-b pb-2">
            Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={form.staff.first_name}
              onChange={(e) =>
                handleStaffChange("first_name", e.target.value)
              }
            />

            <Input
              placeholder="Last Name"
              value={form.staff.last_name}
              onChange={(e) =>
                handleStaffChange("last_name", e.target.value)
              }
            />

            <select
              className="border p-2 rounded"
              value={form.staff.gender}
              onChange={(e) =>
                handleStaffChange("gender", e.target.value)
              }
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <Input
              type="date"
              value={form.staff.dob}
              onChange={(e) =>
                handleStaffChange("dob", e.target.value)
              }
            />
          </div>

          <Textarea
            placeholder="Address"
            value={form.staff.address}
            onChange={(e) =>
              handleStaffChange("address", e.target.value)
            }
          />

          {/* 💼 PROFESSIONAL */}
          <h3 className="text-lg font-semibold border-b pb-2">
            Professional Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <select
              className="border p-2 rounded"
              value={form.staff.department_id}
              onChange={(e) =>
                handleStaffChange("department_id", e.target.value)
              }
            >
              <option value="">Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              className="border p-2 rounded"
              value={form.staff.designation_id}
              onChange={(e) =>
                handleStaffChange("designation_id", e.target.value)
              }
            >
              <option value="">Designation</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>

            <Input
              type="date"
              value={form.staff.date_of_joining}
              onChange={(e) =>
                handleStaffChange("date_of_joining", e.target.value)
              }
            />

            <Input
              placeholder="Qualification"
              value={form.staff.qualification}
              onChange={(e) =>
                handleStaffChange("qualification", e.target.value)
              }
            />
          </div>

          {/* 🧾 ACCOUNTANT INFO */}
          <h3 className="text-lg font-semibold border-b pb-2">
            Accountant Info
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Accountant Name"
              value={form.accountant_name}
              onChange={(e) =>
                setForm({ ...form, accountant_name: e.target.value })
              }
            />

            <Input
              placeholder="Ledger Code"
              value={form.ledger_code}
              onChange={(e) =>
                setForm({ ...form, ledger_code: e.target.value })
              }
            />
          </div>

          {/* 🔐 ACCOUNT */}
          <h3 className="text-lg font-semibold border-b pb-2">
            Account Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Email"
              value={form.accountant_email}
              onChange={(e) =>
                setForm({ ...form, accountant_email: e.target.value })
              }
            />

            <Input
              placeholder="Phone"
              value={form.accountant_phone}
              onChange={(e) =>
                setForm({ ...form, accountant_phone: e.target.value })
              }
            />

            {!isEdit && (
              <Input
                type="password"
                placeholder="Password"
                value={form.user.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    user: { password: e.target.value },
                  })
                }
              />
            )}
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(val) =>
                setForm({ ...form, is_active: val })
              }
            />
            <span>Active</span>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/accountant")}
            >
              Cancel
            </Button>

            <Button className="bg-[#0E1680] text-white">
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}