import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import labTestOrderService from "../../service/labtestorderService";

const DEFAULT_LIMIT = 10;

function LabTestList() {
  const navigate = useNavigate();

  // States
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Derived pagination data
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(total, page * limit);

  useEffect(() => {
    fetchLabOrders(page);
  }, [page, limit, status, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => fetchLabOrders(1), 400);
    return () => clearTimeout(delay);
  }, [search]);

  const fetchLabOrders = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit,
        search: search || undefined,
        status: status || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const res = await labTestOrderService.getAllLabTestOrders(params);
      const data = res?.data?.data || [];
      const totalCount = res?.data?.total || res?.data?.totalPages * limit || data.length;

      setLabOrders(data);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load lab test orders");
      setLabOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const displayOrders = useMemo(() => labOrders || [], [labOrders]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm bg-[#fff] border border-gray-300 rounded-lg shadow-[0_0_8px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">🧪 Lab Test Orders</h2>
          <p className="text-xs text-gray-500">Manage lab test orders and view patient results</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search by Order No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          <select
            className="h-9 border px-3 rounded-md bg-white w-full sm:w-auto text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          

          <Button
            className="bg-[#506EE4] text-white h-[36px] flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchLabOrders(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="min-w-[700px]">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Order No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Encounter</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Tests</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467] text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-xs text-gray-500">
                      Loading lab test orders...
                    </td>
                  </tr>
                ) : displayOrders.length > 0 ? (
                  displayOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FBFBFF] border-t border-gray-100">
                      <td className="px-4 py-3 text-xs font-medium">{order.order_no}</td>
                      <td className="px-4 py-3 text-xs">
                        {order.patient?.first_name} {order.patient?.last_name}
                        <div className="text-[11px] text-gray-500">{order.patient?.patient_code}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{order.encounter?.encounter_no || "—"}</td>
                      <td className="px-4 py-3 text-xs">
                        {order.items?.map((i) => i.test?.name).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{formatDate(order.order_date)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() =>
                            navigate(`/testresults/${order.encounter_id}`)
                          }
                        >
                          View <ArrowRight size={13} className="ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-xs text-gray-500">
                      No lab test orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} orders
        </p>

        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="h-8 text-xs border rounded px-2 bg-white"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="text-xs"
          >
            <ChevronLeft />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={page === i + 1 ? "default" : "outline"}
                onClick={() => setPage(i + 1)}
                className={`text-xs ${page === i + 1 ? "bg-[#506EE4] text-white" : ""}`}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="text-xs"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LabTestList;
