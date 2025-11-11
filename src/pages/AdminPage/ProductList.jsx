// src/pages/products/ProductList.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  Plus,
  DownloadCloud,
  ChevronUp,
  ChevronDown,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import productService from "../../service/productService.js";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import Loading from "../Loading.jsx";

const DEFAULT_LIMIT = 10;

export default function ProductList() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters + pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  const qrRefs = useRef({});

  // helper to normalize API response
  const robustParseProductResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res?.data?.data ?? res?.data ?? res;
    if (top?.data && Array.isArray(top.data))
      return { rows: top.data, total: top.total ?? top.data.length ?? 0 };
    if (Array.isArray(top)) return { rows: top, total: top.length ?? 0 };
    if (Array.isArray(res?.data))
      return { rows: res.data, total: res.total ?? res.data.length ?? 0 };
    return { rows: [], total: 0 };
  };

  // fetch products
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

      const fn =
        productService.getAllProducts ??
        productService.getAll ??
        productService.listProducts ??
        productService;

      const resp =
        typeof fn === "function" ? await fn(params) : await productService.getAll(params);

      const { rows, total: totalVal } = robustParseProductResponse(resp);
      setProducts(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch products");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // fetch when sorting/pagination changes
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
      else throw new Error("Delete method not found");
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

  const downloadQR = (id, code) => {
    const canvas = qrRefs.current[id]?.querySelector("canvas");
    if (!canvas) return toast.error("QR not ready");
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = `${code || id}.png`;
    link.click();
  };

  const downloadAllQRPDF = () => {
    const pdf = new jsPDF();
    let x = 10,
      y = 20,
      size = 40;
    products.forEach((p) => {
      const canvas = qrRefs.current[p.id]?.querySelector("canvas");
      if (canvas) {
        const imgData = canvas.toDataURL("image/png");
        pdf.setFontSize(10);
        pdf.text(p.product_code || p.product_name || "", x, y - 2);
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

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayProducts = useMemo(() => products || [], [products]);

  return (
    <div className="p-2 sm:p-2 w-full h-full flex flex-col overflow-hidden text-sm rounded-lg">
      {loading && <Loading />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <Package className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Products</h2>
            <p className="text-xs text-gray-500">Manage your inventory — edit, delete, or print QR codes</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search by name, code, or brand"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => navigate("/product/create")}
          >
            <Plus size={14} /> Add Product
          </Button>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 text-sm"
            onClick={() => fetchProducts(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-md bg-white">
            <div className="min-w-[800px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    {[
                      { field: "product_name", label: "Name" },
                      { field: "product_code", label: "Code" },
                      { field: "purchase_price", label: "Purchase" },
                      { field: "selling_price", label: "Selling" },
                    ].map((col) => (
                      <th
                        key={col.field}
                        className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467] cursor-pointer"
                        onClick={() => toggleSort(col.field)}
                      >
                        {col.label}{" "}
                        {sortBy === col.field ? (
                          sortOrder === "ASC" ? (
                            <ChevronUp size={12} className="inline-block" />
                          ) : (
                            <ChevronDown size={12} className="inline-block" />
                          )
                        ) : (
                          ""
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">Brand</th>
                    <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">Category</th>
                    <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">QR Code</th>
                    <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#475467]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-[12px]">
                        Loading products...
                      </td>
                    </tr>
                  ) : displayProducts.length > 0 ? (
                    displayProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-center text-[12px] font-medium">{p.product_name}</td>
                        <td className="px-4 py-3 text-center text-[12px]">{p.product_code}</td>
                        <td className="px-4 py-3 text-center text-[12px]">₹{p.purchase_price ?? "—"}</td>
                        <td className="px-4 py-3 text-center text-[12px]">₹{p.selling_price ?? "—"}</td>
                        <td className="px-4 py-3 text-center text-[12px]">{p.brand || "—"}</td>
                        <td className="px-4 py-3 text-center text-[12px]">{p.category_name || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <div ref={(el) => (qrRefs.current[p.id] = el)} className="flex items-center justify-center">
                            <QRCodeCanvas value={p.product_code || ""} size={40} level="H" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => navigate(`/product/edit/${p.id}`)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => handleDelete(p.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
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
                className={`text-xs ${currentPage === i + 1 ? "bg-[#506EE4] text-white" : ""}`}
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
