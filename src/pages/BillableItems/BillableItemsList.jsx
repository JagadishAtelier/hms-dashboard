import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  Package,
  Stethoscope,
  Box,
  Pill,
  FlaskConical,
  Activity,
  Bed,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import billableItemService from "../../service/billableItemService.js";
import Loading from "../Loading.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import ConfirmDialog from "../../components/shared/ConfirmDialog.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/table.jsx";
import { cn } from "@/lib/utils";

const FILTER_TABS = [
  { label: "All Items", value: "" },
  { label: "Services", value: "Service" },
  { label: "Products", value: "Product" },
  { label: "Medications", value: "Medication" },
  { label: "Lab Tests", value: "LabTest" },
  { label: "Surgeries", value: "Surgery" },
  { label: "Rooms", value: "Room" },
];

const getTypeConfig = (type) => {
  switch (type) {
    case "Service":
      return {
        label: "Service",
        icon: Stethoscope,
        colorClass: "bg-blue-50 text-blue-700 border-blue-200/80",
        badgeVariant: "info",
      };
    case "Product":
      return {
        label: "Product",
        icon: Box,
        colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        badgeVariant: "success",
      };
    case "Medication":
      return {
        label: "Medication",
        icon: Pill,
        colorClass: "bg-purple-50 text-purple-700 border-purple-200/80",
        badgeVariant: "default",
      };
    case "LabTest":
      return {
        label: "Lab Test",
        icon: FlaskConical,
        colorClass: "bg-amber-50 text-amber-700 border-amber-200/80",
        badgeVariant: "warning",
      };
    case "Surgery":
      return {
        label: "Surgery",
        icon: Activity,
        colorClass: "bg-rose-50 text-rose-700 border-rose-200/80",
        badgeVariant: "destructive",
      };
    case "Room":
      return {
        label: "Room",
        icon: Bed,
        colorClass: "bg-orange-50 text-orange-700 border-orange-200/80",
        badgeVariant: "outline",
      };
    default:
      return {
        label: type || "General",
        icon: Package,
        colorClass: "bg-slate-50 text-slate-700 border-slate-200",
        badgeVariant: "outline",
      };
  }
};

