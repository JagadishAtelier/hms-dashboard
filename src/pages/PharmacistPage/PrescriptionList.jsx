// src/prescription/pages/PrescriptionList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search as SearchIcon,
  FileText,
  Eye,
  Trash2,
  Plus,
  CalendarRange,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import billingService from "../../service/billingService.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "../Loading.jsx";

const DEFAULT_LIMIT = 10;

export default function PrescriptionList() {
  const navigate = useNavigate();

  // data + ui
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters / pagination / sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDoctorId, setFilterDoctorId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState("prescription_date");
  const [sortOrder, setSortOrder] = useState("DESC");

  // modal
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState("pending");
  const [modalPaymentMethod, setModalPaymentMethod] = useState("cash");

  // small helper: robust parse (handles many API shapes)
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
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          search: searchQuery || undefined,
          status: filterStatus || undefined,
          doctor_id: filterDoctorId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        };

        // support different service method names
        const res =
          (billingService.getAll ? await billingService.getAll(params) : null) ||
          (billingService.list ? await billingService.list(params) : null) ||
          (billingService.getAllPrescriptions ? await billingService.getAllPrescriptions(params) : null) ||
          (await billingService.get(params).catch(() => null));

        const { rows, total: t, page: p, limit: l } = robustParseResponse(res);
        const mapped = (rows || []).map((r) => ({
          ...r,
          prescription_no: r.prescription_no ?? r.billing_no ?? r.id ?? "-",
          patient_name: r.patient_name ?? r.customer_name ?? (r.patient ? `${r.patient.first_name || ""} ${r.patient.last_name || ""}`.trim() : "-"),
          prescription_date: r.prescription_date ?? r.billing_date ?? r.date ?? r.created_at ?? null,
          doctor_name: r.doctor_name ?? (r.doctor?.doctor_name) ?? r.doctor ?? "-",
          med_count: Array.isArray(r.items) ? r.items.length : r.med_count ?? 0,
          total_amount: r.total_amount ?? r.total ?? r.grand_total ?? 0,
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
    [limit, searchQuery, filterStatus, filterDoctorId, startDate, endDate, sortBy, sortOrder]
  );

  // initial + deps
  useEffect(() => {
    fetchPrescriptions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchPrescriptions(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery, fetchPrescriptions]);

  // change page/limit or filters triggers fetch
  useEffect(() => {
    fetchPrescriptions(currentPage);
  }, [currentPage, limit, filterStatus, filterDoctorId, startDate, endDate, sortBy, sortOrder, fetchPrescriptions]);

  // derived
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayItems = useMemo(() => items || [], [items]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

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
          payload = items.find((r) => r.id === idOrRec) ?? null;
        }
      }
      setSelected(payload);
      setModalStatus((payload?.status ?? "pending").toString());
      setModalPaymentMethod((payload?.payment_method ?? "cash").toString());
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
      fetchPrescriptions(currentPage);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Delete failed");
    }
  };

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

  // export functions (re-using your previous logic)
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
    <div className="p-2 sm:p-4 w-full h-full flex flex-col overflow-hidden text-sm rounded-lg">
      {loading && <Loading />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
              <CalendarRange size={20} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Prescriptions</h2>
              <p className="text-xs text-gray-500">Manage prescriptions — search, filter, and export</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search patient, doctor, prescription no"
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
            onValueChange={(value) => {
              setFilterStatus(value === "all" ? "" : value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-auto text-sm border border-gray-200 bg-white rounded-md shadow-sm hover:bg-gray-50">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-md border border-gray-100 bg-white text-sm">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchPrescriptions(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-md bg-white">
            <div className="min-w-[700px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">No</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">Prescription</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">Patient</th>
                    <th
                      className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("prescription_date")}
                      title={`Sort by ${sortBy === "prescription_date" && sortOrder === "ASC" ? "descending" : "ascending"}`}
                    >
                      Date{" "}
                      {sortBy === "prescription_date" ? (
                        sortOrder === "ASC" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        ""
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("total_amount")}
                    >
                      Total {sortBy === "total_amount" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">Doctor</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">Status</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500 text-xs">Loading prescriptions...</td>
                    </tr>
                  ) : displayItems.length > 0 ? (
                    displayItems.map((item, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100">
                        <td className="px-4 py-3 text-center text-[10px]">{(currentPage - 1) * limit + idx + 1}</td>
                        <td className="px-4 py-3 text-center text-[10px] font-medium">{item.prescription_no}</td>
                        <td className="px-4 py-3 text-center text-[10px]">{item.patient_name || "—"}</td>
                        <td className="px-4 py-3 text-center text-[10px]">{formatDate(item.prescription_date)}</td>
                        <td className="px-4 py-3 text-center text-[10px]">₹{item.total_amount ?? 0}</td>
                        <td className="px-4 py-3 text-center text-[10px]">{item.doctor_name || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.status === "pending" ? "bg-yellow-100 text-yellow-700" : item.status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
                              <Eye size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500 text-[10px]">No prescriptions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3 mt-3">
          {loading ? (
            <p className="text-center text-gray-500 text-xs">Loading prescriptions...</p>
          ) : displayItems.length > 0 ? (
            displayItems.map((item) => (
              <article key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div>
                    <p className="font-semibold text-[#0E1680] text-sm">{item.prescription_no}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.patient_name || "—"}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 text-[11px] rounded-full ${item.status === "pending" ? "bg-yellow-100 text-yellow-700" : item.status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{item.status}</span>
                    <span className="text-[11px] text-gray-500">{formatDate(item.prescription_date)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div>
                    <div className="text-[11px] text-gray-500">Doctor</div>
                    <div className="text-sm">{item.doctor_name || "—"}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">Items</div>
                    <div className="text-sm">{item.med_count ?? 0}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-[11px] text-gray-500">Total</div>
                    <div className="text-sm">₹{item.total_amount ?? 0}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex gap-2">
                      <Button className="bg-[#0E1680] text-white w-full text-sm" onClick={() => handleView(item)}>View</Button>
                      <Button variant="ghost" className="w-14" onClick={() => handleDelete(item.id)}><Trash2 /></Button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500 text-xs">No prescriptions found.</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} prescriptions</p>

        <div className="flex items-center gap-2">
          <Select value={String(limit)} onValueChange={(value) => { setLimit(Number(value)); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-[110px] text-xs border border-gray-200 bg-white rounded shadow-sm">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-md border border-gray-100 bg-white text-xs">
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="text-xs"><ChevronLeft /></Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} size="sm" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)} className={`text-xs ${currentPage === i + 1 ? "bg-[#0E1680] text-white" : ""}`}>
                {i + 1}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="text-xs"><ChevronRight /></Button>
        </div>
      </div>

      {/* View Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setModalOpen(false); setSelected(null); }} />
          <div className="relative bg-white rounded-xl shadow-xl w-[92%] md:w-4/5 lg:w-3/4 z-20 overflow-auto max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#0ea5a4] flex items-center justify-center text-white font-bold">
                  {(selected?.patient_name || "P").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{selected?.patient_name ?? "-"}</div>
                  <div className="text-xs text-gray-500">
                    Prescription <strong className="text-gray-700">{selected?.prescription_no ?? selected?.billing_no ?? "-"}</strong> • {selected?.prescription_date ? new Date(selected.prescription_date).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500 mr-1">Payment</label>
                  <select value={modalPaymentMethod} onChange={(e) => setModalPaymentMethod(e.target.value)} className="h-9 px-2 border rounded bg-white text-sm">
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500 mr-1">Status</label>
                  <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value)} className="h-9 px-2 border rounded bg-white text-sm">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={saveModalChanges} disabled={modalLoading}>Save</Button>

                <Button className="h-9 flex items-center gap-2 text-sm" onClick={() => exportPrescriptionPDF(selected)}>
                  <FileText size={14} /> PDF
                </Button>

                <Button variant="ghost" className="h-9" onClick={() => { setModalOpen(false); setSelected(null); }}>Close</Button>
              </div>
            </div>

            <div className="p-4">
              {modalLoading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <>
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
