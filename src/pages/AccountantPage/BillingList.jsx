import React, { useEffect, useState } from "react";
import { RefreshCw, ReceiptText, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import billingService from "../../service/billingService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";
import PageHeader from "../../components/shared/PageHeader.jsx";
import StatusBadge from "../../components/shared/StatusBadge.jsx";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/table.jsx";
import { Button } from "../../components/ui/button.jsx";

export default function BillingList() {
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  const fetchBills = async (p = 1) => {
    setLoading(true);
    try {
      const res = await billingService.getAll({ page: p, limit });
      const d = res?.data;
      setBills(Array.isArray(d?.data) ? d.data : []);
      setTotal(d?.total ?? 0);
      setPage(p);
    } catch {
      toast.error("Failed to load billing records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(1); }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading && bills.length === 0) {
    return <div className="flex justify-center items-center h-[80vh]"><Loading /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Billing Records"
        description={`${total} total billing and payment records across departments.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Accountant" },
          { label: "Billing" }
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBills(page)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <Card className="border border-border/70 shadow-sm overflow-hidden bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[120px] font-semibold text-xs">Bill No</TableHead>
                <TableHead className="font-semibold text-xs">Customer / Patient</TableHead>
                <TableHead className="font-semibold text-xs">Type</TableHead>
                <TableHead className="font-semibold text-xs text-right">Total Amount</TableHead>
                <TableHead className="font-semibold text-xs text-right">Paid</TableHead>
                <TableHead className="font-semibold text-xs text-right">Due</TableHead>
                <TableHead className="font-semibold text-xs">Payment Method</TableHead>
                <TableHead className="font-semibold text-xs">Status</TableHead>
                <TableHead className="font-semibold text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ReceiptText className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No billing records found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bills.map(b => (
                  <TableRow key={b.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {b.billing_no}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {b.customer_name || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize text-xs">
                      {b.type?.replace(/_/g, " ") || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ₹{parseFloat(b.total_amount || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                      ₹{parseFloat(b.paid_amount || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-medium text-rose-600 dark:text-rose-400">
                      ₹{parseFloat(b.due_amount || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize text-xs">
                      {b.payment_method?.replace(/_/g, " ") || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {dayjs(b.billing_date).format("DD MMM YYYY")}
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
            onClick={() => fetchBills(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => fetchBills(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
