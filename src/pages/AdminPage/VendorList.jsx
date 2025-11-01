import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import vendorService from "../../service/vendorService";

const DEFAULT_LIMIT = 10;

export default function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // 🔹 Parse API response safely
  const parseVendorResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res?.data?.data ?? res?.data ?? res;
    if (Array.isArray(top?.data)) return { rows: top.data, total: top.total ?? top.data.length };
    if (Array.isArray(top)) return { rows: top, total: top.length };
    if (Array.isArray(res?.data)) return { rows: res.data, total: res.total ?? res.data.length };
    return { rows: [], total: 0 };
  };

  // 🔹 Fetch Vendors
  const fetchVendors = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const resp = await (vendorService.getAll
        ? vendorService.getAll(params)
        : vendorService(params));

      const { rows, total } = parseVendorResponse(resp);
      setVendors(rows);
      setTotal(total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      toast.error(err?.response?.data?.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchVendors(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchVendors(currentPage);
  }, [currentPage, limit, sortBy, sortOrder]);

  // 🔹 Delete Vendor
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      setLoading(true);
      await (vendorService.remove
        ? vendorService.remove(id)
        : vendorService.deleteVendor?.(id));
      toast.success("Vendor deleted successfully");
      fetchVendors(currentPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete vendor");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  // 🔹 Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayVendors = useMemo(() => vendors || [], [vendors]);

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">🏢 Vendors</h2>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors by name, contact, or phone..."
              className="h-9 px-3 border rounded w-72 text-sm"
            />
            <Button
              variant="outline"
              className="h-9 flex items-center gap-2"
              onClick={() => fetchVendors(currentPage)}
            >
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>

          <Button
            className="bg-[#0E1680] text-white h-9 flex items-center gap-2"
            onClick={() => navigate("/vendor/create")}
          >
            <Plus size={14} /> Add Vendor
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto w-245 rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[1000px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 bg-[#F6F7FF]">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-left cursor-pointer" onClick={() => toggleSort("name")}>
                      Name {sortBy === "name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-left">Contact Person</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left">Phone</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left">Address</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left">GST Number</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500 text-xs">
                        Loading vendors...
                      </td>
                    </tr>
                  ) : displayVendors.length > 0 ? (
                    displayVendors.map((v) => (
                      <tr key={v.id} className="hover:bg-[#FBFBFF] border-t border-gray-100">
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">{v.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{v.contact_person || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{v.phone || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{v.address || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{v.gst_number || "—"}</td>
                        <td className="px-4 py-3 text-xs">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              v.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {v.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/vendor/edit/${v.id}`)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(v.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500 text-xs">
                        No vendors found.
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
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} vendors
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
