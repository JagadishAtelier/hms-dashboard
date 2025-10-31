import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import admissionsService from "../../service/addmissionsService.js";

export default function DischargedPatients({ admissionId, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    discharge_datetime: "",
    discharge_reason: "",
    final_diagnosis: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Automatically set full ISO datetime when component mounts
  useEffect(() => {
    const now = new Date().toISOString(); // full ISO format (e.g., 2025-10-30T11:45:23.123Z)
    setForm((prev) => ({ ...prev, discharge_datetime: now }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.discharge_reason || form.discharge_reason.length < 3)
      newErrors.discharge_reason = "Reason must have at least 3 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        status: "discharged",
      };

      const res = await admissionsService.dischargeAdmission(admissionId, payload);
      toast.success("Patient discharged successfully!");
      if (onSuccess) onSuccess(res);
    } catch (err) {
      console.error("Discharge error:", err);
      toast.error(err?.response?.data?.message || "Failed to discharge patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-2">
        Discharge Patient
      </h2>

      {/* Discharge Reason */}
      <div>
        <label className="text-sm font-medium">
          Discharge Reason <span className="text-red-500">*</span>
        </label>
        <Textarea
          name="discharge_reason"
          value={form.discharge_reason}
          onChange={handleChange}
          placeholder="Enter reason for discharge"
          className="mt-1"
        />
        {errors.discharge_reason && (
          <p className="text-xs text-red-500 mt-1">{errors.discharge_reason}</p>
        )}
      </div>

      {/* Final Diagnosis (optional) */}
      <div>
        <label className="text-sm font-medium">Final Diagnosis (optional)</label>
        <Textarea
          name="final_diagnosis"
          value={form.final_diagnosis}
          onChange={handleChange}
          placeholder="Enter final diagnosis"
          className="mt-1"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="bg-[#0E1680] text-white"
          disabled={loading}
        >
          {loading ? "Discharging..." : "Discharge"}
        </Button>
      </div>
    </form>
  );
}
