// src/pages/categories/CategoryCreate.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import categoryService from "../../service/categoryService.js";

export default function CategoryCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false); // submit
  const [fetching, setFetching] = useState(false); // initial fetch
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    category_name: "",
    description: "",
    is_active: true,
  });

  // Fetch existing category when editing
  useEffect(() => {
    if (!isEdit) return;

    const fetchCategory = async () => {
      setFetching(true);
      try {
        const res = await categoryService.getById(id);
        const data = res?.data?.data ?? res?.data ?? res ?? {};
        setForm({
          category_name: data.category_name ?? data.name ?? "",
          description: data.description ?? "",
          is_active: data.is_active ?? true,
        });
      } catch (err) {
        console.error("Fetch category error:", err);
        toast.error(err?.response?.data?.message || "Failed to load category details");
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [id, isEdit]);

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.category_name || !form.category_name.trim()) {
      newErrors.category_name = "Category name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category_name: form.category_name.trim(),
        description: form.description?.trim() || "",
        is_active: form.is_active,
      };

      if (isEdit) {
        if (categoryService.update) {
          await categoryService.update(id, payload);
        } else if (categoryService.updateCategory) {
          await categoryService.updateCategory(id, payload);
        } else {
          throw new Error("Update method not found on categoryService");
        }
        toast.success("Category updated successfully");
      } else {
        if (categoryService.create) {
          await categoryService.create(payload);
        } else if (categoryService.createCategory) {
          await categoryService.createCategory(payload);
        } else {
          throw new Error("Create method not found on categoryService");
        }
        toast.success("Category created successfully");
      }

      navigate("/category");
    } catch (err) {
      console.error("Submit error:", err);
      // If server returns field-level errors try to show them
      const serverData = err?.response?.data;
      if (serverData && typeof serverData === "object") {
        // generic message first
        if (serverData.message) toast.error(serverData.message);
        // check structured errors
        if (serverData.errors && typeof serverData.errors === "object") {
          setErrors((prev) => ({ ...prev, ...serverData.errors }));
        }
      } else {
        toast.error("Operation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Category" : "Create Category"}
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border">
          {/* Category Name */}
          <div>
            <label className="text-sm font-medium">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.category_name}
              onChange={(e) => handleChange("category_name", e.target.value)}
              placeholder="e.g. Cardiology Supplies"
              className="mt-1"
            />
            {errors.category_name && <p className="text-xs text-red-500 mt-1">{errors.category_name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Short description for internal use (optional)"
              rows={5}
              className="mt-1 w-full resize-y px-3 py-2 border rounded-md text-sm"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">{(form.description || "").length} characters</p>
              <p className="text-xs text-gray-500">Displayed across product listings</p>
            </div>
          </div>


          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-5">
            <Button type="button" variant="outline" onClick={() => navigate("/category")}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0E1680] text-white" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
