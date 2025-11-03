// src/inward/pages/InwardCreate.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, ArrowLeft } from "lucide-react";
import dayjs from "dayjs";

import inwardService from "../../service/inwardService";
import vendorService from "../../service/vendorService.js";
import productService from "../../service/productService.js";
import orderService from "../../service/orderService.js";

export default function InwardCreate() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState({ qty: 0, value: 0, count: 0 });

  const [form, setForm] = useState({
    vendor_id: "",
    order_id: "",
    supplier_name: "",
    received_date: dayjs().format("YYYY-MM-DD"),
    supplier_invoice: "",
    total_amount: 0,
    total_quantity: 0,
    status: "pending",
    items: [],
  });

  // load vendors
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await vendorService.getAll();
        setVendors(res?.data || res || []);
      } catch (err) {
        console.error("Vendor fetch error:", err);
        toast.error("Failed to load vendors");
      }
    };
    loadVendors();
  }, []);

  // load purchase orders
  useEffect(() => {
    const loadPOs = async () => {
      try {
        const res = await orderService.getAll({ limit: 200, page: 1 });
        const data = res?.data ?? res;
        setPurchaseOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("PO fetch error:", err);
      }
    };
    loadPOs();
  }, []);

  // load existing inward in edit mode (if editing an inward)
  useEffect(() => {
    if (!isEdit) return;
    const fetchInward = async () => {
      setLoading(true);
      try {
        const res = await inwardService.getById(id);
        const inv = res?.data || res;
        if (!inv) {
          toast.error("Failed to load inward");
          setLoading(false);
          return;
        }

        // Map items: handle both valid product object shapes
        const items = (inv.items || []).map((it) => {
          // server item may contain `products` or `product` or flattened fields
          const prod = it.products ?? it.product ?? {};
          return {
            product_id: it.product_id ?? prod.id ?? null,
            product_code: prod.product_code ?? it.product_code ?? "",
            product_name: prod.product_name ?? it.product_name ?? "",
            quantity: Number(it.quantity ?? it.pending_quantity ?? 0),
            unit_price: Number(it.unit_price ?? it.unit_price ?? prod.purchase_price ?? 0),
            unit: prod.unit ?? it.unit ?? "",
            isManual: !Boolean(it.product_id),
            expiry_date: it.expiry_date ? dayjs(it.expiry_date).format("YYYY-MM-DD") : "",
            batch_number: it.batch_number ?? "",
          };
        });

        setForm({
          vendor_id: inv.vendor_id ?? inv.vendor?.id ?? "",
          order_id: inv.order_id ?? "",
          supplier_name: inv.supplier_name ?? inv.vendor?.name ?? "",
          received_date: inv.received_date ? dayjs(inv.received_date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
          supplier_invoice: inv.supplier_invoice ?? "",
          total_amount: Number(inv.total_amount ?? 0),
          total_quantity: Number(inv.total_quantity ?? summary.qty ?? 0),
          status: inv.status ?? "pending",
          items,
        });

        updateSummary(items);
      } catch (err) {
        console.error("Inward fetch error:", err);
        toast.error("Failed to load inward data");
      } finally {
        setLoading(false);
      }
    };
    fetchInward();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  // select PO and map its items (your provided getById response shape)
  const handleSelectPO = async (poId) => {
    if (!poId) {
      setForm((prev) => ({ ...prev, order_id: "", items: [], vendor_id: "", supplier_name: "" }));
      updateSummary([]);
      return;
    }

    setLoading(true);
    try {
      const res = await orderService.getById(poId);
      const order = res?.data || res;
      if (!order) {
        toast.error("Selected PO not found");
        setLoading(false);
        return;
      }

      // Map order items: note `items[].products` per your sample
      const mapped = (order.items || []).map((it) => {
        const prod = it.products ?? it.product ?? {};
        return {
          product_id: it.product_id ?? prod.id ?? null,
          product_code: prod.product_code ?? "",
          product_name: prod.product_name ?? "",
          // prefer pending_quantity when present (your sample shows pending_quantity)
          quantity: Number(it.pending_quantity ?? it.quantity ?? 0),
          unit_price: Number(it.unit_price ?? it.unit_price ?? prod.purchase_price ?? 0),
          unit: prod.unit ?? "",
          isManual: false,
          expiry_date: "",
          batch_number: "",
        };
      });

      setForm((prev) => ({
        ...prev,
        order_id: order.id,
        vendor_id: order.vendor?.id ?? order.vendor_id ?? prev.vendor_id,
        supplier_name: order.vendor?.name ?? prev.supplier_name,
        received_date: order.order_date ? dayjs(order.order_date).format("YYYY-MM-DD") : prev.received_date,
        items: mapped,
      }));

      updateSummary(mapped);
    } catch (err) {
      console.error("PO details error:", err);
      toast.error("Failed to load PO details");
    } finally {
      setLoading(false);
    }
  };

  // add product by scanning / code
  const handleProductCode = async (e) => {
    // support onKeyDown (Enter) or manual call where e is a synthetic event
    if (e?.key && e.key !== "Enter") return;
    if (e?.preventDefault) e.preventDefault();
    const code = (e.target?.value || "").trim();
    if (e.target) e.target.value = "";
    if (!code) return;

    try {
      const product = await productService.getByCode(code);
      if (!product) {
        toast.error("No product found with that code");
        return;
      }

      setForm((prev) => {
        const existingIndex = prev.items.findIndex((it) => it.product_code === product.product_code);
        const newItems = [...prev.items];
        if (existingIndex >= 0) {
          newItems[existingIndex].quantity = Number(newItems[existingIndex].quantity || 0) + 1;
        } else {
          newItems.push({
            product_id: product.id,
            product_code: product.product_code,
            product_name: product.product_name,
            quantity: 1,
            unit_price: Number(product.purchase_price) || 0,
            unit: product.unit || "",
            isManual: false,
            expiry_date: "",
            batch_number: "",
          });
        }
        updateSummary(newItems);
        return { ...prev, items: newItems };
      });
    } catch (err) {
      console.error("Fetch product error:", err);
      toast.error("Failed to fetch product");
    }
  };

  // add manual product row
  const addManualProduct = () => {
    setForm((prev) => {
      const newItems = [
        ...prev.items,
        {
          product_id: null,
          product_code: "",
          product_name: "",
          quantity: 1,
          unit_price: 0,
          unit: "",
          isManual: true,
          expiry_date: "",
          batch_number: "",
        },
      ];
      updateSummary(newItems);
      return { ...prev, items: newItems };
    });
  };

  // remove item
  const removeItem = (index) => {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      updateSummary(items);
      return { ...prev, items };
    });
  };

  // item field change
  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      updateSummary(items);
      return { ...prev, items };
    });
  };

  // summary updater
  const updateSummary = (items) => {
    let qty = 0;
    let value = 0;
    (items || []).forEach((it) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.unit_price || 0);
      qty += q;
      value += q * p;
    });
    setSummary({ qty, value, count: (items || []).length });
  };

  // simple validation
  const validate = () => {
    const errs = {};
    if (!form.vendor_id) errs.vendor_id = "Please select a vendor or pick a PO";
    if (!form.received_date) errs.received_date = "Please select received date";
    if (!form.items || form.items.length === 0) errs.items = "Add at least one item";
    form.items.forEach((it, idx) => {
      if (it.isManual) {
        if (!it.product_name || !it.unit_price || !it.unit) {
          errs.items = `Manual item #${idx + 1} must have name, unit and unit price`;
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // submit handler
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      // create manual products first (if any)
      const formattedItems = [];
      for (const it of form.items) {
        let productId = it.product_id;
        if (it.isManual) {
          if (!it.product_name || !it.unit_price || !it.unit) {
            toast.error("Please fill manual product details");
            setLoading(false);
            return;
          }
          const newProd = await productService.create({
            product_name: it.product_name,
            purchase_price: Number(it.unit_price),
            unit: it.unit,
            product_code: it.product_code || undefined,
          });
          productId = newProd?.data?.id || newProd?.id;
        }

        formattedItems.push({
          product_id: productId,
          quantity: Number(it.quantity || 0),
          unit_price: Number(it.unit_price || 0),
          batch_number: it.batch_number || undefined,
          expiry_date: it.expiry_date ? dayjs(it.expiry_date).toISOString() : undefined,
        });
      }

      const payload = {
        order_id: form.order_id || undefined,
        vendor_id: form.vendor_id,
        supplier_name: form.supplier_name || undefined,
        received_date: form.received_date ? dayjs(form.received_date).toISOString() : undefined,
        supplier_invoice: form.supplier_invoice || undefined,
        total_amount: Number(summary.value || form.total_amount || 0),
        total_quantity: Number(summary.qty || form.total_quantity || 0),
        status: form.status || "pending",
        items: formattedItems,
      };

      if (isEdit) {
        await inwardService.update(id, payload);
        toast.success("Inward updated successfully");
      } else {
        await inwardService.create(payload);
        toast.success("Inward created successfully");
      }
      navigate("/inward");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save inward");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{isEdit ? "Edit Inward" : "Create Inward"}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/inward/list")} className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PO, Vendor, Received Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Order (optional)</label>
              <select
                value={form.order_id || ""}
                onChange={(e) => handleSelectPO(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select purchase order</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_no} {po.vendor?.name ? `— ${po.vendor.name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <select
                value={form.vendor_id || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, vendor_id: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name || v.name}
                  </option>
                ))}
              </select>
              {errors.vendor_id && <p className="text-red-500 text-sm mt-1">{errors.vendor_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Received Date</label>
              <Input
                type="date"
                value={form.received_date}
                onChange={(e) => setForm((prev) => ({ ...prev, received_date: e.target.value }))}
                className="w-full"
              />
              {errors.received_date && <p className="text-red-500 text-sm mt-1">{errors.received_date}</p>}
            </div>
          </div>

          {/* Supplier invoice, Supplier name, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier Invoice</label>
              <Input value={form.supplier_invoice} onChange={(e) => setForm((prev) => ({ ...prev, supplier_invoice: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Supplier Name</label>
              <Input value={form.supplier_name} onChange={(e) => setForm((prev) => ({ ...prev, supplier_name: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full border rounded-md px-3 py-2">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Scan / manual */}
          <div>
            <label className="block text-sm font-medium mb-1">Scan / Enter Product Code</label>
            <Input placeholder="Type code and press Enter" onKeyDown={handleProductCode} />
          </div>

          <div>
            <Button type="button" onClick={addManualProduct} variant="outline" className="flex items-center gap-2">
              <Plus size={14} /> Add Manual Product
            </Button>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto border rounded-lg mt-4">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2">Name / Code</th>
                  <th className="border p-2 w-28">Qty</th>
                  <th className="border p-2 w-36">Unit Price</th>
                  <th className="border p-2 w-24">Unit</th>
                  <th className="border p-2 w-36">Expiry</th>
                  <th className="border p-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">
                      <Input value={item.product_name} onChange={(e) => handleItemChange(idx, "product_name", e.target.value)} placeholder="Product name" />
                      <Input value={item.product_code} onChange={(e) => handleItemChange(idx, "product_code", e.target.value)} placeholder="Code (optional)" className="mt-2" />
                    </td>

                    <td className="border p-2">
                      <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))} />
                    </td>

                    <td className="border p-2">
                      <Input type="number" value={item.unit_price} onChange={(e) => handleItemChange(idx, "unit_price", Number(e.target.value))} />
                    </td>

                    <td className="border p-2">
                      <Input value={item.unit} onChange={(e) => handleItemChange(idx, "unit", e.target.value)} placeholder="pcs/kg" />
                    </td>

                    <td className="border p-2">
                      <Input type="date" value={item.expiry_date || ""} onChange={(e) => handleItemChange(idx, "expiry_date", e.target.value)} />
                    </td>

                    <td className="border p-2 text-center">
                      <button type="button" onClick={() => removeItem(idx)} className="p-1"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </td>
                  </tr>
                ))}

                {form.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500">No items added</td>
                  </tr>
                )}
              </tbody>
            </table>
            {errors.items && <p className="text-red-500 text-sm mt-2 p-2">{errors.items}</p>}
          </div>

          {/* Summary */}
          <div className="flex justify-end gap-6 mt-4 text-sm text-gray-700">
            <p>Total Qty: <strong>{summary.qty}</strong></p>
            <p>Total Value: <strong>₹{summary.value.toFixed(2)}</strong></p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {isEdit ? "Update Inward" : "Create Inward"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/inward/list")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
