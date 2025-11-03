// src/stock/pages/StockList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Settings,
  Search as SearchIcon,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import stockService from "../../service/stockService.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const DEFAULT_LIMIT = 10;

const ALL_COLUMNS = [
  { title: "Product Name", key: "product_name" },
  { title: "Product Code", key: "product_code" },
  { title: "Quantity", key: "quantity" },
  { title: "Unit", key: "unit" },
  { title: "Cost Price", key: "cost_price" },
  { title: "Selling Price", key: "selling_price" },
  { title: "Return Qty", key: "return_quantity" },
  { title: "Inward Qty", key: "inward_quantity" },
  { title: "Billing Qty", key: "billing_quantity" },
  { title: "Customer Billing Qty", key: "customer_billing_quantity" },
];

export default function StockList() {
  const navigate = useNavigate();

  // data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // columns & modals
  const [selectedColumns, setSelectedColumns] = useState(ALL_COLUMNS.map((c) => c.key));
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // bulk upload
  const [uploadedPreview, setUploadedPreview] = useState([]);
  const [bulkData, setBulkData] = useState([]);

  // --- Robust parser for varying API shapes ---
  const robustParseResponse = (res) => {
    if (!res) return { rows: [], total: 0, page: 1, limit };
    // common shapes:
    // 1) res.data.data = { data: [...], total, page, limit }
    // 2) res.data = [...]; res.total
    // 3) res = { data: [...], total }
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
      rows = [];
      t = res?.total ?? 0;
    }

    return { rows: Array.isArray(rows) ? rows : [], total: Number(t || 0), page: Number(p || 1), limit: Number(l || limit) };
  };

  // --- Fetch stocks ---
  const fetchStocks = useCallback(
    async (page = 1, q = "") => {
      setLoading(true);
      try {
        const params = { page, limit, search: q || undefined };
        const res = await stockService.getAll(params);
        const { rows, total: t, page: p, limit: l } = robustParseResponse(res);
        setItems(rows || []);
        setTotal(Number(t || 0));
        setCurrentPage(Number(p || page));
        setLimit(Number(l || limit));
      } catch (err) {
        console.error("Fetch stocks failed:", err);
        toast.error("Failed to fetch stocks");
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
    fetchStocks(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchStocks(1, searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery, fetchStocks]);

  // page change
  useEffect(() => {
    fetchStocks(currentPage, searchQuery);
  }, [currentPage, fetchStocks]); // fetchStocks already depends on limit

  // --- Derived values / helpers ---
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayItems = useMemo(() => items || [], [items]);

  const getCellValue = (row, key) => {
    if (key === "product_name") return row?.product?.product_name ?? row.product_name ?? "-";
    if (key === "product_code") return row?.product?.product_code ?? row.product_code ?? "-";
    // numeric fields may be string, convert when possible
    const val = row?.[key];
    if (val === 0) return 0;
    if (val === undefined || val === null || val === "") return "-";
    return val;
  };

  // --- Excel export (visible columns) ---
  const exportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const data = [
        selectedColumns.map((c) => ALL_COLUMNS.find((a) => a.key === c).title),
        ...displayItems.map((r) => selectedColumns.map((c) => getCellValue(r, c))),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Stock");
      XLSX.writeFile(wb, "stock_list.xlsx");
    } catch (err) {
      console.error("Excel export failed:", err);
      toast.error("Failed to export Excel");
    }
  };

  // --- PDF export (visible columns) ---
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Stock List", 14, 16);

      const head = [selectedColumns.map((c) => ALL_COLUMNS.find((a) => a.key === c).title)];
      const body = displayItems.map((r) => selectedColumns.map((c) => {
        const v = getCellValue(r, c);
        if (c.toLowerCase().includes("price") && v !== "-" ) return `₹${v}`;
        return typeof v === "number" ? v.toString() : (v ?? "-");
      }));

      doc.autoTable({
        startY: 22,
        head,
        body,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [28, 34, 68], textColor: 255 },
      });

      doc.save("stock_list.pdf");
    } catch (err) {
      console.warn("PDF export needs jspdf + autotable installed", err);
      toast.error("Failed to export PDF (ensure jspdf + jspdf-autotable are installed)");
    }
  };

  // --- Bulk upload handlers ---
  const handleFileInput = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setBulkData(jsonData);
        setUploadedPreview(jsonData.slice(0, 200)); // preview first 200 rows
        toast.success("Excel loaded. Preview ready. Click Save to upload.");
      } catch (err) {
        console.error("Invalid Excel file", err);
        toast.error("Invalid Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveBulkUpload = async () => {
    if (!bulkData || bulkData.length === 0) {
      toast.error("No data to save");
      return;
    }
    setLoading(true);
    try {
      if (!stockService.createBulk) {
        console.warn("stockService.createBulk not implemented");
        toast.error("Bulk upload not supported by service");
        setLoading(false);
        return;
      }
      await stockService.createBulk(bulkData);
      toast.success("Bulk upload saved");
      setShowUploadModal(false);
      setBulkData([]);
      setUploadedPreview([]);
      fetchStocks(1, "");
    } catch (err) {
      console.error("Bulk save failed", err);
      toast.error("Failed to save bulk upload");
    } finally {
      setLoading(false);
    }
  };

  // row actions (edit/delete)
  const handleEdit = (id) => navigate(`/stock/edit/${id}`);
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      if (stockService.remove) await stockService.remove(id);
      toast.success("Deleted");
      fetchStocks(currentPage, searchQuery);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Delete failed");
    }
  };

  // download sample file (public path)
  const handleDownloadSample = () => {
    const a = document.createElement("a");
    a.href = "/bulk_stock_upload.xlsx";
    a.download = "bulk_stock_upload.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="p-4 sm:p-6 w-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">📊 Stock</h2>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white">
              <SearchIcon size={16} />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by product or code..."
                className="h-9 text-sm outline-none"
              />
            </div>

            <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={() => fetchStocks(currentPage, searchQuery)}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>

          <Button className="bg-[#0E1680] text-white h-9 flex items-center gap-2 text-sm" onClick={() => navigate("/stock/create")}>
            <Plus size={14} /> Add Stock
          </Button>

          <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={() => setShowColumnModal(true)}>
            <Settings size={14} /> Columns
          </Button>

          <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={() => setShowUploadModal(true)}>
            <Upload size={14} /> Bulk Upload
          </Button>

          <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={exportExcel}>
            <Download size={14} /> Export Excel
          </Button>

          <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={exportPDF}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="min-w-[1000px]">
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
                            if (col.toLowerCase().includes("price")) return `₹${v}`;
                            return v;
                          })()}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/stock/view/${row.id}`)}>
                            <Download size={14} />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(row.id)}>
                            <RefreshCw size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedColumns.length + 2} className="py-6 text-center text-gray-500 text-xs">
                      No products found.
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

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white p-6 rounded-md w-11/12 md:w-3/4 lg:w-1/2 z-10">
            <h3 className="text-lg font-semibold mb-4">Bulk Upload Stock</h3>

            <div className="flex gap-2 mb-3">
              <Button className="flex items-center gap-2" onClick={handleDownloadSample}>
                <Download size={16} /> Download Sample
              </Button>

              <label className="flex items-center gap-2 cursor-pointer bg-gray-200 px-3 py-2 rounded">
                <Upload size={16} /> Select Excel
                <input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileInput(e.target.files?.[0])} className="hidden" />
              </label>
            </div>

            <div className="max-h-64 overflow-auto border rounded p-2">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {uploadedPreview.length > 0 ? Object.keys(uploadedPreview[0]).slice(0, 10).map((k) => <th key={k} className="py-2 px-3 border-b text-left">{k}</th>) : <th className="py-2 px-3">No file selected</th>}
                  </tr>
                </thead>
                <tbody>
                  {uploadedPreview.slice(0, 20).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {Object.values(row).slice(0, 10).map((val, cIdx) => <td key={cIdx} className="py-2 px-3 border-b">{val?.toString?.() ?? "-"}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-2 bg-gray-300 rounded" onClick={() => { setShowUploadModal(false); setBulkData([]); setUploadedPreview([]); }}>
                Cancel
              </button>
              <button className="px-3 py-2 bg-[#0E1680] text-white rounded" onClick={saveBulkUpload}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
