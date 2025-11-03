import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, ArrowLeft } from "lucide-react";
import dayjs from "dayjs";

import vendorService from "../../service/vendorService.js";
import productService from "../../service/productService.js";
import orderService from "../../service/orderService.js";

export default function OrderCreate() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState({ qty: 0, value: 0 });

  const [form, setForm] = useState({
    vendor_id: "",
    order_date: dayjs().format("YYYY-MM-DD"),
    status: "pending",
    items: [],
  });

  /** Fetch vendor list */
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

  /** Fetch order details in edit mode */
  useEffect(() => {
    if (!isEdit) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await orderService.getById(id);
        const o = res?.data || res;

        // FIXED: handle both `it.products` and `it.product`
        const items = (o.items || []).map((it) => {
          const prod = it.products || it.product || {};
          return {
            product_id: it.product_id,
            product_code: prod.product_code || "",
            product_name: prod.product_name || "",
            quantity: Number(it.quantity || 0),
            unit_price: Number(it.unit_price || 0),
            unit: prod.unit || "",
            isManual: false,
          };
        });

        setForm({
          vendor_id: o.vendor_id,
          order_date: dayjs(o.order_date).format("YYYY-MM-DD"),
          status: o.status || "pending",
          items,
        });
        updateSummary(items);
      } catch (err) {
        console.error("Order fetch error:", err);
        toast.error("Failed to load order data");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, isEdit]);

  /** Add product via code */
  const handleProductCode = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = e.target.value.trim();
    e.target.value = "";
    if (!code) return;

    try {
      const product = await productService.getByCode(code);
      if (!product) return toast.error("No product found with that code");

      setForm((prev) => {
        const existingIndex = prev.items.findIndex(
          (i) => i.product_code === product.product_code
        );
        const newItems = [...prev.items];
        if (existingIndex >= 0) {
          newItems[existingIndex].quantity += 1;
        } else {
          newItems.push({
            product_id: product.id,
            product_code: product.product_code,
            product_name: product.product_name,
            quantity: 1,
            unit_price: Number(product.purchase_price) || 0,
            unit: product.unit || "",
            isManual: false,
          });
        }
        updateSummary(newItems);
        return { ...prev, items: newItems };
      });
    } catch (err) {
      console.error("Product fetch error:", err);
      toast.error("Failed to fetch product");
    }
  };

  /** Add manual product row */
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
        },
      ];
      updateSummary(newItems);
      return { ...prev, items: newItems };
    });
  };

  /** Remove item */
  const removeItem = (index) => {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      updateSummary(items);
      return { ...prev, items };
    });
  };

  /** Handle item changes */
  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index][field] = value;
      updateSummary(items);
      return { ...prev, items };
    });
  };

  /** Summary updater */
  const updateSummary = (items) => {
    let qty = 0,
      value = 0;
    items.forEach((it) => {
      qty += Number(it.quantity || 0);
      value += Number(it.quantity || 0) * Number(it.unit_price || 0);
    });
    setSummary({ qty, value });
  };

  /** Validation */
  const validate = () => {
    const errs = {};
    if (!form.vendor_id) errs.vendor_id = "Please select a vendor";
    if (!form.order_date) errs.order_date = "Select order date";
    if (form.items.length === 0) errs.items = "Add at least one item";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /** Submit handler */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      const formattedItems = [];
      for (const it of form.items) {
        let productId = it.product_id;
        if (it.isManual) {
          if (!it.product_name || !it.unit_price || !it.unit) {
            toast.error("Please fill all product details for manual items");
            setLoading(false);
            return;
          }
          const newProd = await productService.create({
            product_name: it.product_name,
            purchase_price: Number(it.unit_price),
            unit: it.unit,
          });
          productId = newProd?.data?.id || newProd?.id;
        }
        formattedItems.push({
          product_id: productId,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        });
      }

      const payload = {
        vendor_id: form.vendor_id,
        order_date: dayjs(form.order_date).toDate(),
        status: isEdit ? form.status : "pending",
        items: formattedItems,
      };

      if (isEdit) {
        await orderService.update(id, payload);
        toast.success("Order updated successfully");
      } else {
        await orderService.create(payload);
        toast.success("Order created successfully");
      }
      navigate("/order");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  /** Render */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Order" : "Create Order"}
        </h2>
        <Button
          variant="outline"
          onClick={() => navigate("/order")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <select
              value={form.vendor_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, vendor_id: e.target.value }))
              }
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendor_name || v.name}
                </option>
              ))}
            </select>
            {errors.vendor_id && (
              <p className="text-red-500 text-sm">{errors.vendor_id}</p>
            )}
          </div>

          {/* Order Date + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Order Date
              </label>
              <Input
                type="date"
                value={form.order_date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, order_date: e.target.value }))
                }
              />
              {errors.order_date && (
                <p className="text-red-500 text-sm">{errors.order_date}</p>
              )}
            </div>

            {isEdit && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          {/* Product Code Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Scan / Enter Product Code
            </label>
            <Input
              placeholder="Type code and press Enter"
              onKeyDown={handleProductCode}
            />
          </div>

          {/* Manual Add Button */}
          <Button
            type="button"
            onClick={addManualProduct}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Add Manual Product
          </Button>

          {/* Items Table */}
          <div className="overflow-x-auto border rounded-lg mt-4">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Unit Price</th>
                  <th className="border p-2">Unit</th>
                  <th className="border p-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">
                      <Input
                        value={item.product_name}
                        onChange={(e) =>
                          handleItemChange(idx, "product_name", e.target.value)
                        }
                        placeholder="Product name"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", e.target.value)
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(idx, "unit_price", e.target.value)
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(idx, "unit", e.target.value)
                        }
                        placeholder="pcs/kg"
                      />
                    </td>
                    <td className="border p-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {errors.items && (
              <p className="text-red-500 text-sm mt-2">{errors.items}</p>
            )}
          </div>

          {/* Summary */}
          <div className="flex justify-end gap-6 mt-4 text-sm text-gray-700">
            <p>
              Total Qty: <strong>{summary.qty}</strong>
            </p>
            <p>
              Total Value: <strong>₹{summary.value.toFixed(2)}</strong>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {isEdit ? "Update Order" : "Create Order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/order")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
