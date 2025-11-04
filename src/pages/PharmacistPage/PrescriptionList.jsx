// src/prescription/pages/PrescriptionList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plus,
  RefreshCw,
  Search as SearchIcon,
  Download,
  FileText,
  Trash2,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import billingService from "../../service/billingService.js"; // <-- uses your billing service

const DEFAULT_LIMIT = 10;

const ALL_COLUMNS = [
  { title: "Prescription No", key: "prescription_no" },
  { title: "Patient", key: "patient_name" },
  { title: "Date", key: "prescription_date" },
  { title: "Doctor", key: "doctor_name" },
  { title: "Med Count", key: "med_count" },
  { title: "Total Amount", key: "total_amount" },
  { title: "Status", key: "status" },
];

export default function PrescriptionList() {
  const navigate = useNavigate();

  // data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // modal
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // editable fields inside modal
  const [modalStatus, setModalStatus] = useState("pending");
  const [modalPaymentMethod, setModalPaymentMethod] = useState("cash");

  // columns (user can toggle which visible columns)
  const [selectedColumns, setSelectedColumns] = useState(ALL_COLUMNS.map((c) => c.key));
  const [showColumnModal, setShowColumnModal] = useState(false);

  // robust response parser (like StockList)
  const robustParseResponse = (res) => {
    if (!res) return { rows: [], total: 0, page: 1, limit };
    const top = res?.data?.data ?? res?.data ?? res;
    let rows = [];
    let t = 0;
    let p = currentPage;
    let l = limit;

    if (top?.data && Array.isArray(top.data)) {
      rows = top.data;
      t = top.total ?? top.data.length ?? 0;
      p = top.page ?? res?.data?.page ?? p;
      l = top.limit ?? res?.data?.limit ?? l;
    } else if (Array.isArray(top)) {
      rows = top;
      t = res?.data?.total ?? res?.total ?? top.length ?? 0;
      p = res?.data?.page ?? res?.page ?? p;
      l = res?.data?.limit ?? res?.limit ?? l;
    } else if (Array.isArray(res?.data)) {
      rows = res.data;
      t = res.total ?? res.data.length ?? 0;
      p = res.page ?? p;
      l = res.limit ?? l;
    } else {
      // maybe object with rows
      if (Array.isArray(res?.rows)) {
        rows = res.rows;
        t = res.total ?? rows.length ?? 0;
        p = res.page ?? p;
        l = res.limit ?? l;
      } else {
        rows = [];
        t = res?.total ?? 0;
      }
    }

    return { rows: Array.isArray(rows) ? rows : [], total: Number(t || 0), page: Number(p || 1), limit: Number(l || limit) };
  };

  // fetch prescriptions
  const fetchPrescriptions = useCallback(
    async (page = 1, q = "") => {
      setLoading(true);
      try {
        const params = { page, limit, search: q || undefined };
        // if your billingService uses different param names, adapt them here
        const res = await (billingService.getAll ? billingService.getAll(params) : billingService.list(params));
        const { rows, total: t, page: p, limit: l } = robustParseResponse(res);
        // transform some fields for UI convenience
        const mapped = (rows || []).map((r) => ({
          ...r,
          prescription_no: r.prescription_no ?? r.billing_no ?? r.id ?? "-",
          patient_name: r.patient_name ?? r.customer_name ?? "-",
          prescription_date: r.prescription_date ?? r.billing_date ?? r.date ?? null,
          doctor_name: r.doctor_name ?? r.doctor ?? "-",
          med_count: Array.isArray(r.items) ? r.items.length : r.med_count ?? 0,
          total_amount: r.total_amount ?? r.total ?? 0,
          status: r.status ?? "unknown",
        }));
        setItems(mapped || []);
        setTotal(Number(t || 0));
        setCurrentPage(Number(p || page));
        setLimit(Number(l || limit));
      } catch (err) {
        console.error("Fetch prescriptions failed:", err);
        toast.error("Failed to fetch prescriptions");
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // initial load
  useEffect(() => {
    fetchPrescriptions(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchPrescriptions(1, searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery, fetchPrescriptions]);

  // page change
  useEffect(() => {
    fetchPrescriptions(currentPage, searchQuery);
  }, [currentPage, fetchPrescriptions]); // fetchPrescriptions depends on limit

  // derived
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayItems = useMemo(() => items || [], [items]);

  const getCellValue = (row, key) => {
    if (key === "patient_name") return row?.patient_name ?? "-";
    if (key === "prescription_date") return row?.prescription_date ? new Date(row.prescription_date).toLocaleString() : "-";
    if (key === "total_amount") return row?.total_amount ?? 0;
    if (key === "med_count") return row?.med_count ?? (Array.isArray(row.items) ? row.items.length : 0);
    if (key === "prescription_no") return row?.prescription_no ?? "-";
    if (key === "doctor_name") return row?.doctor_name ?? "-";
    if (key === "status") return (row?.status || "unknown").toString();
    return row?.[key] ?? "-";
  };

  // when selected changes, sync modal editable states
  useEffect(() => {
    if (selected) {
      setModalStatus((selected.status ?? "pending").toString());
      setModalPaymentMethod((selected.payment_method ?? "cash").toString());
    }
  }, [selected]);

  // actions
  const handleView = async (idOrRec) => {
    setModalLoading(true);
    try {
      let payload = null;
      if (typeof idOrRec === "object") {
        payload = idOrRec;
      } else {
        if (billingService.get) {
          const res = await billingService.get(idOrRec);
          payload = res?.data ?? res;
        } else if (billingService.find) {
          const res = await billingService.find(idOrRec);
          payload = res?.data ?? res;
        } else {
          // fallback to local
          payload = items.find((r) => r.id === idOrRec) ?? null;
        }
      }
      setSelected(payload);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to load prescription:", err);
      toast.error("Failed to load prescription");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (id) => navigate(`/prescription/edit/${id}`);
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return;
    try {
      if (billingService.remove) await billingService.remove(id);
      toast.success("Deleted");
      fetchPrescriptions(currentPage, searchQuery);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Delete failed");
    }
  };

  // Save modal changes (status + payment_method)
  const saveModalChanges = async () => {
    if (!selected) return;
    setModalLoading(true);
    try {
      const payload = {
        status: modalStatus,
        payment_method: modalPaymentMethod,
      };

      let res;
      if (billingService.update) {
        res = await billingService.update(selected.id, payload);
      } else if (billingService.patch) {
        res = await billingService.patch(selected.id, payload);
      } else if (billingService.edit) {
        res = await billingService.edit(selected.id, payload);
      } else {
        throw new Error("Update API not available on billingService");
      }

      const updated = res?.data ?? res ?? payload;

      // reflect locally
      setSelected((s) => ({ ...(s || {}), ...payload }));
      setItems((prev) => (prev || []).map((it) => (it.id === selected.id ? { ...it, ...payload } : it)));

      toast.success("Updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update");
    } finally {
      setModalLoading(false);
    }
  };

  // Excel export (visible columns)
  const exportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const header = selectedColumns.map((c) => ALL_COLUMNS.find((a) => a.key === c).title);
      const data = displayItems.map((r) =>
        selectedColumns.map((c) => {
          const v = getCellValue(r, c);
          if (c === "total_amount" && v !== "-") return Number(v);
          return v;
        })
      );
      const aoa = [header, ...data];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(wb, ws, "Prescriptions");
      XLSX.writeFile(wb, "prescriptions.xlsx");
      toast.success("Excel exported");
    } catch (err) {
      console.error("Excel export failed:", err);
      toast.error("Failed to export Excel");
    }
  };

  // PDF export of list
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Prescription List", 14, 16);

      const head = [selectedColumns.map((c) => ALL_COLUMNS.find((a) => a.key === c).title)];
      const body = displayItems.map((r) =>
        selectedColumns.map((c) => {
          const v = getCellValue(r, c);
          if (c === "total_amount" && v !== "-") return `₹${v}`;
          return typeof v === "number" ? v.toString() : v ?? "-";
        })
      );

      autoTable(doc, {
        startY: 22,
        head,
        body,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [14, 22, 128], textColor: 255 },
      });
      doc.save("prescriptions.pdf");
      toast.success("PDF exported");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Failed to export PDF");
    }
  };

  // Export currently selected prescription to PDF (modal)
  const exportPrescriptionPDF = (prescription) => {
    if (!prescription) return;
    try {
      const doc = new jsPDF({ unit: "pt", format: "A4" });
      doc.setFontSize(18);
      doc.text("Prescription", 40, 40);

      doc.setFontSize(12);
      doc.text(`Prescription No: ${prescription.prescription_no ?? prescription.billing_no ?? "-"}`, 40, 70);
      doc.text(`Patient: ${prescription.patient_name ?? prescription.customer_name ?? "-"}`, 40, 90);
      doc.text(`Doctor: ${prescription.doctor_name ?? "-"}`, 40, 110);
      doc.text(
        `Date: ${prescription.prescription_date ? new Date(prescription.prescription_date).toLocaleString() : "-"}`,
        40,
        130
      );

      const head = [["Medicine", "Dose", "Frequency", "Qty", "Price", "Total"]];
      const body = (prescription.items || []).map((it) => [
        it.product?.product_name ?? it.medicine_name ?? "-",
        it.dose ?? "-",
        it.frequency ?? "-",
        it.quantity ?? 0,
        it.unit_price ? `₹${it.unit_price}` : "-",
        it.total_price
          ? `₹${it.total_price}`
          : it.quantity && it.unit_price
          ? `₹${(it.quantity * it.unit_price).toFixed(2)}`
          : "-",
      ]);

      autoTable(doc, {
        startY: 160,
        head,
        body,
        styles: { fontSize: 10 },
      });

      const finalY = doc.lastAutoTable?.finalY || 330;
      doc.text(`Subtotal: ₹${prescription.subtotal_amount ?? "0.00"}`, 40, finalY + 18);
      doc.text(`Discount: ₹${prescription.discount_amount ?? "0.00"}`, 40, finalY + 34);
      doc.text(`Tax: ₹${prescription.tax_amount ?? "0.00"}`, 40, finalY + 50);
      doc.setFontSize(13);
      doc.text(`Total: ₹${prescription.total_amount ?? "0.00"}`, 40, finalY + 70);

      doc.save(`${prescription.prescription_no ?? "prescription"}.pdf`);
      toast.success("Prescription PDF downloaded");
    } catch (err) {
      console.error("Prescription PDF failed:", err);
      toast.error("Failed to export prescription PDF");
    }
  };

  // Export single prescription to Excel (modal)
  const exportPrescriptionExcel = (prescription) => {
    if (!prescription) return;
    try {
      const wb = XLSX.utils.book_new();
      const header = ["Medicine", "Dose", "Frequency", "Qty", "Unit Price", "Total"];
      const body = (prescription.items || []).map((it) => [
        it.product?.product_name ?? it.medicine_name ?? "-",
        it.dose ?? "-",
        it.frequency ?? "-",
        it.quantity ?? (it.qty ?? 0),
        it.unit_price ?? "-",
        it.total_price ?? (it.quantity && it.unit_price ? Number(it.quantity * it.unit_price) : "-"),
      ]);
      const aoa = [
        ["Prescription No", prescription.prescription_no ?? prescription.billing_no ?? "-"],
        ["Patient", prescription.patient_name ?? prescription.customer_name ?? "-"],
        ["Doctor", prescription.doctor_name ?? "-"],
        ["Date", prescription.prescription_date ? new Date(prescription.prescription_date).toLocaleString() : "-"],
        [],
        header,
        ...body,
        [],
        ["Subtotal", prescription.subtotal_amount ?? prescription.subtotal ?? 0],
        ["Discount", prescription.discount_amount ?? 0],
        ["Tax", prescription.tax_amount ?? 0],
        ["Total", prescription.total_amount ?? prescription.total ?? 0],
      ];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(wb, ws, "Prescription");
      XLSX.writeFile(wb, `${prescription.prescription_no ?? "prescription"}.xlsx`);
      toast.success("Prescription Excel downloaded");
    } catch (err) {
      console.error("Prescription Excel failed:", err);
      toast.error("Failed to export prescription Excel");
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">🩺 Prescriptions</h2>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white">
              <SearchIcon size={16} />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by patient, doctor, or prescription no..."
                className="h-9 text-sm outline-none"
              />
            </div>

            <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={() => fetchPrescriptions(currentPage, searchQuery)}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>

          <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={() => setShowColumnModal(true)}>
            <FileText size={14} /> Columns
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="min-w-[900px]">
            <table className="w-full table-auto border-collapse text-[#475467]">
              <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold">S.No</th>
                  {selectedColumns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold">
                      {ALL_COLUMNS.find((a) => a.key === col)?.title ?? col}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={selectedColumns.length + 2} className="py-6 text-center text-gray-500 text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : displayItems.length > 0 ? (
                  displayItems.map((row, idx) => (
                    <tr key={row.id ?? idx} className="hover:bg-[#FBFBFF] border-t border-gray-100">
                      <td className="px-4 py-3 text-xs">{(currentPage - 1) * limit + idx + 1}</td>
                      {selectedColumns.map((col) => (
                        <td key={col} className="px-4 py-3 text-xs">
                          {(() => {
                            const v = getCellValue(row, col);
                            if (v === "-" || v === undefined || v === null) return "—";
                            if (col === "total_amount") return `₹${v}`;
                            return v;
                          })()}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedColumns.length + 2} className="py-6 text-center text-gray-500 text-xs">
                      No prescriptions found.
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
          Showing {startIndex}-{endIndex} of {total} items
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft size={14} /> Prev
          </Button>
          <span className="text-xs">Page {currentPage} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Column Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white p-6 rounded-md w-96 z-10">
            <h3 className="text-lg font-semibold mb-4">Customize Columns</h3>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {ALL_COLUMNS.map((c) => (
                <label key={c.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(c.key)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedColumns((prev) => [...prev, c.key]);
                      else setSelectedColumns((prev) => prev.filter((k) => k !== c.key));
                    }}
                  />
                  <span>{c.title}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 bg-gray-300 rounded" onClick={() => setShowColumnModal(false)}>
                Cancel
              </button>
              <button className="px-3 py-2 bg-[#0E1680] text-white rounded" onClick={() => setShowColumnModal(false)}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal (custom) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setModalOpen(false); setSelected(null); }} />
          <div className="relative bg-white rounded-xl shadow-xl w-[92%] md:w-4/5 lg:w-3/4 z-20 overflow-auto max-h-[85vh]">
            {/* header */}
            <div className="flex items-center justify-between p-4 border-b gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#0ea5a4] flex items-center justify-center text-white font-bold">
                  { (selected?.patient_name || "P").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase() }
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{selected?.patient_name ?? "-"}</div>
                  <div className="text-xs text-gray-500">
                    Prescription <strong className="text-gray-700">{selected?.prescription_no ?? selected?.billing_no ?? "-"}</strong> •{" "}
                    {selected?.prescription_date ? new Date(selected.prescription_date).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Payment method select */}
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500 mr-1">Payment</label>
                  <select
                    value={modalPaymentMethod}
                    onChange={(e) => setModalPaymentMethod(e.target.value)}
                    className="h-9 px-2 border rounded bg-white text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                {/* Status select */}
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500 mr-1">Status</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="h-9 px-2 border rounded bg-white text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={saveModalChanges} disabled={modalLoading}>
                  Save
                </Button>

                <Button className="h-9 flex items-center gap-2 text-sm" onClick={() => exportPrescriptionPDF(selected)}>
                  <FileText size={14} /> PDF
                </Button>

                <Button variant="ghost" className="h-9" onClick={() => { setModalOpen(false); setSelected(null); }}>
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4">
              {modalLoading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <>
                  {/* Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500">Patient</div>
                      <div className="font-semibold">{selected?.patient_name ?? "-"}</div>
                      <div className="text-xs text-gray-500 mt-2">Doctor</div>
                      <div className="font-semibold">{selected?.doctor_name ?? "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="font-semibold">{(selected?.status || "unknown").toString()}</div>

                      <div className="text-xs text-gray-500 mt-2">Totals</div>
                      <div className="font-semibold">₹{selected?.total_amount ?? selected?.total ?? "0.00"}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <div className="font-semibold mb-2">Medicines</div>
                    <div className="overflow-auto border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs">Medicine</th>
                            <th className="px-3 py-2 text-left text-xs">Dose</th>
                            <th className="px-3 py-2 text-left text-xs">Freq</th>
                            <th className="px-3 py-2 text-right text-xs">Qty</th>
                            <th className="px-3 py-2 text-right text-xs">Unit</th>
                            <th className="px-3 py-2 text-right text-xs">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selected?.items || []).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-gray-500">No medicines listed.</td>
                            </tr>
                          ) : (
                            (selected.items || []).map((it, idx) => (
                              <tr key={it.id ?? idx} className="border-t">
                                <td className="px-3 py-2 text-xs">{it.product?.product_name ?? it.medicine_name ?? "-"}</td>
                                <td className="px-3 py-2 text-xs">{it.dose ?? "-"}</td>
                                <td className="px-3 py-2 text-xs">{it.frequency ?? "-"}</td>
                                <td className="px-3 py-2 text-right text-xs">{it.quantity ?? it.qty ?? 0}</td>
                                <td className="px-3 py-2 text-right text-xs">{it.unit_price ? `₹${it.unit_price}` : "-"}</td>
                                <td className="px-3 py-2 text-right text-xs">{it.total_price ? `₹${it.total_price}` : (it.quantity && it.unit_price ? `₹${(it.quantity * it.unit_price).toFixed(2)}` : "-")}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-full md:w-1/3">
                      <div className="flex justify-between text-sm text-gray-600"><div>Subtotal</div><div>₹{selected?.subtotal_amount ?? selected?.subtotal ?? "0.00"}</div></div>
                      <div className="flex justify-between text-sm text-gray-600"><div>Discount</div><div>₹{selected?.discount_amount ?? "0.00"}</div></div>
                      <div className="flex justify-between text-sm text-gray-600"><div>Tax</div><div>₹{selected?.tax_amount ?? "0.00"}</div></div>
                      <div className="flex justify-between text-base font-bold mt-2 bg-yellow-50 rounded p-2"><div>Total</div><div>₹{selected?.total_amount ?? selected?.total ?? "0.00"}</div></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