export default function BillableItemsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Deletion modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchItems = async (p = 1) => {
    setLoading(true);
    try {
      const res = await billableItemService.getAll({
        page: p,
        limit,
        search,
        type: typeFilter || undefined,
      });
      const d = res?.data?.data;
      setItems(d?.data ?? []);
      setTotal(d?.total ?? 0);
      setPage(p);
    } catch {
      toast.error("Failed to load billable items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [search, typeFilter]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await billableItemService.delete(deleteId);
      toast.success("Billable item removed successfully");
      fetchItems(page);
    } catch {
      toast.error("Failed to delete billable item");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto pb-28 md:pb-8">
      <PageHeader
        title="Billable Catalogue"
        description={`${total} items configured — medical services, surgical products & medications.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Billing", href: "/billing" },
          { label: "Billable Items" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchItems(page)}
              disabled={loading}
              className="gap-1.5 h-9"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/billable-items/create")}
              className="gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
            >
              <Plus size={15} /> Add Item
            </Button>
          </div>
        }
      />

      {/* Filter and Search Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Bar with clear button */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item name, SKU or barcode..."
              className="pl-9 pr-9 h-10 text-sm rounded-xl border-slate-200 bg-white shadow-xs focus-visible:ring-indigo-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Desktop dropdown filter */}
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {FILTER_TABS.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Filter Pills */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar -mx-4 px-4">
          {FILTER_TABS.map((tab) => {
            const isActive = typeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setTypeFilter(tab.value)}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE VIEW: Touch-first Card List (<768px) */}
      <div className="md:hidden flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Package size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm mb-1">
              No billable items found
            </h4>
            <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
              {search || typeFilter
                ? "Try adjusting your search criteria or type filters to find what you're looking for."
                : "Your catalogue has no billable items yet. Create your first medical service or product."}
            </p>
            {search || typeFilter ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("");
                }}
                className="text-xs"
              >
                Clear all filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/billable-items/create")}
                className="bg-indigo-600 text-white text-xs"
              >
                <Plus size={14} className="mr-1" /> Add New Item
              </Button>
            )}
          </div>
        ) : (
          items.map((item) => {
            const typeConf = getTypeConfig(item.type);
            const TypeIcon = typeConf.icon;
            const price = parseFloat(item.price || 0).toFixed(2);
            const cost = parseFloat(item.cost || 0).toFixed(2);
            const isActive = item.status === "Active";

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:shadow-md transition-all active:scale-[0.99]"
              >
                {/* Card Top Row: Type Icon + Title + Status Badge */}
                <div className="flex items-start justify-between gap-2.5 mb-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "p-2 rounded-xl border shrink-0 mt-0.5",
                        typeConf.colorClass
                      )}
                    >
                      <TypeIcon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[11px] font-medium">
                          {item.sku || "NO-SKU"}
                        </span>
                        {item.category && (
                          <span className="text-slate-400 text-[11px] truncate">
                            • {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Chip */}
                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isActive ? "bg-emerald-500" : "bg-slate-400"
                      )}
                    />
                    {item.status || "Active"}
                  </span>
                </div>

                {/* Card Middle: Financials & Inventory Grid */}
                <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50/90 rounded-xl border border-slate-100 mb-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Selling Price
                    </div>
                    <div className="text-base font-bold text-indigo-600 mt-0.5 tabular-nums">
                      ₹{price}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Unit Cost
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1 tabular-nums">
                      ₹{cost}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Item Type
                    </div>
                    <div className="mt-1">
                      <span
                        className={cn(
                          "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                          typeConf.colorClass
                        )}
                      >
                        {typeConf.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Inventory / Stock
                    </div>
                    <div className="mt-1">
                      {item.stock_tracking ? (
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            item.current_stock <= (item.reorder_level || 5)
                              ? "text-amber-600"
                              : "text-emerald-700"
                          )}
                        >
                          {item.current_stock} in stock
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Non-tracked
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Row: Details & Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="text-[11px] text-slate-400">
                    {item.tax_rate ? `Tax: ${item.tax_rate}%` : "No Tax Applicable"}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/billable-items/edit/${item.id}`)}
                      className="h-8 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200/50"
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(item.id)}
                      className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors border border-rose-200/50"
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: High-density Table (>=768px) */}
      <Card className="hidden md:block border border-border/70 shadow-sm overflow-hidden bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-xs">Name</TableHead>
                <TableHead className="font-semibold text-xs">SKU</TableHead>
                <TableHead className="font-semibold text-xs">Type</TableHead>
                <TableHead className="font-semibold text-xs text-right">Price</TableHead>
                <TableHead className="font-semibold text-xs text-right">Cost</TableHead>
                <TableHead className="font-semibold text-xs">Stock</TableHead>
                <TableHead className="font-semibold text-xs">Status</TableHead>
                <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No billable items match your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const typeConf = getTypeConfig(item.type);
                  const TypeIcon = typeConf.icon;

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("p-1.5 rounded-lg border shrink-0", typeConf.colorClass)}>
                            <TypeIcon size={14} />
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border", typeConf.colorClass)}>
                          {typeConf.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ₹{parseFloat(item.price || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        ₹{parseFloat(item.cost || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {item.stock_tracking ? (
                          <span className={cn(
                            "font-medium",
                            item.current_stock <= (item.reorder_level || 5)
                              ? "text-amber-600 font-semibold"
                              : "text-foreground"
                          )}>
                            {item.current_stock}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 italic">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === "Active" ? "success" : "outline"}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(`/billable-items/edit/${item.id}`)}
                            title="Edit Item"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            onClick={() => setDeleteId(item.id)}
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
        <span>
          Showing page <strong className="text-foreground">{page}</strong> of{" "}
          <strong className="text-foreground">{totalPages}</strong>
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => fetchItems(page - 1)}
            className="gap-1 h-8 px-3"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => fetchItems(page + 1)}
            className="gap-1 h-8 px-3"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => navigate("/billable-items/create")}
        className="fixed bottom-20 right-4 z-40 md:hidden bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg shadow-indigo-600/30 rounded-full h-12 px-4 flex items-center gap-2 font-semibold text-xs transition-all"
        aria-label="Add Billable Item"
      >
        <Plus size={18} />
        <span>Add Item</span>
      </button>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Billable Item"
        description="Are you sure you want to remove this item from the hospital catalogue? This action cannot be undone."
        confirmText="Delete Item"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
