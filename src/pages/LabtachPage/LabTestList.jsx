// src/pages/lab/LabTestList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
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
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useNavigate, useLocation } from "react-router-dom";
import labTestOrderService from "../../service/labtestorderService";
import Loading from "../Loading.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import StatusBadge from "../../components/shared/StatusBadge.jsx";
import ConfirmDialog from "../../components/shared/ConfirmDialog.jsx";

const DEFAULT_LIMIT = 10;

export default function LabTestList() {
  const navigate = useNavigate();
  const location = useLocation();

  const [labOrders, setLabOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animateKey, setAnimateKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("status") || "";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState("order_date");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Complete Order dialog state
  const [completeOrderId, setCompleteOrderId] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

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

  const handleConfirmComplete = async () => {
    if (!completeOrderId) return;
    try {
      setCompleteLoading(true);
      if (labTestOrderService.markComplete)
        await labTestOrderService.markComplete(completeOrderId);
      else
        await labTestOrderService.update(completeOrderId, { status: "completed" });
      toast.success("Order marked as completed");
      fetchLabOrders(currentPage);
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark order complete");
    } finally {
      setCompleteLoading(false);
      setCompleteOrderId(null);
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

  if (loading && labOrders.length === 0)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loading />
      </div>
    );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Laboratory Test Orders"
        description={`${total} lab test orders and diagnostic investigations across departments.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laboratory" },
          { label: "Orders" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fetchLabOrders(currentPage)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input
            type="search"
            placeholder="Search patient or order number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filterStatus || "all"}
            onValueChange={(v) => {
              setFilterStatus(v === "all" ? "" : v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-sm w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="border border-border/70 shadow-sm overflow-hidden bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead
                    className="w-[120px] font-semibold text-xs cursor-pointer select-none"
                    onClick={() => toggleSort("order_no")}
                  >
                    Order No{" "}
                    {sortBy === "order_no" &&
                      (sortOrder === "ASC" ? (
                        <ChevronUp size={12} className="inline ml-1" />
                      ) : (
                        <ChevronDown size={12} className="inline ml-1" />
                      ))}
                  </TableHead>
                  <TableHead className="font-semibold text-xs">Patient</TableHead>
                  <TableHead className="font-semibold text-xs">Encounter</TableHead>
                  <TableHead className="font-semibold text-xs">Tests Requested</TableHead>
                  <TableHead
                    className="font-semibold text-xs cursor-pointer select-none"
                    onClick={() => toggleSort("order_date")}
                  >
                    Order Date{" "}
                    {sortBy === "order_date" &&
                      (sortOrder === "ASC" ? (
                        <ChevronUp size={12} className="inline ml-1" />
                      ) : (
                        <ChevronDown size={12} className="inline ml-1" />
                      ))}
                  </TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayOrders.length > 0 ? (
                  displayOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {order.order_no}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {order.patient
                          ? `${order.patient.first_name || ""} ${order.patient.last_name || ""}`.trim() || "—"
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {order.encounter?.encounter_no || "—"}
                      </TableCell>
                      <TableCell className="text-foreground text-xs max-w-xs truncate">
                        {(order.items || [])
                          .map((i) => i.test?.name || i.name)
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(order.order_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => handleViewResults(order)}
                          >
                            Results <ArrowRight size={13} />
                          </Button>
                          {order.status !== "completed" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => setCompleteOrderId(order.id)}
                            >
                              <CheckCircle2 size={13} /> Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FlaskConical className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium">No lab test orders found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-3">
        {displayOrders.length > 0 ? (
          displayOrders.map((order) => (
            <Card key={order.id} className="p-4 border-border/70 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-semibold text-primary">
                  #{order.order_no}
                </span>
                <StatusBadge status={order.status} />
              </div>

              <div className="text-xs space-y-1 text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Patient: </span>
                  {order.patient
                    ? `${order.patient.first_name || ""} ${order.patient.last_name || ""}`.trim() || "—"
                    : "—"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Encounter: </span>
                  {order.encounter?.encounter_no || "—"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Tests: </span>
                  {(order.items || [])
                    .map((i) => i.test?.name || i.name)
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Date: </span>
                  {formatDate(order.order_date)}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8"
                  onClick={() => handleViewResults(order)}
                >
                  Results <ArrowRight size={13} className="ml-1" />
                </Button>
                {order.status !== "completed" && (
                  <Button
                    size="sm"
                    className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setCompleteOrderId(order.id)}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            No lab test orders found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground pt-1">
        <p className="text-xs">
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
            <SelectTrigger className="h-8 w-[110px] text-xs">
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
            className="h-8 w-8 p-0"
          >
            <ChevronLeft size={14} />
          </Button>

          <span className="text-xs font-medium text-foreground px-1">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Confirm Complete Modal */}
      <ConfirmDialog
        open={Boolean(completeOrderId)}
        onOpenChange={(open) => !open && setCompleteOrderId(null)}
        title="Mark Lab Test Order as Completed"
        description="Are you sure you want to mark this diagnostic order as completed? Ensure all laboratory reports and results have been recorded."
        confirmText="Mark Completed"
        variant="default"
        loading={completeLoading}
        onConfirm={handleConfirmComplete}
      />
    </div>
  );
}
