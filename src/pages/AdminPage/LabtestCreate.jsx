import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import labtestService from "../../service/labtestService.js";

export default function LabtestCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "",
    method: "",
    units: "",
    reference_range: "",
    turnaround_time: "",
    is_active: true,
  });

  // ✅ Fetch existing lab test (edit mode)
  useEffect(() => {
    if (!isEdit) return;
    const fetchLabtest = async () => {
      setFetching(true);
      try {
        const res = await labtestService.getLabTestById(id);
        const data = res?.data?.data || res?.data || res;
        setForm({
          name: data.name || "",
          code: data.code || "",
          category: data.category || "",
          method: data.method || "",
          units: data.units || "",
          reference_range: data.reference_range || "",
          turnaround_time: data.turnaround_time || "",
          is_active: data.is_active ?? true,
        });
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Failed to load lab test details");
      } finally {
        setFetching(false);
      }
    };
    fetchLabtest();
  }, [id, isEdit]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Lab test name is required";
    if (!form.code.trim()) newErrors.code = "Lab test code is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.method.trim()) newErrors.method = "Method is required";
    if (!form.units.trim()) newErrors.units = "Units are required";
    if (!form.reference_range.trim()) newErrors.reference_range = "Reference range is required";
    if (!form.turnaround_time.trim()) newErrors.turnaround_time = "Turnaround time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await labtestService.updateLabTest(id, form);
        toast.success("Lab test updated successfully");
      } else {
        await labtestService.createLabTest(form);
        toast.success("Lab test created successfully");
      }
      navigate("/labtest");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Input handler
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Lab Test" : "Create Lab Test"}
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border">
          {/* Lab Test Name */}
          <div>
            <label className="text-sm font-medium">
              Lab Test Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Blood Glucose"
              className="mt-1"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Code */}
          <div>
            <label className="text-sm font-medium">
              Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="e.g. BG101"
              className="mt-1"
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="e.g. Biochemistry"
              className="mt-1"
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Method */}
          <div>
            <label className="text-sm font-medium">
              Method <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.method}
              onChange={(e) => handleChange("method", e.target.value)}
              placeholder="e.g. Colorimetric"
              className="mt-1"
            />
            {errors.method && <p className="text-xs text-red-500 mt-1">{errors.method}</p>}
          </div>

          {/* Units */}
          <div>
            <label className="text-sm font-medium">
              Units <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.units}
              onChange={(e) => handleChange("units", e.target.value)}
              placeholder="e.g. mg/dL"
              className="mt-1"
            />
            {errors.units && <p className="text-xs text-red-500 mt-1">{errors.units}</p>}
          </div>

          {/* Reference Range */}
          <div>
            <label className="text-sm font-medium">
              Reference Range <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.reference_range}
              onChange={(e) => handleChange("reference_range", e.target.value)}
              placeholder="e.g. 70 - 110 mg/dL"
              className="mt-1"
            />
            {errors.reference_range && (
              <p className="text-xs text-red-500 mt-1">{errors.reference_range}</p>
            )}
          </div>

          {/* Turnaround Time */}
          <div>
            <label className="text-sm font-medium">
              Turnaround Time <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.turnaround_time}
              onChange={(e) => handleChange("turnaround_time", e.target.value)}
              placeholder="e.g. 2 hours"
              className="mt-1"
            />
            {errors.turnaround_time && (
              <p className="text-xs text-red-500 mt-1">{errors.turnaround_time}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-5">
            <Button type="button" variant="outline" onClick={() => navigate("/labtest")}>
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
                ? "Update Lab Test"
                : "Create Lab Test"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
