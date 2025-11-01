import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import vendorService from "../../service/vendorService";

export default function VendorCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    gst_number: "",
  });

  // Fetch vendor when editing
  useEffect(() => {
    if (!isEdit) return;
    const fetchVendor = async () => {
      setFetching(true);
      try {
        const res = await vendorService.getById(id);
        const v = res?.data?.data ?? res?.data ?? res ?? {};
        setForm({
          name: v.name || "",
          contact_person: v.contact_person || "",
          email: v.email || "",
          phone: v.phone || "",
          address: v.address || "",
          gst_number: v.gst_number || "",
        });
      } catch (err) {
        console.error("Error fetching vendor:", err);
        toast.error("Failed to load vendor details");
      } finally {
        setFetching(false);
      }
    };
    fetchVendor();
  }, [id]);

  // Handle input changes
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Simple email validator
  const isValidEmail = (email) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.contact_person.trim()) newErrors.contact_person = "Contact person is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.gst_number.trim()) newErrors.gst_number = "GST number is required";
    if (form.email && !isValidEmail(form.email)) newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      );

      if (!payload.email) delete payload.email;

      if (isEdit) {
        await vendorService.update(id, payload);
        toast.success("Vendor updated successfully");
      } else {
        await vendorService.create(payload);
        toast.success("Vendor created successfully");
      }

      navigate("/vendor");
    } catch (err) {
      console.error("Error saving vendor:", err);
      const resp = err?.response?.data;
      if (resp?.error && Array.isArray(resp.error)) {
        const fieldErrs = {};
        resp.error.forEach((e) => {
          const path = Array.isArray(e.path) ? e.path[0] : e.path;
          if (path) fieldErrs[path] = e.message;
          toast.error(e.message || "Validation error");
        });
        setErrors(fieldErrs);
      } else {
        toast.error(resp?.message || "Failed to save vendor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Vendor" : "Create Vendor"}
      </h2>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Contact Person */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Name</label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter vendor name"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Person</label>
              <Input
                value={form.contact_person}
                onChange={(e) => handleChange("contact_person", e.target.value)}
                placeholder="Enter contact person"
              />
              {errors.contact_person && (
                <p className="text-red-500 text-sm">{errors.contact_person}</p>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email (Optional)</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email (optional)"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
          </div>

          {/* Address & GST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Textarea
                rows={2}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter address"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GST Number</label>
              <Input
                value={form.gst_number}
                onChange={(e) => handleChange("gst_number", e.target.value)}
                placeholder="Enter GST number"
              />
              {errors.gst_number && (
                <p className="text-red-500 text-sm">{errors.gst_number}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || fetching}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {isEdit ? "Update Vendor" : "Create Vendor"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
