// src/pages/subcategories/SubCategoryCreate.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import categoryService from "../../service/categoryService.js";
import subcategoryService from "../../service/subcategoryService.js";

export default function SubCategoryCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false); // submit
  const [fetching, setFetching] = useState(false); // initial fetch for subcategory
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [descCount, setDescCount] = useState(0);

  // Category search & dropdown state
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryResults, setCategoryResults] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const boxRef = useRef(null);

  const [form, setForm] = useState({
    category_id: "",
    subcategory_name: "",
    description: "",
    status: "active",
  });

  // parse responses robustly
  const parseList = (res) => {
    const top = res?.data?.data ?? res?.data ?? res;
    if (Array.isArray(top)) return top;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  // initial fetch: load some categories (for suggestions) and, if edit, load subcategory
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoadingCategories(true);
        // try to fetch a small list first
        const resp =
          (categoryService.getAll && (await categoryService.getAll({ limit: 50 }))) ||
          (categoryService.getAllCategories && (await categoryService.getAllCategories({ limit: 50 }))) ||
          (await categoryService.getAll?.({ limit: 50 }));
        const arr = parseList(resp);
        setCategories(Array.isArray(arr) ? arr : []);
        setCategoryResults(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    loadInitial();
  }, []);

  // fetch subcategory when editing
  useEffect(() => {
    if (!isEdit) return;
    const fetchSubcategory = async () => {
      setFetching(true);
      try {
        const res =
          (subcategoryService.getById && (await subcategoryService.getById(id))) ||
          (subcategoryService.getSubcategoryById && (await subcategoryService.getSubcategoryById(id))) ||
          (await subcategoryService.getById?.(id));
        const s = res?.data?.data ?? res?.data ?? res ?? {};

        const catId =
          s.category_id ??
          (s.category ? (s.category.uuid ?? s.category._id ?? s.category.id) : "") ??
          "";

        setForm((prev) => ({
          ...prev,
          category_id: String(catId || ""),
          subcategory_name: s.subcategory_name || "",
          description: s.description || "",
          status: s.status || "active",
        }));

        setSelectedCategory(
          s.category
            ? s.category
            : categories.find((c) => String(c.uuid ?? c._id ?? c.id ?? "") === String(catId)) ??
              (catId ? { id: catId, category_name: s.category_name || "Selected category" } : null)
        );
        setDescCount((s.description || "").length);
      } catch (err) {
        console.error("Failed to fetch subcategory:", err);
        toast.error(err?.response?.data?.message || "Failed to load subcategory");
      } finally {
        setFetching(false);
      }
    };

    fetchSubcategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowCategoryList(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // debounce category search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchCategoryResults(categoryQuery.trim());
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryQuery]);

  const fetchCategoryResults = async (q = "") => {
    try {
      setLoadingCategories(true);
      // pass search param if service supports it
      const params = q ? { search: q, limit: 50 } : { limit: 50 };
      const resp =
        (categoryService.getAll && (await categoryService.getAll(params))) ||
        (categoryService.getAllCategories && (await categoryService.getAllCategories(params))) ||
        (await categoryService.getAll?.(params));
      const arr = parseList(resp);
      setCategoryResults(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error("Category search error:", err);
      toast.error("Failed to search categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectCategory = (cat) => {
    const catId = String(cat.uuid ?? cat._id ?? cat.id ?? "");
    setSelectedCategory(cat);
    setForm((prev) => ({ ...prev, category_id: catId }));
    setErrors((prev) => ({ ...prev, category_id: undefined }));
    setShowCategoryList(false);
    setCategoryQuery("");
  };

  const clearSelectedCategory = () => {
    setSelectedCategory(null);
    setForm((prev) => ({ ...prev, category_id: "" }));
    setErrors((prev) => ({ ...prev, category_id: undefined }));
  };

  // Input handlers
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "description") setDescCount((value || "").length);
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.category_id) newErrors.category_id = "Please select a category";
    if (!form.subcategory_name || !form.subcategory_name.trim()) newErrors.subcategory_name = "Subcategory name is required";
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
        category_id: String(form.category_id || ""),
        subcategory_name: (form.subcategory_name || "").trim(),
        description: (form.description || "").trim(),
        status: form.status || "active",
      };

      if (isEdit) {
        if (subcategoryService.update) await subcategoryService.update(id, payload);
        else if (subcategoryService.updateSubcategory) await subcategoryService.updateSubcategory(id, payload);
        else throw new Error("Update method not found on subcategoryService");
        toast.success("Subcategory updated successfully");
      } else {
        if (subcategoryService.create) await subcategoryService.create(payload);
        else if (subcategoryService.createSubcategory) await subcategoryService.createSubcategory(payload);
        else throw new Error("Create method not found on subcategoryService");
        toast.success("Subcategory created successfully");
      }

      navigate("/subcategory");
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
        toast.error(resp?.message || "Operation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // prepare readable label for a category
  const categoryLabel = (c) => c?.category_name ?? c?.name ?? "Unnamed category";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Subcategory" : "Create Subcategory"}
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CATEGORY SEARCH + SELECT (Admissions-like) */}
          <div ref={boxRef} className="relative">
            <label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>

            {selectedCategory ? (
              <div className="flex justify-between items-center border p-3 rounded mt-1 bg-white">
                <div>
                  <div className="font-medium text-sm">{categoryLabel(selectedCategory)}</div>
                  <div className="text-xs text-gray-600">{selectedCategory.description || "Medical / Pharmacy category"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={clearSelectedCategory} className="text-xs">
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Input
                  placeholder={loadingCategories ? "Loading categories..." : "Search categories (e.g., Cardiology, Pharmacy, Sutures)"}
                  value={categoryQuery}
                  onChange={(e) => {
                    setCategoryQuery(e.target.value);
                    setShowCategoryList(true);
                  }}
                  onFocus={() => {
                    setShowCategoryList(true);
                    // if no results loaded, fetch initial
                    if (!categoryResults.length && !loadingCategories) fetchCategoryResults("");
                  }}
                  className="mt-1"
                  aria-label="Search categories"
                />

                {showCategoryList && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
                    {loadingCategories ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin" size={18} />
                      </div>
                    ) : categoryResults.length > 0 ? (
                      categoryResults.map((c) => {
                        const cid = String(c.uuid ?? c._id ?? c.id ?? "");
                        return (
                          <button
                            key={cid || Math.random()}
                            type="button"
                            onClick={() => selectCategory(c)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex justify-between items-start"
                          >
                            <div>
                              <div className="font-medium text-sm">{categoryLabel(c)}</div>
                              <div className="text-xs text-gray-600">{c.description ? `${c.description.slice(0, 80)}${c.description.length > 80 ? "…" : ""}` : "Medical / Pharmacy category"}</div>
                            </div>
                            <div className="text-xs text-gray-500 ml-2">{/* optional meta */}</div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-xs text-gray-500">No categories found.</div>
                    )}
                  </div>
                )}
              </>
            )}

            {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
          </div>

          {/* Subcategory Name */}
          <div>
            <label className="text-sm font-medium">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.subcategory_name}
              onChange={(e) => handleChange("subcategory_name", e.target.value)}
              placeholder="e.g. Sterile Syringes"
              className="mt-1"
            />
            {errors.subcategory_name && <p className="text-xs text-red-500 mt-1">{errors.subcategory_name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Optional description (used in product filters and admin lists)"
              rows={4}
              className="mt-1 w-full resize-y px-3 py-2 border rounded-md text-sm"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">{descCount} characters</p>
              <p className="text-xs text-gray-500">Shown on product filters</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/subcategory")}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0E1680] text-white" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Subcategory" : "Create Subcategory"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
