// src/pages/products/ProductList.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  DownloadCloud,
} from "lucide-react";
import { toast } from "sonner";
import productService from "../../service/productService.js";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";

const DEFAULT_LIMIT = 10;

export default function ProductList() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  const qrRefs = useRef({});

  // Robustly parse different response shapes
  const robustParseProductResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res?.data?.data ?? res?.data ?? res;
    if (top?.data && Array.isArray(top.data)) return { rows: top.data, total: top.total ?? top.data.length ?? 0 };
    if (Array.isArray(top)) return { rows: top, total: top.length ?? 0 };
    if (Array.isArray(res?.data)) return { rows: res.data, total: res.total ?? res.data.length ?? 0 };
    return { rows: [], total: 0 };
  };

  // Fetch products
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // try common method names
      const fn =
        productService.getAllProducts ??
        productService.getAll ??
        productService.listProducts ??
        productService;

      const resp = typeof fn === "function" ? await fn(params) : await productService.getAll(params);
      const { rows, total: totalVal } = robustParseProductResponse(resp);

      setProducts(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch products");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // debounce search like your other lists
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      setLoading(true);
      if (productService.deleteProduct) await productService.deleteProduct(id);
      else if (productService.remove) await productService.remove(id);
      else if (productService.delete) await productService.delete(id);
      else throw new Error("Delete method not found on productService");

      toast.success("Product deleted successfully");
      fetchProducts(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
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

  // QR downloads
  const downloadQR = (id, code) => {
    const canvas = qrRefs.current[id]?.querySelector("canvas");
    if (!canvas) {
      toast.error("QR not ready");
      return;
    }
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = `${code || id}.png`;
    link.click();
  };

  const downloadAllQRPDF = () => {
    const pdf = new jsPDF();
    let x = 10;
    let y = 20;
    const size = 40;

    products.forEach((product) => {
      const canvas = qrRefs.current[product.id]?.querySelector("canvas");
      if (canvas) {
        const imgData = canvas.toDataURL("image/png");
        pdf.setFontSize(10);
        pdf.text(product.product_code || product.product_name || "", x, y - 2);
        pdf.addImage(imgData, "PNG", x, y, size, size);
        x += size + 25;
        if (x + size > 200) {
          x = 10;
          y += size + 25;
        }
      }
    });

    pdf.save("product_qrcodes.pdf");
  };

  // derived values for pagination UI
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayProducts = useMemo(() => products || [], [products]);

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">📦 Products</h2>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name / code / brand..."
              className="h-9 px-3 border rounded w-72 text-sm"
            />
            <Button
              variant="outline"
              className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
              onClick={() => fetchProducts(currentPage)}
            >
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>

          <Button
            className="bg-green-600 text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => navigate("/product/create")}
          >
            <Plus size={14} /> Add Product
          </Button>

          <Button variant="outline" className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm" onClick={downloadAllQRPDF}>
            <DownloadCloud size={14} /> Download All QR PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[1000px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("product_name")}
                    >
                      Name {sortBy === "product_name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("product_code")}
                    >
                      Code {sortBy === "product_code" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">QR Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Category</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("purchase_price")}
                    >
                      Price {sortBy === "purchase_price" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("selling_price")}
                    >
                      Selling Price {sortBy === "selling_price" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500 text-xs">
                        Loading products...
                      </td>
                    </tr>
                  ) : displayProducts.length > 0 ? (
                    displayProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">{p.product_name}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{p.product_code}</td>

                        <td className="px-4 py-3">
                          <div ref={(el) => (qrRefs.current[p.id] = el)} className="flex items-center">
                            <QRCodeCanvas value={p.product_code || ""} size={56} level="H" />
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 ml-2"
                              onClick={() => downloadQR(p.id, p.product_code)}
                              title="Download QR"
                            >
                              <DownloadCloud size={14} />
                            </Button>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-700">{p.brand || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{p.category_name || "—"}</td>

                        <td className="px-4 py-3 text-xs text-gray-700">
                          {p.purchase_price != null ? `₹${p.purchase_price}` : "—"}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-700">
                          {p.selling_price != null ? `₹${p.selling_price}` : "—"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => navigate(`/product/edit/${p.id}`)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            <Button
                              variant="ghost"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleDelete(p.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500 text-xs">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="md:hidden mt-4">
        <div className="space-y-3">
          {loading ? (
            <div className="py-4 text-center text-gray-500 text-xs">Loading products...</div>
          ) : displayProducts.length > 0 ? (
            displayProducts.map((p) => (
              <div key={p.id} className="p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">{p.product_name}</div>
                    <div className="text-xs text-gray-600">{p.product_code}</div>
                    <div className="text-xs text-gray-600 mt-1">{p.brand ? `${p.brand} • ${p.category_name || "—"}` : (p.category_name || "—")}</div>
                    <div className="text-xs text-gray-700 mt-1">₹{p.selling_price ?? "—"}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div ref={(el) => (qrRefs.current[p.id] = el)}>
                      <QRCodeCanvas value={p.product_code || ""} size={56} level="H" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/product/edit/${p.id}`)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500 text-xs">No products found.</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} products
        </p>

        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 text-xs border rounded px-2 bg-white"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="text-xs"
          >
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
