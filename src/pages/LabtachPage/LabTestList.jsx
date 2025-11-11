// src/pages/lab/LabTestList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
  BedDouble,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import labTestOrderService from "../../service/labtestorderService";
import Loading from "../Loading.jsx";

const DEFAULT_LIMIT = 10;

export default function LabTestList() {
  const navigate = useNavigate();

  const [labOrders, setLabOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animateKey, setAnimateKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState("order_date");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Animate on load
  useEffect(() => {
    if (!loading) setAnimateKey((k) => k + 1);
  }, [loading]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchLabOrders(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchLabOrders(currentPage);
  }, [currentPage, limit, filterStatus, sortBy, sortOrder]);

  const robustParse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res?.data ?? res;
    if (top?.data && Array.isArray(top.data))
      return { rows: top.data, total: top.total ?? top.data.length };
    if (top?.rows && Array.isArray(top.rows))
      return { rows: top.rows, total: top.total ?? top.rows.length };
    if (Array.isArray(top)) return { rows: top, total: top.length };
    return { rows: [], total: 0 };
  };

  const fetchLabOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        status: filterStatus || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      let res = null;
      if (labTestOrderService.getAllLabTestOrders)
        res = await labTestOrderService.getAllLabTestOrders(params);
      else if (labTestOrderService.list)
        res = await labTestOrderService.list(params);
      else res = await labTestOrderService.get(params);

      const { rows, total } = robustParse(res);
      const mapped = (rows || []).map((o) => ({
        ...o,
        order_no: o.order_no ?? o.id ?? "-",
        patient: o.patient ?? o.customer ?? {},
        encounter: o.encounter ?? o.visit ?? {},
        items: o.items ?? o.tests ?? [],
        status: o.status ?? "pending",
        order_date: o.order_date ?? o.created_at ?? o.date ?? null,
      }));

      setLabOrders(mapped);
      setTotal(Number(total || mapped.length || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch lab test orders");
      setLabOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = (order) => {
    const encounterId =
      order.encounter_id ?? order.encounter?.id ?? order.encounter_id;
    if (!encounterId) return toast.error("No encounter id available");
    navigate(`/testresults/${encounterId}`);
  };

  const handleMarkComplete = async (orderId) => {
    if (!confirm("Mark this order as completed?")) return;
    try {
      setLoading(true);
      if (labTestOrderService.markComplete)
        await labTestOrderService.markComplete(orderId);
      else
        await labTestOrderService.update(orderId, { status: "completed" });
      toast.success("Marked completed");
      fetchLabOrders(currentPage);
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark order complete");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field)
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayOrders = useMemo(() => labOrders || [], [labOrders]);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  const pageVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gray-50">
        <Loading />
      </div>
    );

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
            <BedDouble className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Lab Test Orders
            </h2>
            <p className="text-xs text-gray-500">
              Manage lab test orders and patient results
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search by patient or order no"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          <Select
            value={filterStatus || "all"}
            onValueChange={(v) => {
              setFilterStatus(v === "all" ? "" : v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-sm w-[150px] bg-white border border-gray-200 rounded-md">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchLabOrders(currentPage)}
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
                  className="px-4 py-3 text-left text-[11px] font-semibold text-[#475467] cursor-pointer"
                  onClick={() => toggleSort("order_no")}
                >
                  Order No{" "}
                  {sortBy === "order_no" &&
                    (sortOrder === "ASC" ? (
                      <ChevronUp size={12} className="inline" />
                    ) : (
                      <ChevronDown size={12} className="inline" />
                    ))}
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#475467]">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#475467]">
                  Encounter
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#475467]">
                  Tests
                </th>
                <th
                  className="px-4 py-3 text-left text-[11px] font-semibold text-[#475467] cursor-pointer"
                  onClick={() => toggleSort("order_date")}
                >
                  Date{" "}
                  {sortBy === "order_date" &&
                    (sortOrder === "ASC" ? (
                      <ChevronUp size={12} className="inline" />
                    ) : (
                      <ChevronDown size={12} className="inline" />
                    ))}
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#475467]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#475467]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {displayOrders.length > 0 ? (
                displayOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-100 hover:bg-[#FBFBFF] transition-all"
                  >
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">
                      {order.order_no}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {order.patient
                        ? `${order.patient.first_name || ""} ${order.patient.last_name || ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {order.encounter?.encounter_no || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {(order.items || [])
                        .map((i) => i.test?.name || i.name)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2 rounded border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                          onClick={() => handleViewResults(order)}
                        >
                          View <ArrowRight size={13} className="ml-1" />
                        </Button>
                        {order.status !== "completed" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => handleMarkComplete(order.id)}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-gray-500 text-xs"
                  >
                    No lab test orders found.
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
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} orders
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
