import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Edit2,
  Plus,
  RotateCw,
  Trash2,
  ChevronUp,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "../Loading.jsx";
import subcategoryService from "../../service/subcategoryService.js";

const DEFAULT_LIMIT = 10;

export default function SubCategoryList() {
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchSubcategories(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSubcategories(currentPage);
  }, [currentPage, limit, sortBy, sortOrder, filterStatus]);

  const fetchSubcategories = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        is_active:
          filterStatus === "Active"
            ? true
            : filterStatus === "Inactive"
            ? false
            : undefined,
      };

      const res =
        (subcategoryService.getAllSubcategories &&
          (await subcategoryService.getAllSubcategories(params))) ||
        (subcategoryService.getAll && (await subcategoryService.getAll(params))) ||
        (await subcategoryService.getAll(params));

      const data = res?.data?.data || res?.data || res;
      const rows = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      const totalVal =
        data?.total || data?.totalItems || data?.totalRecords || rows.length;

      setSubcategories(rows);
      setTotal(totalVal);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => navigate("/subcategory/create");
  const handleEdit = (id) => navigate(`/subcategory/edit/${id}`);

  const handleDelete = async (id) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      setLoading(true);
      if (subcategoryService.deleteSubcategory)
        await subcategoryService.deleteSubcategory(id);
      else if (subcategoryService.remove) await subcategoryService.remove(id);
      else if (subcategoryService.delete) await subcategoryService.delete(id);
      toast.success("Subcategory deleted");
      fetchSubcategories(currentPage);
    } catch (err) {
      toast.error("Failed to delete subcategory");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!confirm("Restore this subcategory?")) return;
    try {
      setLoading(true);
      if (subcategoryService.restoreSubcategory)
        await subcategoryService.restoreSubcategory(id);
      else if (subcategoryService.restore) await subcategoryService.restore(id);
      toast.success("Subcategory restored");
      fetchSubcategories(currentPage);
    } catch (err) {
      toast.error("Failed to restore subcategory");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displaySubcategories = useMemo(() => subcategories || [], [subcategories]);

  const categoryName = (rec) => rec?.category_name ?? rec?.category?.name ?? "—";

  return (
    <div className="p-3 sm:p-4 w-full h-full flex flex-col overflow-hidden text-sm rounded-lg relative">
      {loading && <Loading />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <FolderOpen className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              Subcategories
            </h2>
            <p className="text-xs text-gray-500">
              Manage and organize product/service subcategories
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <Input
              type="search"
              placeholder="Search subcategories..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          <Select
            value={filterStatus || "all"}
            onValueChange={(value) => {
              setFilterStatus(value === "all" ? "" : value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-auto text-sm border border-gray-200 bg-white rounded-md shadow-sm hover:bg-gray-50 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-md border border-gray-100 bg-white text-sm">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAdd}
          >
            <Plus size={14} /> Add Subcategory
          </Button>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchSubcategories(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-md bg-white">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467] cursor-pointer"
                    onClick={() => toggleSort("subcategory_name")}
                  >
                    Subcategory{" "}
                    {sortBy === "subcategory_name" &&
                      (sortOrder === "ASC" ? (
                        <ChevronUp size={12} className="inline-block" />
                      ) : (
                        <ChevronDown size={12} className="inline-block" />
                      ))}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467] cursor-pointer"
                    onClick={() => toggleSort("category_name")}
                  >
                    Category{" "}
                    {sortBy === "category_name" &&
                      (sortOrder === "ASC" ? (
                        <ChevronUp size={12} className="inline-block" />
                      ) : (
                        <ChevronDown size={12} className="inline-block" />
                      ))}
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500 text-[12px]">
                      Loading subcategories...
                    </td>
                  </tr>
                ) : displaySubcategories.length > 0 ? (
                  displaySubcategories.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                    >
                      <td className="px-4 py-3 text-[12px] font-medium text-gray-800">
                        {s.subcategory_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-700">
                        {categoryName(s)}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-700">
                        {s.description || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${
                            s.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => handleEdit(s.id)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          {s.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => handleDelete(s.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => handleRestore(s.id)}
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
                    <td colSpan={5} className="py-4 text-center text-gray-500 text-[12px]">
                      No subcategories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3 mt-3">
          {displaySubcategories.map((s) => (
            <div key={s.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-[#0E1680]">
                    {s.subcategory_name}
                  </p>
                  <p className="text-xs text-gray-600">{categoryName(s)}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {s.description || "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(s.id)}>
                      <Edit2 size={12} />
                    </Button>
                    {s.is_active ? (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={12} />
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleRestore(s.id)}>
                        <RotateCw size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                className={`text-xs ${
                  currentPage === i + 1 ? "bg-[#506EE4] text-white" : ""
                }`}
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
