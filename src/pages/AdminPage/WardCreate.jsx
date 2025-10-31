import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import wardsService from "../../service/wardsService.js";
import { Loader2 } from "lucide-react";

export default function WardCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    floor: "",
    is_active: true,
  });

  const isEdit = Boolean(id);

  // ✅ Fetch existing ward (Edit mode)
  useEffect(() => {
    if (!id) return;
    const fetchWard = async () => {
      setFetching(true);
      try {
        const res = await wardsService.getWardById(id);
        const ward = res?.data?.data || res?.data || res;
        setForm({
          name: ward.name || "",
          description: ward.description || "",
          floor: ward.floor || "",
          is_active: ward.is_active ?? true,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load ward");
      } finally {
        setFetching(false);
      }
    };
    fetchWard();
  }, [id]);

  // ✅ Validate inputs
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Ward name is required";
    else if (form.name.length < 2)
      newErrors.name = "Ward name must be at least 2 characters";

    if (!form.description.trim())
      newErrors.description = "Ward description is required";
    else if (form.description.length < 2)
      newErrors.description = "Description must be at least 2 characters";

    if (!form.floor.trim()) newErrors.floor = "Floor is required";
    else if (form.floor.length < 1)
      newErrors.floor = "Floor must be at least 1 character";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await wardsService.updateWard(id, form);
        toast.success("Ward updated successfully");
      } else {
        await wardsService.createWard(form);
        toast.success("Ward created successfully");
      }
      navigate("/ward");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Ward" : "Create Ward"}
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ward Name */}
          <div>
            <label className="text-sm font-medium">
              Ward Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter ward name"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Input
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter ward description"
              className="mt-1"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Floor */}
          <div>
            <label className="text-sm font-medium">
              Floor <span className="text-red-500">*</span>
            </label>
            <Input
              name="floor"
              value={form.floor}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, floor: e.target.value }))
              }
              placeholder="Enter floor number or name"
              className="mt-1"
            />
            {errors.floor && (
              <p className="text-xs text-red-500 mt-1">{errors.floor}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/ward")}
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
                ? "Update Ward"
                : "Create Ward"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
