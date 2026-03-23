import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, RefreshCw, Search as SearchIcon, FileText, Eye, Trash2, ClipboardCheck, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import prescriptionService from "../../service/prescriptionService.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";

const DEFAULT_LIMIT = 10;

const statusColor = (s) => {
  const map = { draft: "bg-gray-100 text-gray-600", active: "bg-blue-100 text-blue-700", dispensed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-600" };
  return map[s?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
};

const computeTotal = (items = []) =>
  items.reduce((sum, it) => sum + parseFloat(it.total_price ?? (it.quantity && it.unit_price ? it.quantity * it.unit_price : 0) ?? 0), 0).toFixed(2);

export default function PrescriptionList() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  const fetchPrescriptions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await prescriptionService.getAllPrescriptions({
        page, limit,
        search: search || undefined,
        status: filterStatus || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      // res = { status, data: { total, currentPage, totalPages, data: [...] } }
      const payload = res?.data ?? res;
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      setItems(rows);
      setTotal(Number(payload?.total ?? 0));
      setCurrentPage(page);
    } catch (err) {
      toast.error("Failed to fetch prescriptions");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [limit, search, filterStatus, sortBy, sortOrder]);

  useEffect(() => { fetchPrescriptions(1); }, []);
  useEffect(() => { const t = setTimeout(() => fetchPrescriptions(1), 350); return () => clearTimeout(t); }, [search, fetchPrescriptions]);
  useEffect(() => { fetchPrescriptions(currentPage); }, [currentPage, limit, filterStatus, sortBy, sortOrder, fetchPrescriptions]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayItems = useMemo(() => items, [items]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === "ASC" ? "DESC" : "ASC");
    else { setSortBy(field); setSortOrder("ASC"); }
  };

  const handleView = async (rx) => {
    setModalLoading(true);
    setModalOpen(true);
    try {
      const res = await prescriptionService.getPrescriptionById(rx.id);
      const data = res?.data?.data ?? res?.data ?? res;
      setSelected(data);
      setModalStatus(data?.status ?? "pending");
    } catch {
      setSelected(rx);
      setModalStatus(rx?.status ?? "pending");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this prescription?")) return;
    try {
      await prescriptionService.deletePrescription(id);
      toast.success("Deleted");
      fetchPrescriptions(currentPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const saveStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await prescriptionService.updatePrescription(selected.id, { status: modalStatus });
      setSelected(s => ({ ...s, status: modalStatus }));
      setItems(prev => prev.map(it => it.id === selected.id ? { ...it, status: modalStatus } : it));
      toast.success("Status updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const exportPDF = (rx) => {
    if (!rx) return;
    const fmt = (v) => `Rs. ${v}`;
    try {
      const doc = new jsPDF({ unit: "pt", format: "A4" });
      doc.setFontSize(18); doc.text("Prescription", 40, 40);
      doc.setFontSize(11);
      const patName = rx.patient ? `${rx.patient.first_name ?? ""} ${rx.patient.last_name ?? ""}`.trim() : rx.patient_name ?? "—";
      const drName = rx.doctor?.doctor_name ?? rx.doctor_name ?? "—";
      doc.text(`Patient: ${patName}`, 40, 70);
      doc.text(`Doctor: ${drName}`, 40, 88);
      doc.text(`Date: ${rx.prescription_date ? dayjs(rx.prescription_date).format("DD MMM YYYY") : "—"}`, 40, 106);
      doc.text(`Status: ${rx.status ?? "—"}`, 40, 124);
      autoTable(doc, {
        startY: 150,
        head: [["Medicine", "Dose", "Frequency", "Qty", "Unit Price", "Total"]],
        body: (rx.items ?? []).map(it => [
          it.product?.product_name ?? it.medicine_name ?? "—",
          it.dosage ?? it.dose ?? "—", it.frequency ?? "—",
          it.quantity ?? 0,
          it.unit_price ? fmt(it.unit_price) : "—",
          it.total_price ? fmt(it.total_price) : it.quantity && it.unit_price ? fmt((it.quantity * it.unit_price).toFixed(2)) : "—",
        ]),
        styles: { fontSize: 10 },
      });
      const y = doc.lastAutoTable?.finalY ?? 300;
      doc.setFontSize(12);
      doc.text(`Total: ${fmt(computeTotal(rx.items))}`, 40, y + 24);
      doc.save(`prescription-${rx.id ?? "rx"}.pdf`);
      toast.success("PDF downloaded");
    } catch { toast.error("PDF export failed"); }
  };


  return (
    <div className="p-2 sm:p-4 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <ClipboardCheck size={20} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Prescriptions</h2>
            <p className="text-xs text-gray-500">View, filter and manage all prescriptions</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input placeholder="Search patient or doctor..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="bg-white h-9 pl-9 text-sm" />
          </div>
          <Select value={filterStatus || "all"} onValueChange={v => { setFilterStatus(v === "all" ? "" : v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 w-[140px] text-sm bg-white border-gray-200"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="dispensed">Dispensed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9" onClick={() => fetchPrescriptions(1)}>
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? <div className="flex justify-center py-20"><Loading /></div> : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
              <table className="w-full table-auto border-collapse min-w-[750px]">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    {["#", "Patient", "Doctor", "Date", "Medicines", "Total", "Status", "Actions"].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-left text-[12px] font-semibold text-[#475467] ${h === "Date" || h === "Total" ? "cursor-pointer" : ""}`}
                        onClick={() => h === "Date" ? toggleSort("prescription_date") : h === "Total" ? toggleSort("total_amount") : null}>
                        {h}
                        {h === "Date" && sortBy === "prescription_date" && (sortOrder === "ASC" ? <ChevronUp size={11} className="inline ml-1" /> : <ChevronDown size={11} className="inline ml-1" />)}
                        {h === "Total" && sortBy === "total_amount" && (sortOrder === "ASC" ? <ChevronUp size={11} className="inline ml-1" /> : <ChevronDown size={11} className="inline ml-1" />)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayItems.length > 0 ? displayItems.map((rx, idx) => {
                    const patName = rx.patient ? `${rx.patient.first_name ?? ""} ${rx.patient.last_name ?? ""}`.trim() : rx.patient_name ?? "—";
                    const drName = rx.doctor?.doctor_name ?? rx.doctor_name ?? "—";
                    return (
                      <tr key={rx.id ?? idx} className="border-t border-gray-100 hover:bg-[#FBFBFF] transition-colors">
                        <td className="px-4 py-3 text-[12px] text-gray-500">{(currentPage - 1) * limit + idx + 1}</td>
                        <td className="px-4 py-3 text-[12px] font-medium text-gray-800">{patName}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{drName}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{rx.prescription_date ? dayjs(rx.prescription_date).format("DD MMM YYYY") : "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{Array.isArray(rx.items) ? rx.items.length : "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">₹{rx.total_amount ?? rx.grand_total ?? computeTotal(rx.items)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(rx.status)}`}>{rx.status ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7 hover:bg-indigo-50 hover:text-indigo-600" onClick={() => handleView(rx)}><Eye size={13} /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600" onClick={() => exportPDF(rx)}><FileText size={13} /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(rx.id)}><Trash2 size={13} /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={8} className="py-10 text-center text-gray-400 text-xs">No prescriptions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3 mt-2">
              {displayItems.length > 0 ? displayItems.map((rx) => {
                const patName = rx.patient ? `${rx.patient.first_name ?? ""} ${rx.patient.last_name ?? ""}`.trim() : rx.patient_name ?? "—";
                return (
                  <article key={rx.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-[#0E1680] text-sm">{patName}</p>
                        <p className="text-xs text-gray-500">Dr. {rx.doctor?.doctor_name ?? rx.doctor_name ?? "—"}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(rx.status)}`}>{rx.status ?? "—"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-3">
                      <div><span className="text-gray-400">Date: </span>{rx.prescription_date ? dayjs(rx.prescription_date).format("DD MMM YYYY") : "—"}</div>
                      <div><span className="text-gray-400">Total: </span>₹{rx.total_amount ?? "0"}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 h-8 text-xs bg-[#506EE4] text-white" onClick={() => handleView(rx)}>View</Button>
                      <Button variant="outline" className="h-8 text-xs" onClick={() => exportPDF(rx)}><FileText size={13} /></Button>
                      <Button variant="outline" className="h-8 text-xs text-red-600 border-red-200" onClick={() => handleDelete(rx.id)}><Trash2 size={13} /></Button>
                    </div>
                  </article>
                );
              }) : <p className="text-center text-gray-400 text-xs py-6">No prescriptions found.</p>}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">Showing {total === 0 ? 0 : startIndex}–{endIndex} of {total}</p>
        <div className="flex items-center gap-2">
          <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-[110px] text-xs bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map(n => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={14} /></Button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <Button key={page} size="sm" variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)} className={`text-xs ${currentPage === page ? "bg-[#0E1680] text-white" : ""}`}>{page}</Button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>


      {/* View / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setModalOpen(false); setSelected(null); }} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl z-10 overflow-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {(selected?.patient ? `${selected.patient.first_name ?? ""}` : selected?.patient_name ?? "P").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">
                    {selected?.patient ? `${selected.patient.first_name ?? ""} ${selected.patient.last_name ?? ""}`.trim() : selected?.patient_name ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Dr. {selected?.doctor?.doctor_name ?? selected?.doctor_name ?? "—"} •{" "}
                    {selected?.prescription_date ? dayjs(selected.prescription_date).format("DD MMM YYYY") : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500">Status</label>
                  <select value={modalStatus} onChange={e => setModalStatus(e.target.value)} className="h-8 px-2 border rounded bg-white text-xs">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="dispensed">Dispensed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <Button variant="outline" className="h-8 text-xs" onClick={saveStatus} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                <Button className="h-8 text-xs bg-[#0E1680] text-white" onClick={() => exportPDF(selected)}><FileText size={13} className="mr-1" />PDF</Button>
                <Button variant="ghost" className="h-8 text-xs" onClick={() => { setModalOpen(false); setSelected(null); }}>Close</Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {modalLoading ? (
                <div className="flex justify-center py-12"><Loading /></div>
              ) : selected ? (
                <>
                  {/* Info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-xs">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-400 mb-1">Patient</p>
                      <p className="font-semibold text-gray-800">{selected.patient ? `${selected.patient.first_name ?? ""} ${selected.patient.last_name ?? ""}`.trim() : selected.patient_name ?? "—"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-400 mb-1">Doctor</p>
                      <p className="font-semibold text-gray-800">{selected.doctor?.doctor_name ?? selected.doctor_name ?? "—"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-400 mb-1">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(selected.status)}`}>{selected.status ?? "—"}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-400 mb-1">Total Amount</p>
                      <p className="font-bold text-gray-800">₹{computeTotal(selected.items)}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selected.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
                      <span className="font-semibold">Notes: </span>{selected.notes}
                    </div>
                  )}

                  {/* Medicines table */}
                  <p className="text-sm font-semibold text-gray-700 mb-2">Medicines</p>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-[#F6F7FF]">
                        <tr>
                          {["Medicine", "Dose", "Frequency", "Duration", "Qty", "Unit Price", "Total"].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-semibold text-[#475467]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(selected.items ?? []).length === 0 ? (
                          <tr><td colSpan={7} className="py-6 text-center text-gray-400">No medicines listed</td></tr>
                        ) : (selected.items ?? []).map((it, idx) => (
                          <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{it.product?.product_name ?? it.medicine_name ?? "—"}</td>
                            <td className="px-3 py-2">{it.dosage ?? it.dose ?? "—"}</td>
                            <td className="px-3 py-2">{it.frequency ?? "—"}</td>
                            <td className="px-3 py-2">{it.duration ?? "—"}</td>
                            <td className="px-3 py-2 text-right">{it.quantity ?? "—"}</td>
                            <td className="px-3 py-2 text-right">₹{it.unit_price ?? "—"}</td>
                            <td className="px-3 py-2 text-right font-medium">₹{it.total_price ?? (it.quantity && it.unit_price ? (it.quantity * it.unit_price).toFixed(2) : "—")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="mt-4 flex justify-end">
                    <div className="text-xs space-y-1 text-right min-w-[180px]">
                      <div className="flex justify-between gap-8 font-bold text-sm text-gray-800 border-t pt-1">
                        <span>Total</span>
                        <span>₹{computeTotal(selected.items)}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : <p className="text-center text-gray-400 py-8">No data</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
