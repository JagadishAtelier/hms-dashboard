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
import bedsService from "../../service/bedsService.js";

const DEFAULT_LIMIT = 10;

function BedList() {
  const navigate = useNavigate();

  const [beds, setBeds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // ✅ Fetch Beds when filters change
  useEffect(() => {
    const t = setTimeout(() => fetchBeds(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchBeds(currentPage);
  }, [currentPage, limit, sortBy, sortOrder]);

  // ✅ Safely parse response structure
  const robustParseBedsResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res.data?.data ?? res;
    if (Array.isArray(top?.data)) {
      return { rows: top.data, total: top.total ?? top.data.length ?? 0 };
    }
    if (Array.isArray(top)) return { rows: top, total: top.length };
    return { rows: [], total: 0 };
  };

  const fetchBeds = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await bedsService.getAllBeds(params);
      const { rows, total: totalVal } = robustParseBedsResponse(res);
      setBeds(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching beds:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch beds");
      setBeds([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBed = () => navigate("/beds/create");
  const handleEditBed = (id) => navigate(`/beds/edit/${id}`);

  const handleDeleteBed = async (id) => {
    if (!confirm("Are you sure you want to delete this bed?")) return;
    try {
      setLoading(true);
      await bedsService.deleteBed(id);
      toast.success("Bed deleted successfully");
      fetchBeds(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete bed");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBed = async (id) => {
    if (!confirm("Restore this bed?")) return;
    try {
      setLoading(true);
      await bedsService.restoreBed(id);
      toast.success("Bed restored successfully");
      fetchBeds(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to restore bed");
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
  const displayBeds = useMemo(() => beds || [], [beds]);

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">🛏️ Beds</h2>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <Button
            className="bg-green-600 text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddBed}
          >
            <Plus size={14} /> Add Bed
          </Button>
          <Button
            variant="outline"
            className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchBeds(currentPage)}
          >
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[950px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("bed_no")}
                    >
                      Bed No {sortBy === "bed_no" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Room No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Ward
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Price/Day
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Occupied
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
                      <td colSpan={8} className="py-4 text-center text-gray-500 text-xs">
                        Loading beds...
                      </td>
                    </tr>
                  ) : displayBeds.length > 0 ? (
                    displayBeds.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">
                          {b.bed_no}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {b.room?.room_no || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {b.room?.ward?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {b.room?.room_type || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          ₹{b.room?.price_per_day || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              b.is_occupied
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {b.is_occupied ? "Occupied" : "Available"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              b.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {b.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleEditBed(b.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {b.is_active ? (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleDeleteBed(b.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleRestoreBed(b.id)}
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
                      <td colSpan={8} className="py-4 text-center text-gray-500 text-xs">
                        No beds found.
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
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} beds
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

export default BedList;
