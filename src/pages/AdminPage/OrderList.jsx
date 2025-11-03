// src/pages/orders/OrderList.jsx
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
import orderService from "../../service/orderService";
import vendorService from "../../service/vendorService";

const DEFAULT_LIMIT = 10;

export default function OrderList() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // ---- Fetch Vendors ----
  const fetchVendors = async () => {
    try {
      const res = await vendorService.getAll();
      setVendors(res?.data || res || []);
    } catch (err) {
      console.error("Vendor fetch error:", err);
    }
  };

  // ---- Parse Response (flexible shape) ----
  const robustParseOrderResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res?.data?.data ?? res?.data ?? res;
    if (top?.data && Array.isArray(top.data))
      return { rows: top.data, total: top.total ?? top.data.length ?? 0 };
    if (Array.isArray(top)) return { rows: top, total: top.length ?? 0 };
    if (Array.isArray(res?.data))
      return { rows: res.data, total: res.total ?? res.data.length ?? 0 };
    return { rows: [], total: 0 };
  };

  // ---- Fetch Orders ----
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        vendor_id: vendorFilter || undefined,
        status: statusFilter || undefined,
      };

      const resp =
        (await orderService.getAll(params)) ||
        (await orderService.listOrders(params));

      const { rows, total: totalVal } = robustParseOrderResponse(resp);
      setOrders(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      setLoading(true);
      if (orderService.delete) await orderService.delete(id);
      else if (orderService.remove) await orderService.remove(id);
      toast.success("Order deleted successfully");
      fetchOrders(currentPage);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  // ---- Filters and search ----
  useEffect(() => {
    const t = setTimeout(() => fetchOrders(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery, vendorFilter, statusFilter]);

  useEffect(() => {
    fetchOrders(currentPage);
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  // ---- Derived values ----
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayOrders = useMemo(() => orders || [], [orders]);

  return (
    <div className="p-4 sm:p-6 w-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          📦 Orders
        </h2>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by PO, vendor, or status..."
              className="h-9 px-3 border rounded w-72 text-sm"
            />
            <Button
              variant="outline"
              className="h-9 flex items-center gap-2 text-sm"
              onClick={() => fetchOrders(currentPage)}
            >
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="h-9 border rounded px-2 text-sm"
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vendor_name || v.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 border rounded px-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button
            className="bg-[#0E1680] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => navigate("/order/create")}
          >
            <Plus size={14} /> Add Order
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="min-w-[1000px] w-200">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">PO No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Order Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Total Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Pending Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Tax</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-4 text-center text-gray-500 text-xs">
                      Loading orders...
                    </td>
                  </tr>
                ) : displayOrders.length > 0 ? (
                  displayOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                    >
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">
                        {(currentPage - 1) * limit + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{order.po_no || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {order.vendor_name || order.vendor?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {order.order_date
                          ? new Date(order.order_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{order.total_quantity ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{order.total_penning_quantity ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">₹{order.total_amount ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">₹{order.tax_amount ?? 0}</td>
                      <td
                        className={`px-4 py-3 text-xs font-semibold capitalize ${
                          order.status === "pending"
                            ? "text-yellow-600"
                            : order.status === "completed"
                            ? "text-green-600"
                            : order.status === "cancelled"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {order.status || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/order/view/${order.id}`)}
                            title="View Order Details"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/order/edit/${order.id}`)}
                            title="Edit Order"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-4 text-center text-gray-500 text-xs">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-5 flex-wrap gap-3">
        <p className="text-xs text-gray-600">
          Showing {startIndex}-{endIndex} of {total} orders
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} /> Prev
          </Button>
          <span className="text-xs">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
