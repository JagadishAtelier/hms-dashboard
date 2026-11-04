// src/pages/products/ProductCreate.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Pill, PackageCheck, AlertCircle } from "lucide-react";
import categoryService from "../../service/categoryService";
import subcategoryService from "../../service/subcategoryService";
import productService from "../../service/productService";
import clinicalMasterService from "../../service/clinicalMasterService";

export default function ProductCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [dosageUnits, setDosageUnits] = useState([]);
  const [errors, setErrors] = useState({});
  const [descCount, setDescCount] = useState(0);

  const [form, setForm] = useState({
    category_id: "",
    subcategory_id: "",
    product_name: "",
    brand: "",
    unit: "Tablets",
    size: "",
    purchase_price: "",
    selling_price: "",
    tax_percentage: "",
    min_quantity: 10,
    max_quantity: 500,
    description: "",
    status: "active",
  });

  const parseList = (res) => {
    const top = res?.data?.data ?? res?.data ?? res;
    return Array.isArray(top) ? top : [];
  };

  // Load categories and dosage forms
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, units] = await Promise.all([
          categoryService.getAll({ limit: 100 }),
          clinicalMasterService.getMastersByCategory("DOSAGE_FORM"),
        ]);
        setCategories(parseList(catRes));
        setDosageUnits(units);
      } catch (err) {
        console.error("Failed to load initial pharmacy data", err);
      }
    };
    fetchInitialData();
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
          unit: p.unit || "Tablets",
          size: p.size || "",
          purchase_price: p.purchase_price ?? "",
          selling_price: p.selling_price ?? "",
          tax_percentage: p.tax_percentage ?? "",
          min_quantity: p.min_quantity ?? 10,
          max_quantity: p.max_quantity ?? 500,
          description: p.description || "",
          status: p.status || "active",
        });
        setDescCount(p.description ? p.description.length : 0);
      } catch (err) {
        console.error("Failed to fetch product", err);
        toast.error("Failed to fetch product details");
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "description") setDescCount(value.length);
  };

  const validate = () => {
    const err = {};
    if (!form.category_id) err.category_id = "Category is required";
    if (!form.product_name.trim()) err.product_name = "Product name is required";
    if (!form.unit) err.unit = "Dosage form / unit is required";
    if (!form.selling_price || Number(form.selling_price) <= 0)
      err.selling_price = "Valid selling price is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix form errors");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : 0,
        selling_price: Number(form.selling_price),
        tax_percentage: form.tax_percentage ? Number(form.tax_percentage) : 0,
        min_quantity: Number(form.min_quantity) || 1,
        max_quantity: Number(form.max_quantity) || 0,
        sub_category_id: form.subcategory_id || undefined,
      };

      if (isEdit) {
        await productService.update(id, payload);
        toast.success("Medicine catalog updated successfully");
      } else {
        await productService.create(payload);
        toast.success("Medicine created successfully");
      }
      navigate("/products");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel = (c) => c?.name || c?.category_name || "Unnamed Category";
  const subcategoryLabel = (s) => s?.name || s?.subcategory_name || "Unnamed Subcategory";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0E1680] flex items-center gap-2">
            <Pill className="text-[#0E1680]" size={24} />
            {isEdit ? "Edit Medicine / Product" : "New Medicine & Pharmacy Catalog"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardized pharmaceutical dosage units, dispensary packaging, and inventory reorder levels
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Back to Inventory
        </Button>
      </div>

      <Card className="p-6 border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category & Subcategory Radix-UI Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Medicine Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.category_id || ""}
                onValueChange={(val) => handleChange("category_id", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {categories.map((cat) => {
                    const val = String(cat.id ?? cat.uuid ?? cat._id);
                    return (
                      <SelectItem key={val} value={val}>
                        {categoryLabel(cat)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Subcategory
              </label>
              <Select
                value={form.subcategory_id || ""}
                onValueChange={(val) => handleChange("subcategory_id", val)}
                disabled={subcategories.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={subcategories.length === 0 ? "No Subcategories Available" : "Select Subcategory"} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {subcategories.map((sub) => {
                    const val = String(sub.id ?? sub.uuid ?? sub._id);
                    return (
                      <SelectItem key={val} value={val}>
                        {subcategoryLabel(sub)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Name & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Medicine Generic / Commercial Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.product_name}
                onChange={(e) => handleChange("product_name", e.target.value)}
                placeholder="e.g. Paracetamol 500mg"
              />
              {errors.product_name && <p className="text-xs text-red-500 mt-1">{errors.product_name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Manufacturer / Brand
              </label>
              <Input
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                placeholder="e.g. Cipla / Sun Pharma"
              />
            </div>
          </div>

          {/* Dosage Form / Unit Radix-UI Select & Tax */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Dosage Form / Packaging Unit <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.unit || "Tablets"}
                onValueChange={(val) => handleChange("unit", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Dosage Form" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {dosageUnits.map((du) => (
                    <SelectItem key={du.code || du.display_label} value={du.display_label}>
                      {du.display_label}
                    </SelectItem>
                  ))}
                  {/* Fallback for custom units */}
                  {form.unit && !dosageUnits.some((du) => du.display_label === form.unit) && (
                    <SelectItem value={form.unit}>{form.unit}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Strength / Pack Size
              </label>
              <Input
                value={form.size}
                onChange={(e) => handleChange("size", e.target.value)}
                placeholder="e.g. 10x10 Strips / 100ml"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                GST / Tax %
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.tax_percentage}
                onChange={(e) => handleChange("tax_percentage", e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
          </div>

          {/* Pricing Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Purchase / Cost Price (Rs.)
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.purchase_price}
                onChange={(e) => handleChange("purchase_price", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Retail / Selling Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.selling_price}
                onChange={(e) => handleChange("selling_price", e.target.value)}
                placeholder="0.00"
              />
              {errors.selling_price && <p className="text-xs text-red-500 mt-1">{errors.selling_price}</p>}
            </div>
          </div>

          {/* Quantity Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Minimum Reorder Level (Low Stock Alert)
              </label>
              <Input
                type="number"
                value={form.min_quantity}
                onChange={(e) => handleChange("min_quantity", e.target.value)}
                placeholder="10"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Maximum Buffer Capacity
              </label>
              <Input
                type="number"
                value={form.max_quantity}
                onChange={(e) => handleChange("max_quantity", e.target.value)}
                placeholder="500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Indications & Storage Description ({descCount}/500)
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Dosage guidelines, therapeutic class, temperature storage conditions (e.g. Store below 25°C)"
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              type="submit"
              disabled={loading || fetching}
              className="bg-[#0E1680] hover:bg-[#0b1163] text-white font-semibold cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {isEdit ? "Update Pharmacy Record" : "Save Medicine to Catalog"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
