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
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const appointment_id = new URLSearchParams(location.search).get("appointment_id");
  const admission_id = new URLSearchParams(location.search).get("admission_id");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [order, setOrder] = useState({
    patient_id: patient_id || null,
    status: "pending",
    priority: "normal",
    is_active: true,
    items: [{ lab_test_id: "", sample_type: "", collected_at: "", result_value: "", result_file_url: "" }],
  });

  const [labTests, setLabTests] = useState([]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      const res = await labtestService.getAllLabTests();
      const data = res?.data?.data ?? res?.data ?? res;
      setLabTests(Array.isArray(data) ? data : []);

      if (admission_id) {
        await fetchExistingOrderByAdmission(admission_id);
      } else if (appointment_id) {
        await fetchExistingOrderByAppointment(appointment_id);
      }
    } catch (err) {
      console.error("Init error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingOrderByAdmission = async (admId) => {
    try {
      const res = await labTestOrderService.getLabTestOrderByAdmissionId(admId);
      const data = res?.data ?? res;
      if (data?.id) {
        setOrderId(data.id);
        setOrder((prev) => ({
          ...prev,
          status: data.status || "pending",
          priority: data.priority || "normal",
          is_active: data.is_active ?? true,
          items: (data.items || []).length
            ? data.items.map((it) => ({
                id: it.id,
                lab_test_id: it.lab_test_id,
                sample_type: it.sample_type || "",
                collected_at: it.collected_at || "",
                result_value: it.result_value || "",
                result_file_url: it.result_file_url || "",
              }))
            : prev.items,
        }));
      }
    } catch {
      // no existing order — fine
    }
  };

  const fetchExistingOrderByAppointment = async (apptId) => {
    try {
      const res = await labTestOrderService.getLabTestOrderByAppointmentId(apptId);
      const data = res?.data ?? res;
      if (data?.id) {
        setOrderId(data.id);
        setOrder((prev) => ({
          ...prev,
          status: data.status || "pending",
          priority: data.priority || "normal",
          is_active: data.is_active ?? true,
          items: (data.items || []).length
            ? data.items.map((it) => ({
                id: it.id,
                lab_test_id: it.lab_test_id,
                sample_type: it.sample_type || "",
                collected_at: it.collected_at || "",
                result_value: it.result_value || "",
                result_file_url: it.result_file_url || "",
              }))
            : prev.items,
        }));
      }
    } catch {
      // no existing order — that's fine
    }
  };

  const fetchLabTests = async () => {
    try {
      const res = await labtestService.getAllLabTests();
      const data = res?.data?.data ?? res?.data ?? res;
      setLabTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch lab tests", err);
      toast.error(err?.response?.data?.message || "Failed to load lab tests");
    }
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setOrder((prev) => ({
      ...prev,
      items: [...prev.items, { lab_test_id: "", sample_type: "", collected_at: "", result_value: "", result_file_url: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    setOrder((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: items.length ? items : [{ lab_test_id: "", sample_type: "", collected_at: "", result_value: "", result_file_url: "" }],
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
    if (!order.patient_id) { toast.error("Patient ID is missing"); return false; }
    if (!order.items || order.items.length === 0) { toast.error("Add at least one test item"); return false; }
    for (let i = 0; i < order.items.length; i++) {
      const it = order.items[i];
      if (!it.lab_test_id) { toast.error(`Select lab test for row ${i + 1}`); return false; }
      if (!it.sample_type || it.sample_type.trim().length < 2) { toast.error(`Enter sample type for row ${i + 1}`); return false; }
    }
    return true;
  };

  const handleSaveOrder = async () => {
    if (!validateOrder()) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        patient_id: order.patient_id,
        appointment_id: appointment_id || undefined,
        admission_id: admission_id || undefined,
        order_date: now,
        status: orderId ? (order.status || "pending") : "pending",
        priority: order.priority,
        is_active: order.is_active,
        items: order.items.map((it) => ({
          id: it.id,
          lab_test_id: it.lab_test_id,
          sample_type: it.sample_type,
          collected_at: it.collected_at || now,
          result_value: it.result_value || undefined,
          result_file_url: it.result_file_url || undefined,
        })),
      };

      if (orderId) {
        await labTestOrderService.updateLabTestOrder(orderId, { status: payload.status, priority: payload.priority, items: payload.items });
        toast.success("Lab test order updated successfully");
      } else {
        const res = await labTestOrderService.createLabTestOrder(payload);
        const data = res?.data ?? res;
        setOrderId(data?.id ?? data);
        toast.success("Lab test order created successfully");
      }

      navigate(-1);
    } catch (err) {
      console.error("Failed to save lab test order", err);
      toast.error(err?.response?.data?.message || "Failed to save lab test order");
    } finally {
      setSaving(false);
    }
  };

  const selectedTestIds = order.items.map((it) => it.lab_test_id).filter(Boolean);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0E1680]">Lab Test Order</h2>
        <div className="flex items-center gap-2">
          {orderId && (
            <Button
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              onClick={() => {
                const param = admission_id
                  ? `admission_id=${admission_id}`
                  : `appointment_id=${appointment_id}`;
                navigate(`/testresults/${patient_id}?${param}`);
              }}
            >
              View Results
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-3 gap-4 pt-4">
          <div>
            <label className="text-sm font-medium">Priority</label>
            <select name="priority" value={order.priority} onChange={handleOrderChange} className="w-full border rounded px-2 py-2 mt-1">
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0E1680]">Order Items</h3>
            <Button onClick={handleAddItem}>Add Item</Button>
          </div>

          <div className="space-y-4">
            {order.items.map((item, idx) => {
              const optionsForRow = labTests.filter((t) => t.id === item.lab_test_id || !selectedTestIds.includes(t.id));
              return (
                <div key={item.id ?? idx} className="grid grid-cols-12 gap-3 items-center border rounded p-3">
                  <div className="col-span-5">
                    <label className="text-sm font-medium">Test</label>
                    <select value={item.lab_test_id} onChange={(e) => handleItemChange(idx, "lab_test_id", e.target.value)} className="w-full border rounded px-2 py-2 mt-1">
                      <option value="">Select test</option>
                      {optionsForRow.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <label className="text-sm font-medium">Sample Type</label>
                    <Input value={item.sample_type} onChange={(e) => handleItemChange(idx, "sample_type", e.target.value)} placeholder="e.g. Blood" className="w-full mt-1" />
                  </div>
                  <div className="col-span-2 flex items-end justify-end">
                    <Button variant="secondary" onClick={() => handleRemoveItem(idx)} className="h-10">Remove</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-[#0E1680] text-white" onClick={handleSaveOrder} disabled={saving}>
          {saving ? "Saving..." : orderId ? "Update Order" : "Create Order"}
        </Button>
      </div>
    </div>
  );
}

export default LabTestOrder;
