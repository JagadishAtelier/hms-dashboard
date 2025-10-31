import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import designationService from "../../service/designationService.js";

export default function DesignationCreate() {
  const navigate = useNavigate();
  const { id } = useParams(); // for edit mode
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    is_active: true,
  });

  const isEdit = Boolean(id);

  // ✅ Fetch designation details when editing
  useEffect(() => {
    if (!id) return;

    const fetchDesignation = async () => {
      setFetching(true);
      try {
        const res = await designationService.getDesignationById(id);
        const data = res?.data?.data || res?.data || res;
        setForm({
          title: data.title || "",
          description: data.description || "",
          is_active: data.is_active ?? true,
        });
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Failed to load designation");
      } finally {
        setFetching(false);
      }
    };

    fetchDesignation();
  }, [id]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Designation title is required";
    if (form.title.length < 2)
      newErrors.title = "Title must be at least 2 characters";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (form.description.length < 2)
      newErrors.description = "Description must be at least 2 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await designationService.updateDesignation(id, form);
        toast.success("Designation updated successfully");
      } else {
        await designationService.createDesignation(form);
        toast.success("Designation created successfully");
      }
      navigate("/designation");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Designation" : "Create Designation"}
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium">
              Designation Title <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter designation title (e.g., HOD, Nurse)"
              className="mt-1"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Enter brief description of this designation"
              className="mt-1"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/designation")}
            >
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
                ? "Update Designation"
                : "Create Designation"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
