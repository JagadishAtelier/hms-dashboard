import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Search, Edit2, Trash2, Package } from "lucide-react";
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

const typeBadgeVariant = (type) => {
  switch (type) {
    case "Service":
      return "info";
    case "Product":
      return "success";
    case "Medication":
      return "default";
    default:
      return "outline";
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
      const res = await billableItemService.getAll({ page: p, limit, search, type: typeFilter || undefined });
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
    return <div className="flex justify-center items-center h-[80vh]"><Loading /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Billable Catalogue"
        description={`${total} items configured — medical services, surgical products & medications.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Billing", href: "/billing" },
          { label: "Billable Items" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchItems(page)}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/billable-items/create")}
              className="gap-2"
            >
              <Plus size={14} /> Add Item
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item name or SKU..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Item Types</option>
            <option value="Service">Services</option>
            <option value="Product">Products</option>
            <option value="Medication">Medications</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-border/70 shadow-sm overflow-hidden bg-card">
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
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeBadgeVariant(item.type)} className="text-xs">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ₹{parseFloat(item.price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      ₹{parseFloat(item.cost || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {item.stock_tracking ? (
                        <span className="font-medium text-foreground">{item.current_stock}</span>
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
                ))
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
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => fetchItems(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

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
