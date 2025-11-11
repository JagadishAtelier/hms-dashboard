// src/inward/pages/InwardList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  PackageCheck,
  Eye,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import inwardService from "../../service/inwardService";
import vendorService from "../../service/vendorService";
import Loading from "../Loading.jsx";

const DEFAULT_LIMIT = 10;

export default function InwardList() {
  const navigate = useNavigate();
  const [inwards, setInwards] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Sorting
  const [sortBy, setSortBy] = useState("received_date");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInward, setModalInward] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      const res = await vendorService.getAll();
      setVendors(res?.data || res || []);
    } catch (err) {
      console.error("Vendor fetch error:", err);
    }
  };

  // Fetch inwards
  const fetchInwards = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        vendor_id: vendorFilter || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await inwardService.getAll(params);
      const data = res?.data?.data || res?.data || res;
      setInwards(Array.isArray(data) ? data : data.data || []);
      setTotal(data.total || data.length || 0);
      setCurrentPage(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch inwards");
      setInwards([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Delete inward
  const handleDelete = async (id) => {
    if (!confirm("Delete this inward entry?")) return;
    try {
      setLoading(true);
      await inwardService.remove(id);
      toast.success("Inward deleted successfully");
      fetchInwards(currentPage);
    } catch {
      toast.error("Failed to delete inward");
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const getVendorName = (vendor_id) =>
    vendors.find((v) => v.id === vendor_id)?.name || "-";

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchInwards(1), 400);
    return () => clearTimeout(t);
  }, [searchQuery, vendorFilter, statusFilter]);

  useEffect(() => {
    fetchInwards(currentPage);
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, sortBy, sortOrder]);

  const displayInwards = useMemo(() => inwards || [], [inwards]);

  return (
    <div className="p-3 sm:p-5 w-full h-full flex flex-col overflow-hidden text-sm">
      {loading && <Loading />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <PackageCheck className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Inward Entries
            </h2>
            <p className="text-xs text-gray-500">
              Manage and review your inward stock records
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search Inward No / Vendor / PO..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          {/* Vendor Filter */}
          <Select
            value={vendorFilter || "all"}
            onValueChange={(val) => setVendorFilter(val === "all" ? "" : val)}
          >
            <SelectTrigger className="h-9 w-full sm:w-auto text-sm border border-gray-200 bg-white">
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name || v.vendor_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter || "all"}
            onValueChange={(val) => setStatusFilter(val === "all" ? "" : val)}
          >
            <SelectTrigger className="h-9 w-full sm:w-auto text-sm border border-gray-200 bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => navigate("/inward/create")}
          >
            <Plus size={14} /> Add Inward
          </Button>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => fetchInwards(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
          <table className="w-full table-auto border-collapse text-[13px]">
            <thead className="bg-[#F6F7FF]">
              <tr>
                <th className="px-4 py-3 text-left">Inward No</th>
                <th className="px-4 py-3 text-left">Vendor</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer"
                  onClick={() => toggleSort("received_date")}
                >
                  Received Date{" "}
                  {sortBy === "received_date" &&
                    (sortOrder === "ASC" ? (
                      <ChevronUp size={12} className="inline-block" />
                    ) : (
                      <ChevronDown size={12} className="inline-block" />
                    ))}
                </th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : displayInwards.length ? (
                displayInwards.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t hover:bg-[#FBFBFF] transition-colors"
                  >
                    <td className="px-4 py-3">{inv.inward_no ?? "-"}</td>
                    <td className="px-4 py-3">{getVendorName(inv.vendor_id)}</td>
                    <td className="px-4 py-3">
                      {inv.received_date
                        ? new Date(inv.received_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.total_quantity ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₹{inv.total_amount ?? "0.00"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${
                          inv.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : inv.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {inv.status || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setModalInward(inv)}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/inward/edit/${inv.id}`)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(inv.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500">
                    No inwards found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-600">
        <span>
          Showing {(currentPage - 1) * limit + 1}–
          {Math.min(currentPage * limit, total)} of {total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} />
          </Button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Modal */}
      {modalInward && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl shadow-lg p-4">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">
                Inward Details – {modalInward?.inward_no}
              </h3>
              <Button variant="outline" onClick={() => setModalInward(null)}>
                Close
              </Button>
            </div>
            <div className="max-h-[400px] overflow-y-auto text-sm">
              <p><b>Vendor:</b> {getVendorName(modalInward.vendor_id)}</p>
              <p><b>PO No:</b> {modalInward.po_no || "-"}</p>
              <p><b>Status:</b> {modalInward.status}</p>
              <p><b>Received:</b> {modalInward.received_date}</p>
              {/* you can add modal items table here if needed */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
