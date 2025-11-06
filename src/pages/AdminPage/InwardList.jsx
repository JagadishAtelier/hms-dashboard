// src/inward/pages/InwardList.jsx
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
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import inwardService from "../../service/inwardService.js";
import vendorService from "../../service/vendorService.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const DEFAULT_LIMIT = 10;

export default function InwardList() {
  const navigate = useNavigate();

  const [inwards, setInwards] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInward, setModalInward] = useState(null);
  const [modalItems, setModalItems] = useState([]);

  // ---- Fetch Vendors ----
  const fetchVendors = async () => {
    try {
      const res = await vendorService.getAll();
      setVendors(res?.data || res || []);
    } catch (err) {
      console.error("Vendor fetch error:", err);
    }
  };

  // ---- Parse API Response ----
  const parseInwardResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const data = res?.data?.data ?? res?.data ?? res;
    if (Array.isArray(data)) return { rows: data, total: data.length };
    if (Array.isArray(data?.data)) return { rows: data.data, total: data.total ?? data.data.length };
    return { rows: [], total: 0 };
  };

  // ---- Fetch Inwards ----
  const fetchInwards = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        vendor_id: vendorFilter || undefined,
        status: statusFilter || undefined,
      };

      const res = await inwardService.getAll(params);
      const { rows, total } = parseInwardResponse(res);
      setInwards(rows);
      setTotal(total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Fetch inwards error:", err);
      toast.error(err?.response?.data?.message || "Failed to load inwards");
      setInwards([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this inward entry?")) return;
    try {
      setLoading(true);
      await inwardService.remove(id);
      toast.success("Inward deleted successfully");
      fetchInwards(currentPage);
    } catch (err) {
      console.error("Delete inward error:", err);
      toast.error("Failed to delete inward");
    } finally {
      setLoading(false);
    }
  };

  // ---- PDF Export ----
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Inward List", 14, 16);

    const tableBody = inwards.map((inv) => [
      inv.inward_no ?? "-",
      inv.order?.po_no ?? inv.po_no ?? "-",
      getVendorName(inv.vendor_id),
      inv.received_date ? new Date(inv.received_date).toLocaleDateString() : "-",
      inv.total_quantity ?? 0,
      `₹${inv.total_amount ?? "0.00"}`,
      inv.status ?? "-",
    ]);

    doc.autoTable({
      startY: 22,
      head: [["Inward No", "PO No", "Vendor", "Received Date", "Qty", "Amount", "Status"]],
      body: tableBody,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [28, 34, 68], textColor: 255 },
    });

    doc.save("inwards.pdf");
  };

  // ---- Get Vendor Name ----
  const getVendorName = (vendor_id) => {
    const v = vendors.find((x) => x.id === vendor_id);
    return v?.name || v?.vendor_name || "-";
  };

  // ---- View Modal ----
  const handleView = (id) => {
    const found = inwards.find((inv) => String(inv.id) === String(id));
    if (!found) return toast.error("Inward not found in memory");
    setModalInward(found);
    setModalItems(Array.isArray(found.items) ? found.items : []);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalInward(null);
    setModalItems([]);
  };

  // ---- Filters and search ----
  useEffect(() => {
    const t = setTimeout(() => fetchInwards(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery, vendorFilter, statusFilter]);

  useEffect(() => {
    fetchInwards(currentPage);
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  // ---- Derived values ----
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const displayInwards = useMemo(() => inwards || [], [inwards]);

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm bg-[#fff] border border-gray-300 rounded-lg shadow-[0_0_8px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">📥 Inwards</h2>

        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Inward No / Vendor / PO No..."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
          />

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name || v.vendor_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button
            onClick={() => navigate("/inward/create")}
            className="h-[36px] bg-[#506EE4] text-white  flex items-center gap-2 text-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Inward
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#E5E7FB] text-[#475467]">
            <tr>
              <th className="p-3 text-left">S.No</th>
              <th className="p-3 text-left">Inward No</th>
              <th className="p-3 text-left">PO No</th>
              <th className="p-3 text-left">Vendor</th>
              <th className="p-3 text-left">Received Date</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : displayInwards.length ? (
              displayInwards.map((inv, idx) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{(currentPage - 1) * limit + idx + 1}</td>
                  <td className="p-3">{inv.inward_no ?? "-"}</td>
                  <td className="p-3">{inv.po_no ?? inv.order?.po_no ?? "-"}</td>
                  <td className="p-3">{getVendorName(inv.vendor_id)}</td>
                  <td className="p-3">
                    {inv.received_date
                      ? new Date(inv.received_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">{inv.total_quantity ?? 0}</td>
                  <td className="p-3">₹{inv.total_amount ?? "0.00"}</td>
                  <td
                    className={`p-3 capitalize font-medium ${
                      inv.status === "pending"
                        ? "text-yellow-600"
                        : inv.status === "completed"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {inv.status ?? "-"}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleView(inv.id)}>
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => navigate(`/inward/edit/${inv.id}`)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(inv.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No inwards found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
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
            <ChevronLeft size={16} />
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
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl shadow-lg">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                Inward Items - {modalInward?.inward_no}
              </h3>
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="min-w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Unit Price</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {modalItems.length > 0 ? (
                    modalItems.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{item.product?.product_name ?? item.product_name}</td>
                        <td className="p-2">{item.product?.product_code ?? item.product_code}</td>
                        <td className="p-2">{item.quantity ?? 0}</td>
                        <td className="p-2">₹{item.unit_price ?? "0.00"}</td>
                        <td className="p-2">₹{item.total_price ?? "0.00"}</td>
                        <td className="p-2">
                          {item.expiry_date
                            ? new Date(item.expiry_date).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-3 text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
