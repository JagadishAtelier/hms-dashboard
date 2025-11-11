import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Plus,
  Building2,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import vendorService from "../../service/vendorService";
import Loading from "../Loading.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_LIMIT = 10;

export default function VendorList() {
  const navigate = useNavigate();

  // State
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Fetch Vendors
  const fetchVendors = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        is_active: filterStatus || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const res = await (vendorService.getAll
        ? vendorService.getAll(params)
        : vendorService(params));

      const data =
        res?.data?.data || res?.data || res || [];
      const rows = Array.isArray(data?.data) ? data.data : data;
      const totalCount =
        data?.total || res?.data?.total || rows.length || 0;

      setVendors(rows);
      setTotal(totalCount);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  // Delete vendor
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

  // Sorting
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchVendors(1), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchVendors(currentPage);
  }, [currentPage, limit, filterStatus, sortBy, sortOrder]);

  // Derived UI
  const displayVendors = useMemo(() => vendors || [], [vendors]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);

  return (
    <div className="p-2 sm:p-2 w-full h-full flex flex-col overflow-hidden text-sm rounded-lg">
      {loading && <Loading />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <Building2 className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              Vendors
            </h2>
            <p className="text-xs text-gray-500">
              Manage supplier/vendor details easily
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search vendor by name or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filterStatus || "all"}
            onValueChange={(val) => {
              setFilterStatus(val === "all" ? "" : val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm border border-gray-200 bg-white rounded-md shadow-sm hover:bg-gray-50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Add & Refresh */}
          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => navigate("/vendor/create")}
          >
            <Plus size={14} /> Add Vendor
          </Button>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => fetchVendors(1)}
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
                    className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467] cursor-pointer"
                    onClick={() => toggleSort("name")}
                  >
                    Name{" "}
                    {sortBy === "name" ? (
                      sortOrder === "ASC" ? (
                        <ChevronUp size={12} className="inline-block" />
                      ) : (
                        <ChevronDown size={12} className="inline-block" />
                      )
                    ) : (
                      ""
                    )}
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Address
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    GST No
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-4 text-center text-gray-500 text-[12px]"
                    >
                      Loading vendors...
                    </td>
                  </tr>
                ) : displayVendors.length > 0 ? (
                  displayVendors.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                    >
                      <td className="px-4 py-3 text-center text-[12px] font-medium text-gray-800">
                        {v.name}
                      </td>
                      <td className="px-4 py-3 text-center text-[12px] text-gray-700">
                        {v.contact_person || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-[12px] text-gray-700">
                        {v.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-[12px] text-gray-700">
                        {v.address || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-[12px] text-gray-700">
                        {v.gst_number || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${
                            v.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {v.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => navigate(`/vendor/edit/${v.id}`)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
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
                    <td
                      colSpan={7}
                      className="py-4 text-center text-gray-500 text-[12px]"
                    >
                      No vendors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 mt-3">
          {displayVendors.length > 0 ? (
            displayVendors.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm text-[#0E1680]">
                    {v.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[11px] rounded-full ${
                      v.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {v.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-gray-700">
                  📞 {v.phone || "—"} <br />
                  👤 {v.contact_person || "—"} <br />
                  🏠 {v.address || "—"}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="text-xs bg-[#0E1680] text-white flex-1"
                    onClick={() => navigate(`/vendor/edit/${v.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => handleDelete(v.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-[12px]">
              No vendors found.
            </p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} vendors
        </p>

        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(v) => {
              setLimit(Number(v));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs border border-gray-200 bg-white rounded shadow-sm">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="text-xs"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
