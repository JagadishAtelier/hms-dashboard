import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  Plus,
  Package,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import orderService from "../../service/orderService";
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

export default function OrderList() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // --- fetch vendors ---
  const fetchVendors = async () => {
    try {
      const res = await vendorService.getAll();
      setVendors(res?.data || res || []);
    } catch (err) {
      console.error("Vendor fetch error:", err);
    }
  };

  // --- parse flexible API response ---
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

  // --- fetch orders ---
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

      const { rows, total } = robustParseOrderResponse(resp);
      setOrders(rows);
      setTotal(Number(total || 0));
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

  // --- delete order ---
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

  // --- fetch effects ---
  useEffect(() => {
    const t = setTimeout(() => fetchOrders(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery, vendorFilter, statusFilter]);

  useEffect(() => {
    fetchOrders(currentPage);
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayOrders = useMemo(() => orders || [], [orders]);

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <div className="p-3 sm:p-4 w-full h-full flex flex-col overflow-hidden text-sm">
      {loading && <Loading />}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <Package className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              Orders
            </h2>
            <p className="text-xs text-gray-500">
              Manage all purchase orders and statuses
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          {/* search */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <Input
              type="search"
              placeholder="Search PO, vendor, or status"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          {/* vendor filter */}
          <Select
            value={vendorFilter || "all"}
            onValueChange={(v) => setVendorFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-[150px] bg-white border border-gray-200 text-sm">
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {v.vendor_name || v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* status filter */}
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-[140px] bg-white border border-gray-200 text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* actions */}
          <Button
            className="bg-[#506EE4] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => navigate("/order/create")}
          >
            <Plus size={14} /> Add Order
          </Button>

          <Button
            className="bg-[#506EE4] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => fetchOrders(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* TABLE VIEW */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-md bg-white">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 bg-[#F6F7FF]">
                <tr>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    PO No
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Total Qty
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Pending Qty
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">
                    Tax
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
                    <td colSpan={9} className="text-center py-4 text-[12px] text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : displayOrders.length > 0 ? (
                  displayOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                    >
                      <td className="text-center px-4 py-3 text-[12px] font-medium text-gray-800">
                        {order.po_no || "—"}
                      </td>
                      <td className="text-center px-4 py-3 text-[12px] text-gray-700">
                        {order.vendor_name || order.vendor?.name || "—"}
                      </td>
                      <td className="text-center px-4 py-3 text-[12px] text-gray-700">
                        {formatDate(order.order_date)}
                      </td>
                      <td className="text-center px-4 py-3 text-[12px] text-gray-700">
                        {order.total_quantity ?? 0}
                      </td>
                      <td className="text-center px-4 py-3 text-[12px] text-gray-700">
                        {order.total_penning_quantity ?? 0}
                      </td>
                      <td className="text-center px-4 py-3 text-[12px] text-gray-700">
                        ₹{order.total_amount ?? 0}
                      </td>
                      <td className="text-center px-4 py-3 text-[12px] text-gray-700">
                        ₹{order.tax_amount ?? 0}
                      </td>
                      <td className="text-center px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[12px] font-semibold capitalize ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/order/view/${order.id}`)}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/order/edit/${order.id}`)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
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
                      colSpan={9}
                      className="text-center py-4 text-[12px] text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden space-y-3 mt-3">
          {displayOrders.length > 0 ? (
            displayOrders.map((order) => (
              <article
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#0E1680] text-sm">
                      {order.po_no}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {order.vendor_name || order.vendor?.name || "—"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[11px] rounded-full ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-700">
                  <div>
                    <div className="text-[11px] text-gray-500">Date</div>
                    <div>{formatDate(order.order_date)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">Amount</div>
                    <div>₹{order.total_amount ?? 0}</div>
                  </div>
                  <div className="col-span-2 flex gap-2 mt-2">
                    <Button
                      className="bg-[#506EE4] text-white text-xs flex-1"
                      onClick={() => navigate(`/order/view/${order.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs flex-1"
                      onClick={() => navigate(`/order/edit/${order.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500 text-xs">
              No orders found.
            </p>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {startIndex}-{endIndex} of {total} orders
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
              <SelectValue placeholder="Items/page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>

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
