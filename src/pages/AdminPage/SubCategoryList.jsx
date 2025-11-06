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
import subcategoryService from "../../service/subcategoryService.js";

const DEFAULT_LIMIT = 10;

export default function SubCategoryList() {
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // debounce search to mirror BedList behavior
  useEffect(() => {
    const t = setTimeout(() => fetchSubcategories(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchSubcategories(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, sortBy, sortOrder]);

  const robustParseSubcategoryResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    // many APIs wrap results differently; handle common shapes
    const top = res?.data?.data ?? res?.data ?? res;
    if (Array.isArray(top?.data)) return { rows: top.data, total: top.total ?? top.data.length ?? 0 };
    if (Array.isArray(top)) return { rows: top, total: top.length ?? 0 };
    if (Array.isArray(res?.data)) return { rows: res.data, total: res.total ?? res.data.length ?? 0 };
    return { rows: [], total: 0 };
  };

  const fetchSubcategories = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // try common method name
      const res =
        (subcategoryService.getAllSubcategories && await subcategoryService.getAllSubcategories(params)) ||
        (subcategoryService.getAll && await subcategoryService.getAll(params)) ||
        (await subcategoryService.getAll(params));

      const { rows, total: totalVal } = robustParseSubcategoryResponse(res);
      setSubcategories(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch subcategories");
      setSubcategories([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => navigate("/subcategory/create");
  const handleEdit = (id) => navigate(`/subcategory/edit/${id}`);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      setLoading(true);
      if (subcategoryService.deleteSubcategory) await subcategoryService.deleteSubcategory(id);
      else if (subcategoryService.remove) await subcategoryService.remove(id);
      else if (subcategoryService.delete) await subcategoryService.delete(id);
      else throw new Error("Delete method not found on subcategoryService");

      toast.success("Subcategory deleted successfully");
      fetchSubcategories(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete subcategory");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!confirm("Restore this subcategory?")) return;
    try {
      setLoading(true);
      if (subcategoryService.restoreSubcategory) await subcategoryService.restoreSubcategory(id);
      else if (subcategoryService.restore) await subcategoryService.restore(id);
      else throw new Error("Restore method not found on subcategoryService");

      toast.success("Subcategory restored successfully");
      fetchSubcategories(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to restore subcategory");
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

  // derived values for pagination UI
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displaySubcategories = useMemo(() => subcategories || [], [subcategories]);

  // small helper for showing category name safely
  const categoryName = (rec) => rec?.category_name ?? rec?.category?.name ?? "—";

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm bg-[#fff] border border-gray-300 rounded-lg shadow-[0_0_8px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">📂 Subcategories</h2>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subcategories..."
              className="h-9 px-3 border rounded w-60 text-sm"
            />
            <Button
              variant="outline"
              className="h-[36px] bg-[#506EE4] text-[#fff] flex items-center gap-2 w-full sm:w-auto text-sm"
              onClick={() => fetchSubcategories(currentPage)}
            >
              <RefreshCw size={14} />
            </Button>
          </div>

          <Button
            className="h-[36px] bg-[#506EE4] text-white flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAdd}
          >
            <Plus size={14} /> Add Subcategory
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[600px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("subcategory_name")}
                    >
                      Subcategory {sortBy === "subcategory_name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("category_name")}
                    >
                      Category {sortBy === "category_name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 text-xs">
                        Loading subcategories...
                      </td>
                    </tr>
                  ) : displaySubcategories.length > 0 ? (
                    displaySubcategories.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">
                          {s.subcategory_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">{categoryName(s)}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{s.description || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              s.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {s.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleEdit(s.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {s.is_active ? (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleDelete(s.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleRestore(s.id)}
                                title="Restore"
                              >
                                <RotateCw size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 text-xs">
                        No subcategories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile fallback */}
        <div className="md:hidden">
          <div className="space-y-3">
            {loading ? (
              <div className="py-4 text-center text-gray-500 text-xs">Loading subcategories...</div>
            ) : displaySubcategories.length > 0 ? (
              displaySubcategories.map((s) => (
                <div key={s.id} className="p-3 bg-white rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{s.subcategory_name || "—"}</div>
                      <div className="text-xs text-gray-600">{categoryName(s)}</div>
                      <div className="text-xs text-gray-600 mt-1">{s.description || "—"}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(s.id)}>
                        <Edit2 size={14} />
                      </Button>
                      {s.is_active ? (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}>
                          <Trash2 size={14} />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleRestore(s.id)}>
                          <RotateCw size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500 text-xs">No subcategories found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} subcategories
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
                className={`text-xs ${currentPage === i + 1 ? "bg-[#506EE4] text-white" : ""}`}
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
