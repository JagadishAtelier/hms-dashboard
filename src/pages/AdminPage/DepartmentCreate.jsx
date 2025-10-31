import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import departmentService from "../../service/departmentService.js";
import { Loader2 } from "lucide-react";

export default function DepartmentCreate() {
  const navigate = useNavigate();
  const { id } = useParams(); // if id exists → edit mode
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    code: "",
    is_active: true,
  });

  const isEdit = Boolean(id);

  // ✅ Fetch department for edit mode
  useEffect(() => {
    if (!id) return;
    const fetchDepartment = async () => {
      setFetching(true);
      try {
        const res = await departmentService.getDepartmentById(id);
        const dept = res?.data?.data || res?.data || res;
        setForm({
          name: dept.name || "",
          code: dept.code || "",
          is_active: dept.is_active ?? true,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load department");
      } finally {
        setFetching(false);
      }
    };
    fetchDepartment();
  }, [id]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Department name is required";
    if (form.name.length < 2) newErrors.name = "Must be at least 2 characters";
    if (!form.code.trim()) newErrors.code = "Department code is required";
    if (form.code.length < 2) newErrors.code = "Code must be at least 2 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await departmentService.updateDepartment(id, form);
        toast.success("Department updated successfully");
      } else {
        await departmentService.createDepartment(form);
        toast.success("Department created successfully");
      }
      navigate("/department");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Form Render
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Department" : "Create Department"}
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Name */}
          <div>
            <label className="text-sm font-medium">
              Department Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter department name"
              className="mt-1"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Department Code */}
          <div>
            <label className="text-sm font-medium">
              Department Code <span className="text-red-500">*</span>
            </label>
            <Input
              name="code"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="Enter code (e.g., CARD, ORTHO)"
              className="mt-1"
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/department")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0E1680] text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Update Department" : "Create Department"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
