// src/stock/pages/StockList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Settings,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import stockService from "../../service/stockService.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Loading from "../Loading.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedColumns, setSelectedColumns] = useState(
    ALL_COLUMNS.map((c) => c.key)
  );
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // bulk upload
  const [uploadedPreview, setUploadedPreview] = useState([]);
  const [bulkData, setBulkData] = useState([]);

  // --- Robust parser for varying API shapes ---
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
      rows = [];
      t = res?.total ?? 0;
    }

    return {
      rows: Array.isArray(rows) ? rows : [],
      total: Number(t || 0),
      page: Number(p || 1),
      limit: Number(l || limit),
    };
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
    if (key === "product_name")
      return row?.product?.product_name ?? row.product_name ?? "-";
    if (key === "product_code")
      return row?.product?.product_code ?? row.product_code ?? "-";
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
      const body = displayItems.map((r) =>
        selectedColumns.map((c) => {
          const v = getCellValue(r, c);
          if (c.toLowerCase().includes("price") && v !== "-") return `₹${v}`;
          return typeof v === "number" ? v.toString() : v ?? "-";
        })
      );

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
    <div className="p-2 sm:p-2 w-full h-full flex flex-col overflow-hidden text-sm rounded-lg">
      {loading && <Loading />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
              <Search size={20} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                Stock
              </h2>
              <p className="text-xs text-gray-500">Manage inventory — search, export or bulk upload</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search by product or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchStocks(1, searchQuery)}
          >
            <RefreshCw size={14} />
          </Button>

          <Button
            variant="outline"
            className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm border border-gray-200"
            onClick={() => setShowColumnModal(true)}
          >
            <Settings size={14} /> Columns
          </Button>

          <Button
            variant="outline"
            className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm border border-gray-200"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={14} /> Bulk Upload
          </Button>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={exportExcel}
            title="Export Excel"
          >
            <Download size={14} /> Export
          </Button>
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="flex-1 overflow-y-auto">
        <div className="overflow-x-auto rounded-md border border-gray-200 shadow-md bg-white">
          <div className="min-w-[600px]">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                <tr>
                  <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">S.No</th>
                  {selectedColumns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                      {ALL_COLUMNS.find((a) => a.key === col)?.title ?? col}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#475467]">Actions</th>
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
                    <tr key={row.id ?? idx} className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100">
                      <td className="px-4 py-3 text-[12px] text-center">{(currentPage - 1) * limit + idx + 1}</td>
                      {selectedColumns.map((col) => (
                        <td key={col} className="px-4 py-3 text-[12px]">
                          {(() => {
                            const v = getCellValue(row, col);
                            if (v === "-" || v === undefined || v === null) return "—";
                            if (col.toLowerCase().includes("price")) return `₹${v}`;
                            return v;
                          })()}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-xs text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/stock/view/${row.id}`)} title="View">
                            <Download size={14} />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(row.id)} title="Edit">
                            <RefreshCw size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} title="Delete">
                            <Plus style={{ transform: "rotate(45deg)" }} /> {/* subtle icon for delete fallback */}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedColumns.length + 2} className="py-6 text-center text-gray-500 text-[12px]">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3 mt-3">
          {loading ? (
            <p className="text-center text-gray-500 text-xs">Loading...</p>
          ) : displayItems.length > 0 ? (
            displayItems.map((row, idx) => (
              <article key={row.id ?? idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div>
                    <p className="font-semibold text-[#0E1680] text-sm">
                      {getCellValue(row, "product_name")}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{getCellValue(row, "product_code")}</p>
                    <p className="text-xs text-gray-600 mt-1">Qty: {getCellValue(row, "quantity")}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="text-[11px] text-gray-500">₹{getCellValue(row, "selling_price")}</div>
                    <div className="flex gap-1 mt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(row.id)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  {selectedColumns
                    .filter((c) => !["product_name", "product_code"].includes(c))
                    .slice(0, 4)
                    .map((c) => (
                      <div key={c}>
                        <div className="text-[11px] text-gray-500">{ALL_COLUMNS.find((a) => a.key === c)?.title}</div>
                        <div className="text-sm">{getCellValue(row, c)}</div>
                      </div>
                    ))}
                </div>
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500 text-xs">No products found.</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {startIndex}-{endIndex} of {total} items
        </p>

        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value));
              setCurrentPage(1);
            }}
          >
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

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="text-xs">
            <ChevronLeft />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className={`text-xs ${currentPage === i + 1 ? "bg-[#0E1680] text-white" : ""}`}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="text-xs">
            <ChevronRight />
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
