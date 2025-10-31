// src/pages/labtests/LabtestList.jsx
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
import labtestService from "../../service/labtestService.js";

const DEFAULT_LIMIT = 10;

function LabtestList() {
  const navigate = useNavigate();

  const [labtests, setLabtests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  useEffect(() => {
    const t = setTimeout(() => fetchLabtests(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchLabtests(currentPage);
  }, [currentPage, limit, sortBy, sortOrder]);

  // ✅ Normalize response structure safely
  const robustParseLabResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res.data ?? res;
    if (top?.data?.data && Array.isArray(top.data.data)) {
      return { rows: top.data.data, total: top.data.total ?? 0 };
    }
    if (Array.isArray(top?.data)) {
      return { rows: top.data, total: top.total ?? top.data.length ?? 0 };
    }
    return { rows: [], total: 0 };
  };

  // ✅ Fetch all Lab Tests
  const fetchLabtests = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await labtestService.getAllLabTests(params);
      const { rows, total: totalVal } = robustParseLabResponse(res);
      setLabtests(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching lab tests:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch lab tests");
      setLabtests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handlers
  const handleAddLabtest = () => navigate("/labtests/create");
  const handleEditLabtest = (id) => navigate(`/labtests/edit/${id}`);

  const handleDeleteLabtest = async (id) => {
    if (!confirm("Are you sure you want to delete this lab test?")) return;
    try {
      setLoading(true);
      await labtestService.deleteLabTest(id);
      toast.success("Lab test deleted");
      fetchLabtests(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete lab test");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreLabtest = async (id) => {
    if (!confirm("Restore this lab test?")) return;
    try {
      setLoading(true);
      await labtestService.restoreLabTest(id);
      toast.success("Lab test restored");
      fetchLabtests(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to restore lab test");
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
  const displayLabtests = useMemo(() => labtests || [], [labtests]);

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">🧪 Lab Tests</h2>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <Button
            className="bg-green-600 text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddLabtest}
          >
            <Plus size={14} /> Add Lab Test
          </Button>
          <Button
            variant="outline"
            className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchLabtests(currentPage)}
          >
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[1000px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      Test Name {sortBy === "name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Units</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Reference Range</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">TAT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
                        Loading lab tests...
                      </td>
                    </tr>
                  ) : displayLabtests.length > 0 ? (
                    displayLabtests.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">{t.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{t.code}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{t.category}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{t.units}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{t.reference_range}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{t.turnaround_time}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleEditLabtest(t.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {t.is_active ? (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleDeleteLabtest(t.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleRestoreLabtest(t.id)}
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
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
                        No lab tests found.
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
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} lab tests
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

export default LabtestList;
