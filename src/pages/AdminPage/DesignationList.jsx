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
import designationService from "../../service/designationService.js";

const DEFAULT_LIMIT = 10;

function DesignationList() {
  const navigate = useNavigate();

  const [designations, setDesignations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Fetch on search
  useEffect(() => {
    const t = setTimeout(() => fetchDesignations(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch on pagination or sorting
  useEffect(() => {
    fetchDesignations(currentPage);
  }, [currentPage, limit, sortBy, sortOrder]);

  const robustParseDesignationsResponse = (res) => {
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

  const fetchDesignations = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await designationService.getAllDesignations(params);
      const { rows, total: totalVal } = robustParseDesignationsResponse(res);

      setDesignations(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching designations:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch designations");
      setDesignations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigation handlers
  const handleAddDesignation = () => navigate("/designations/create");
  const handleEditDesignation = (id) => navigate(`/designations/edit/${id}`);

  // ✅ Delete & Restore
  const handleDeleteDesignation = async (id) => {
    if (!confirm("Are you sure you want to delete this designation?")) return;
    try {
      setLoading(true);
      await designationService.deleteDesignation(id);
      toast.success("Designation deleted");
      fetchDesignations(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete designation");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDesignation = async (id) => {
    if (!confirm("Restore this designation?")) return;
    try {
      setLoading(true);
      await designationService.restoreDesignation(id);
      toast.success("Designation restored");
      fetchDesignations(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to restore designation");
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
  const displayDesignations = useMemo(() => designations || [], [designations]);

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">🎓 Designations</h2>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <Button
            className="bg-green-600 text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddDesignation}
          >
            <Plus size={14} /> Add Designation
          </Button>
          <Button
            variant="outline"
            className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchDesignations(currentPage)}
          >
            <RefreshCw size={14} /> Refresh
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
                      onClick={() => toggleSort("title")}
                    >
                      Title {sortBy === "title" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Description
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
                      <td colSpan={5} className="py-4 text-center text-gray-500 text-xs">
                        Loading designations...
                      </td>
                    </tr>
                  ) : displayDesignations.length > 0 ? (
                    displayDesignations.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">
                          {d.title || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {d.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {d.created_by_email || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              d.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {d.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleEditDesignation(d.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {d.is_active ? (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleDeleteDesignation(d.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleRestoreDesignation(d.id)}
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
                        No designations found.
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
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} designations
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

export default DesignationList;
