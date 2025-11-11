// src/pages/labtests/LabtestList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  RotateCw,
  RefreshCw,
  FlaskConical,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import labtestService from "../../service/labtestService.js";
import Loading from "../Loading.jsx";
import { motion } from "framer-motion";

const DEFAULT_LIMIT = 10;

export default function LabtestList() {
  const navigate = useNavigate();

  const [labtests, setLabtests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    if (!loading) setAnimateKey((k) => k + 1);
  }, [loading]);

  useEffect(() => {
    const t = setTimeout(() => fetchLabtests(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchLabtests(currentPage);
  }, [currentPage, limit, sortBy, sortOrder]);

  const robustParseLabResponse = (res) => {
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

  const pageVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <motion.div
      key={animateKey}
      initial="hidden"
      animate="visible"
      variants={pageVariant}
      className="p-2 sm:p-2 w-full h-full flex flex-col overflow-hidden text-sm rounded-lg"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <FlaskConical className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Lab Tests
            </h2>
            <p className="text-xs text-gray-500">
              Manage lab tests, codes, and reference ranges
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search test name or code"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
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
      </motion.div>

      {/* Table */}
      <div className="hidden md:block flex-1 overflow-y-auto">
        <div className="overflow-x-auto rounded-md border border-gray-200 shadow-md bg-white">
          <table className="w-full table-auto border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
              <tr>
                <th
                  className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467] cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  Test Name{" "}
                  {sortBy === "name" ? (
                    sortOrder === "ASC" ? (
                      <ChevronUp size={12} className="inline" />
                    ) : (
                      <ChevronDown size={12} className="inline" />
                    )
                  ) : null}
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                  Units
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                  Reference Range
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                  TAT
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayLabtests.length > 0 ? (
                displayLabtests.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-gray-100 hover:bg-[#FBFBFF] transition-all"
                  >
                    <td className="px-4 py-3 text-[12px] font-medium text-gray-800">
                      {t.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {t.code || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {t.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {t.units || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {t.reference_range || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {t.turnaround_time || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-xs px-2 rounded border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                          onClick={() => handleEditLabtest(t.id)}
                        >
                          <Edit2 size={14} />
                        </Button>

                        {t.is_active ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-xs px-2 rounded"
                            onClick={() => handleDeleteLabtest(t.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-xs px-2 rounded"
                            onClick={() => handleRestoreLabtest(t.id)}
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
                  <td colSpan={7} className="py-4 text-center text-gray-500 text-[12px]">
                    No lab tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} lab tests
        </p>

        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs bg-white border border-gray-200 rounded">
              <SelectValue placeholder="Items / page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className={`text-xs rounded ${
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
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
