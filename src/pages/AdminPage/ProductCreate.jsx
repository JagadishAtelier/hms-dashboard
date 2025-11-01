// src/pages/products/ProductCreate.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import categoryService from "../../service/categoryService";
import subcategoryService from "../../service/subcategoryService";
import productService from "../../service/productService";

export default function ProductCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [descCount, setDescCount] = useState(0);

  const [form, setForm] = useState({
    category_id: "",
    subcategory_id: "",
    product_name: "",
    brand: "",
    unit: "",
    size: "",
    purchase_price: "",
    selling_price: "",
    tax_percentage: "",
    min_quantity: 1,
    max_quantity: 0,
    description: "",
    status: "active",
  });

  // Helpers
  const parseList = (res) => {
    const top = res?.data?.data ?? res?.data ?? res;
    return Array.isArray(top) ? top : [];
  };

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll({ limit: 100 });
        setCategories(parseList(res));
      } catch (err) {
        console.error("Failed to load categories", err);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories based on category
  useEffect(() => {
    if (!form.category_id) {
      setSubcategories([]);
      return;
    }
    const fetchSubcats = async () => {
      try {
        const res = await subcategoryService.getByCategory(form.category_id);
        setSubcategories(parseList(res));
      } catch (err) {
        console.error("Failed to load subcategories", err);
        toast.error("Failed to load subcategories");
      }
    };
    fetchSubcats();
  }, [form.category_id]);

  // Fetch product if editing
  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      setFetching(true);
      try {
        const res = await productService.getById(id);
        const p = res?.data?.data ?? res?.data ?? res ?? {};
        setForm({
          category_id: String(p.category_id || ""),
          subcategory_id: String(p.sub_category_id || ""),
          product_name: p.product_name || "",
          brand: p.brand || "",
          unit: p.unit || "",
          size: p.size || "",
          purchase_price: p.purchase_price ?? "",
          selling_price: p.selling_price ?? "",
          tax_percentage: p.tax_percentage ?? "",
          min_quantity: p.min_quantity ?? 1,
          max_quantity: p.max_quantity ?? 0,
          description: p.description || "",
          status: p.status || "active",
        });
        setDescCount((p.description || "").length);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        toast.error("Failed to load product");
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Handle field changes
  const handleChange = (field, value) => {
    if (field === "min_quantity" || field === "max_quantity") {
      const val = Number(value) || 0;
      setForm((prev) => ({
        ...prev,
        [field]: val,
        ...(field === "min_quantity" && prev.max_quantity < val
          ? { max_quantity: val }
          : {}),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "description") setDescCount((value || "").length);
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.category_id) newErrors.category_id = "Please select a category";
    if (!form.subcategory_id)
      newErrors.subcategory_id = "Please select a subcategory";
    if (!form.product_name.trim())
      newErrors.product_name = "Product name is required";
    if (form.purchase_price < 0)
      newErrors.purchase_price = "Price must be >= 0";
    if (form.selling_price < 0)
      newErrors.selling_price = "Price must be >= 0";
    if (form.min_quantity < 0)
      newErrors.min_quantity = "Minimum quantity cannot be negative";
    if (form.max_quantity < 0)
      newErrors.max_quantity = "Maximum quantity cannot be negative";
    if (Number(form.max_quantity) < Number(form.min_quantity))
      newErrors.max_quantity = "Maximum quantity must be ≥ minimum quantity";
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
      const payload = {
        category_id: String(form.category_id),
        sub_category_id: String(form.subcategory_id), // ✅ renamed key
        product_name: form.product_name.trim(),
        brand: form.brand.trim(),
        unit: form.unit.trim(),
        size: form.size.trim(),
        purchase_price: Number(form.purchase_price) || 0,
        selling_price: Number(form.selling_price) || 0,
        tax_percentage: Number(form.tax_percentage) || 0,
        min_quantity: Number(form.min_quantity) || 1,
        max_quantity: Number(form.max_quantity) || 0,
        description: form.description.trim(),
        status: form.status || "active",
      };

      if (isEdit) {
        await productService.update(id, payload);
        toast.success("Product updated successfully");
      } else {
        await productService.create(payload);
        toast.success("Product created successfully");
      }
      navigate("/product");
    } catch (err) {
      console.error("Submit error:", err);
      const resp = err?.response?.data;
      if (resp?.error && Array.isArray(resp.error)) {
        const fieldErrs = {};
        resp.error.forEach((e) => {
          const path = Array.isArray(e.path) ? e.path[0] : e.path;
          if (path) fieldErrs[path] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrs }));
        resp.error.forEach((e) => toast.error(e.message || JSON.stringify(e)));
      } else {
        toast.error(resp?.message || "Failed to save product");
      }
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel = (c) => c.category_name ?? c.name ?? "Unnamed category";
  const subcategoryLabel = (s) =>
    s.subcategory_name ?? s.name ?? "Unnamed subcategory";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => handleChange("category_id", e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option
                  key={cat.id ?? cat.uuid ?? cat._id}
                  value={cat.id ?? cat.uuid ?? cat._id}
                >
                  {categoryLabel(cat)}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-sm">{errors.category_id}</p>
            )}
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium mb-1">Subcategory</label>
            <select
              value={form.subcategory_id}
              onChange={(e) => handleChange("subcategory_id", e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select subcategory</option>
              {subcategories.map((sub) => (
                <option
                  key={sub.id ?? sub.uuid ?? sub._id}
                  value={sub.id ?? sub.uuid ?? sub._id}
                >
                  {subcategoryLabel(sub)}
                </option>
              ))}
            </select>
            {errors.subcategory_id && (
              <p className="text-red-500 text-sm">{errors.subcategory_id}</p>
            )}
          </div>

          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <Input
                value={form.product_name}
                onChange={(e) =>
                  handleChange("product_name", e.target.value)
                }
                placeholder="Enter product name"
              />
              {errors.product_name && (
                <p className="text-red-500 text-sm">{errors.product_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <Input
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                placeholder="Enter brand"
              />
            </div>
          </div>

          {/* Quantity Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Quantity
              </label>
              <Input
                type="number"
                value={form.min_quantity}
                onChange={(e) => handleChange("min_quantity", e.target.value)}
              />
              {errors.min_quantity && (
                <p className="text-red-500 text-sm">{errors.min_quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Maximum Quantity
              </label>
              <Input
                type="number"
                value={form.max_quantity}
                onChange={(e) => handleChange("max_quantity", e.target.value)}
              />
              {errors.max_quantity && (
                <p className="text-red-500 text-sm">{errors.max_quantity}</p>
              )}
            </div>
          </div>

          {/* Unit, Tax, etc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <Input
                value={form.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                placeholder="e.g., pcs, kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tax %</label>
              <Input
                type="number"
                value={form.tax_percentage}
                onChange={(e) =>
                  handleChange("tax_percentage", e.target.value)
                }
              />
            </div>
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Purchase Price
              </label>
              <Input
                type="number"
                value={form.purchase_price}
                onChange={(e) =>
                  handleChange("purchase_price", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Selling Price
              </label>
              <Input
                type="number"
                value={form.selling_price}
                onChange={(e) =>
                  handleChange("selling_price", e.target.value)
                }
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description ({descCount}/500)
            </label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              placeholder="Enter product description"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || fetching}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
