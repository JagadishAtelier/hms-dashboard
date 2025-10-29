// src/pages/lab/LabTestOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import labTestOrderService from "../../service/labtestorderService.js";
import labtestService from "../../service/labtestService.js";

function LabTestOrder() {
  const { encounter_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // read appointment_id from query string (if present)
  const qs = new URLSearchParams(location.search);
  const appointment_id = qs.get("appointment_id");

  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // order-level fields
  const [order, setOrder] = useState({
    encounter_id: encounter_id || null,
    status: "pending", // pending|completed|collected|processed
    priority: "normal", // normal|urgent
    is_active: true,
    items: [
      {
        lab_test_id: "",
        sample_type: "",
        collected_at: "", // will be auto-filled
        result_value: "",
        result_file_url: "",
      },
    ],
  });

  // master data
  const [labTests, setLabTests] = useState([]);

  // load lab tests and existing order (if encounter_id present)
  useEffect(() => {
    fetchLabTests();
    if (encounter_id) {
      setOrder((o) => ({ ...o, encounter_id }));
      fetchExistingOrder(encounter_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter_id]);

  const fetchLabTests = async () => {
    try {
      const res = await labtestService.getAllLabTests();
      const data = res?.data?.data ?? res;
      setLabTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch lab tests", err);
      toast.error(err?.response?.data?.message || "Failed to load lab tests");
    }
  };

  const fetchExistingOrder = async (encId) => {
    try {
      setLoading(true);
      const res = await labTestOrderService.getLabTestOrderByEncounterId(encId);
      const data = res?.data ?? res;
      if (data) {
        const items = (data.items || []).map((it) => ({
          id: it.id,
          lab_test_id: it.lab_test_id,
          sample_type: it.sample_type || "",
          collected_at: it.collected_at || "",
          result_value: it.result_value || "",
          result_file_url: it.result_file_url || "",
        }));

        setOrder({
          encounter_id: data.encounter_id || encId,
          status: data.status || "pending",
          priority: data.priority || "normal",
          is_active: data.is_active ?? true,
          items: items.length ? items : order.items,
        });
        setOrderId(data.id);
      }
    } catch (err) {
      console.log("No existing lab test order for this encounter", err?.message ?? err);
    } finally {
      setLoading(false);
    }
  };

  // Change handlers
  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    const now = new Date().toISOString(); // auto-fill collected_at
    setOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          lab_test_id: "",
          sample_type: "",
          collected_at: now,
          result_value: "",
          result_file_url: "",
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setOrder((prev) => {
      const items = [...prev.items];
      items.splice(index, 1);
      return {
        ...prev,
        items: items.length
          ? items
          : [
              {
                lab_test_id: "",
                sample_type: "",
                collected_at: new Date().toISOString(),
                result_value: "",
                result_file_url: "",
              },
            ],
      };
    });
  };

  const handleItemChange = (index, field, value) => {
    setOrder((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const validateOrder = () => {
    if (!order.encounter_id) {
      toast.error("Encounter ID is missing");
      return false;
    }
    if (!order.items || order.items.length === 0) {
      toast.error("Add at least one test item");
      return false;
    }
    for (let i = 0; i < order.items.length; i++) {
      const it = order.items[i];
      if (!it.lab_test_id) {
        toast.error(`Select lab test for row ${i + 1}`);
        return false;
      }
      if (!it.sample_type || it.sample_type.trim().length < 2) {
        toast.error(`Enter sample type for row ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSaveOrder = async () => {
    try {
      if (!validateOrder()) return;
      setLoading(true);

      const now = new Date().toISOString();

      // If creating a new order -> always set status to "pending".
      // If updating an existing order -> keep the current order.status (or fallback to "pending").
      const payloadStatus = orderId ? (order.status || "pending") : "pending";

      const payload = {
        encounter_id: order.encounter_id,
        order_date: now,
        status: payloadStatus,
        priority: order.priority,
        is_active: order.is_active,
        items: order.items.map((it) => ({
          id: it.id, // include id for updates (if present)
          lab_test_id: it.lab_test_id,
          sample_type: it.sample_type,
          collected_at: it.collected_at || now, // auto fill if missing
          result_value: it.result_value || undefined,
          result_file_url: it.result_file_url || undefined,
        })),
      };

      if (orderId) {
        await labTestOrderService.updateLabTestOrder(orderId, {
          status: payload.status,
          priority: payload.priority,
          items: payload.items,
        });
        toast.success("Lab test order updated successfully");
      } else {
        const res = await labTestOrderService.createLabTestOrder(payload);
        const data = res?.data ?? res;
        setOrderId(data?.id ?? data);
        toast.success("Lab test order created successfully");
      }

      // after create/update redirect back to doctor notes, passing appointment_id (if available)
      const redirectId = appointment_id || encounter_id;
      if (redirectId) {
        navigate(`/doctor-notes/${redirectId}`);
      } else {
        // fallback: go back one step if no id
        navigate(-1);
      }
    } catch (err) {
      console.error("Failed to save lab test order", err);
      toast.error(err?.response?.data?.message || "Failed to save lab test order");
    } finally {
      setLoading(false);
    }
  };

  // compute selected lab test ids (non-empty)
  const selectedTestIds = order.items.map((it) => it.lab_test_id).filter(Boolean);

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0E1680]">Lab Test Order</h2>
      </div>

      {/* Priority */}
      <Card className="mb-6">
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              name="priority"
              value={order.priority}
              onChange={handleOrderChange}
              className="w-full border rounded px-2 py-2"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0E1680]">Order Items</h3>
            <Button onClick={handleAddItem}>Add Item</Button>
          </div>

          <div className="space-y-4">
            {order.items.map((item, idx) => {
              // options for this row: show tests that are not chosen in other rows,
              // but keep the current row's selection in its own options.
              const optionsForRow = labTests.filter(
                (t) => t.id === item.lab_test_id || !selectedTestIds.includes(t.id)
              );

              return (
                <div
                  key={item.id ?? idx}
                  className="grid grid-cols-12 gap-3 items-center border rounded p-3"
                >
                  {/* Test select */}
                  <div className="col-span-5">
                    <label className="text-sm font-medium">Test</label>
                    <select
                      value={item.lab_test_id}
                      onChange={(e) => handleItemChange(idx, "lab_test_id", e.target.value)}
                      className="w-full border rounded px-2 py-2"
                    >
                      <option value="">Select test</option>
                      {optionsForRow.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sample Type */}
                  <div className="col-span-5">
                    <label className="text-sm font-medium">Sample Type</label>
                    <Input
                      value={item.sample_type}
                      onChange={(e) => handleItemChange(idx, "sample_type", e.target.value)}
                      placeholder="e.g. Blood"
                      className="w-full"
                    />
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-end justify-end">
                    <Button variant="secondary" onClick={() => handleRemoveItem(idx)} className="h-10">
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-[#0E1680] text-white" onClick={handleSaveOrder} disabled={loading}>
          {orderId ? "Update Order" : "Create Order"}
        </Button>
      </div>
    </div>
  );
}

export default LabTestOrder;
