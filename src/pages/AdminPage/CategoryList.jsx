// src/pages/categories/CategoryList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  RotateCw,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import categoryService from "../../service/categoryService.js";

const DEFAULT_LIMIT = 10;

function CategoryList() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  useEffect(() => {
    const t = setTimeout(() => fetchCategories(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage, limit, sortBy, sortOrder]);

  // Normalize different shapes of response safely
  const robustParseCategoryResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res.data.data ?? res;
    // case: { data: { data: [...], total } }
    if (top?.data?.data && Array.isArray(top.data.data)) {
      return { rows: top.data.data, total: top.data.total ?? 0 };
    }
    // case: { data: [...] , total }
    if (Array.isArray(top?.data)) {
      return { rows: top.data, total: top.total ?? top.data.length ?? 0 };
    }
    // case: direct { data: [...], total } or { rows: [...], total }
    if (Array.isArray(top?.rows)) {
      return { rows: top.rows, total: top.total ?? top.rows.length ?? 0 };
    }
    return { rows: [], total: 0 };
  };

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await categoryService.getAll(params);
      const { rows, total: totalVal } = robustParseCategoryResponse(res);
      setCategories(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch categories");
      setCategories([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddCategory = () => navigate("/category/create");
  const handleEditCategory = (id) => navigate(`/category/edit/${id}`);

  const handleDeleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      setLoading(true);
      // original service used remove; keep same
      if (categoryService.remove) await categoryService.remove(id);
      else if (categoryService.delete) await categoryService.delete(id);
      else throw new Error("Delete method not found on categoryService");
      toast.success("Category deleted");
      fetchCategories(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreCategory = async (id) => {
    if (!confirm("Restore this category?")) return;
    try {
      setLoading(true);
      if (categoryService.restore) await categoryService.restore(id);
      else throw new Error("Restore method not found on categoryService");
      toast.success("Category restored");
      fetchCategories(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to restore category");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayCategories = useMemo(() => categories || [], [categories]);

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">📂 Categories</h2>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="h-9 px-3 border rounded w-60 text-sm"
            />
            <Button
              variant="outline"
              className="h-9 flex items-center gap-2 text-sm"
              onClick={() => fetchCategories(currentPage)}
            >
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>

          <Button
            className="bg-green-600 text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddCategory}
          >
            <Plus size={14} /> Add Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[800px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("category_name")}
                    >
                      Name {sortBy === "category_name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-500 text-xs">
                        Loading categories...
                      </td>
                    </tr>
                  ) : displayCategories.length > 0 ? (
                    displayCategories.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">
                          {c.category_name || c.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">{c.description || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleEditCategory(c.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {c.is_active === false || c.deleted_at ? (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleRestoreCategory(c.id)}
                                title="Restore"
                              >
                                <RotateCw size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleDeleteCategory(c.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-500 text-xs">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile fallback: simple list */}
        <div className="md:hidden">
          <div className="space-y-3">
            {loading ? (
              <div className="py-4 text-center text-gray-500 text-xs">Loading categories...</div>
            ) : displayCategories.length > 0 ? (
              displayCategories.map((c) => (
                <div key={c.id} className="p-3 bg-white rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{c.category_name || c.name || "-"}</div>
                      <div className="text-xs text-gray-600">{c.description || "-"}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditCategory(c.id)}>
                        <Edit2 size={14} />
                      </Button>
                      {c.is_active === false || c.deleted_at ? (
                        <Button size="sm" variant="ghost" onClick={() => handleRestoreCategory(c.id)}>
                          <RotateCw size={14} />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(c.id)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500 text-xs">No categories found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} categories
        </p>

        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 text-xs border rounded px-2 bg-white"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="text-xs"
          >
            <ChevronLeft />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className={`text-xs ${currentPage === i + 1 ? "bg-[#0E1680] text-white" : ""}`}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CategoryList;
