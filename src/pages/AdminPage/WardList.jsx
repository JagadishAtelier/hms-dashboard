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
import wardsService from "../../service/wardsService.js";

const DEFAULT_LIMIT = 10;

function WardList() {
  const navigate = useNavigate();

  const [wards, setWards] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  useEffect(() => {
    const t = setTimeout(() => fetchWards(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchWards(currentPage);
  }, [currentPage, limit, sortBy, sortOrder]);

  const robustParseWardsResponse = (res) => {
    if (!res) return { rows: [], total: 0 };

    const top = res.data?.data ?? res;

    if (top?.data?.data && Array.isArray(top.data.data)) {
      return { rows: top.data.data, total: top.data.total ?? 0 };
    }

    if (Array.isArray(top)) {
      return { rows: top, total: top.length };
    }

    return { rows: [], total: 0 };
  };

  const fetchWards = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await wardsService.getAllWards(params);
      const { rows, total: totalVal } = robustParseWardsResponse(res);

      setWards(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching wards:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch wards");
      setWards([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWard = () => {
    navigate("/wards/create");
  };

  const handleEditWard = (id) => {
    navigate(`/wards/edit/${id}`);
  };

  const handleDeleteWard = async (id) => {
    if (!confirm("Are you sure you want to delete this ward?")) return;
    try {
      setLoading(true);
      await wardsService.deleteWard(id);
      toast.success("Ward deleted");
      fetchWards(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete ward");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreWard = async (id) => {
    if (!confirm("Restore this ward?")) return;
    try {
      setLoading(true);
      await wardsService.restoreWard(id);
      toast.success("Ward restored");
      fetchWards(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to restore ward");
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
  const displayWards = useMemo(() => wards || [], [wards]);

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">🏥 Wards</h2>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <Button
            className="bg-green-600 text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddWard}
          >
            <Plus size={14} /> Add Ward
          </Button>
          <Button
            variant="outline"
            className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchWards(currentPage)}
          >
            <RefreshCw size={14} /> Refresh
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
                      onClick={() => toggleSort("name")}
                    >
                      Ward Name {sortBy === "name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Description
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("floor")}
                    >
                      Floor {sortBy === "floor" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Created By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500 text-xs">
                        Loading wards...
                      </td>
                    </tr>
                  ) : displayWards.length > 0 ? (
                    displayWards.map((w) => (
                      <tr
                        key={w.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">{w.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {w.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">{w.floor || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {w.created_by_email || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              w.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {w.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleEditWard(w.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {w.is_active ? (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleDeleteWard(w.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleRestoreWard(w.id)}
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
                      <td colSpan={6} className="py-4 text-center text-gray-500 text-xs">
                        No wards found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} wards
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
                  currentPage === i + 1 ? "bg-[#0E1680] text-white" : ""
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

export default WardList;
