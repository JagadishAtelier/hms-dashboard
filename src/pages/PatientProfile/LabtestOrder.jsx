// src/pages/lab/LabTestOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FlaskConical, AlertTriangle, Clock, Plus, Trash2, CheckCircle2, Sparkles } from "lucide-react";

import labTestOrderService from "../../service/labtestorderService.js";
import labtestService from "../../service/labtestService.js";
import clinicalMasterService from "../../service/clinicalMasterService.js";

function LabTestOrder() {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const appointment_id = new URLSearchParams(location.search).get("appointment_id");
  const admission_id = new URLSearchParams(location.search).get("admission_id");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [specimenOptions, setSpecimenOptions] = useState([]);

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
    loadSpecimenOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSpecimenOptions = async () => {
    try {
      const specs = await clinicalMasterService.getMastersByCategory("SPECIMEN_TYPE");
      setSpecimenOptions(specs);
    } catch (err) {
      console.error("Failed to load specimen options", err);
    }
  };

  const init = async () => {
    setLoading(true);
    try {
      const res = await labtestService.getAllLabTests({ limit: 500, is_active: true });
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
      // no existing order — fine
    }
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

  // ✅ Intelligent Specimen Auto-Determination on Test Selection
  const handleTestSelect = (index, testId) => {
    const selectedTest = labTests.find((t) => String(t.id) === String(testId));
    let autoSpecimen = "";
    if (selectedTest) {
      autoSpecimen =
        selectedTest.default_specimen_type ||
        clinicalMasterService.determineSpecimen(selectedTest.name, selectedTest.code, selectedTest.category);
    }

    setOrder((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        lab_test_id: testId,
        sample_type: autoSpecimen || items[index].sample_type,
      };
      return { ...prev, items };
    });
  };

  const handleSampleTypeSelect = (index, specimenValue) => {
    setOrder((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], sample_type: specimenValue };
      return { ...prev, items };
    });
  };

  const validateOrder = () => {
    if (!order.patient_id) { toast.error("Patient ID is missing"); return false; }
    if (!order.items || order.items.length === 0) { toast.error("Add at least one test item"); return false; }
    for (let i = 0; i < order.items.length; i++) {
      const it = order.items[i];
      if (!it.lab_test_id) { toast.error(`Select lab test for row ${i + 1}`); return false; }
      if (!it.sample_type || it.sample_type.trim().length < 2) { toast.error(`Select or enter sample type for row ${i + 1}`); return false; }
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
      <div className="p-6 flex items-center justify-center h-64 text-slate-500 text-sm">
        Loading diagnostic catalog...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0E1680]">Diagnostic Requisition Order</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated specimen accessioning, tube color coordination, and clinical priority routing
          </p>
        </div>
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

      <Card className="mb-6 border-slate-200 shadow-xs">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
              Clinical Priority & Triage Level
            </label>
            <Select
              value={order.priority}
              onValueChange={(val) => setOrder((prev) => ({ ...prev, priority: val }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Clinical Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Routine / Normal Queue</SelectItem>
                <SelectItem value="urgent">Urgent Clinical Escalation</SelectItem>
                <SelectItem value="stat">STAT / Emergency Priority (&lt;45m SLA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
              Order Requisition Status
            </label>
            <Input
              value={order.status.toUpperCase()}
              disabled
              className="bg-slate-100 font-bold text-slate-700 text-xs tracking-wider"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-slate-200 shadow-xs">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#0E1680]">Ordered Diagnostic Tests & Specimens</h3>
              <p className="text-xs text-slate-500">Specimen types are automatically determined by laboratory rulebook</p>
            </div>
            <Button onClick={handleAddItem} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Test
            </Button>
          </div>

          <div className="space-y-3">
            {order.items.map((item, idx) => {
              const optionsForRow = labTests.filter(
                (t) => String(t.id) === String(item.lab_test_id) || !selectedTestIds.includes(String(t.id))
              );
              const selectedTestObj = labTests.find((t) => String(t.id) === String(item.lab_test_id));

              return (
                <div
                  key={item.id ?? idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  {/* Test Selection */}
                  <div className="md:col-span-6">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                      Diagnostic Test <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={item.lab_test_id || ""}
                      onValueChange={(val) => handleTestSelect(idx, val)}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select diagnostic test..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {optionsForRow.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.name} ({t.code}) — {t.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specimen / Sample Type (Auto-Determined + Radix Selectable) */}
                  <div className="md:col-span-5">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Biological Specimen <span className="text-red-500">*</span>
                      </label>
                      {item.sample_type && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <Sparkles className="h-2.5 w-2.5" /> Auto-Set
                        </span>
                      )}
                    </div>
                    <Select
                      value={item.sample_type || ""}
                      onValueChange={(val) => handleSampleTypeSelect(idx, val)}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select or auto-determine specimen..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {specimenOptions.map((sp) => (
                          <SelectItem key={sp.code || sp.display_label} value={sp.display_label}>
                            {sp.display_label}
                          </SelectItem>
                        ))}
                        {/* Fallback if item has a custom sample_type not in predefined list */}
                        {item.sample_type &&
                          !specimenOptions.some((sp) => sp.display_label === item.sample_type) && (
                            <SelectItem value={item.sample_type}>{item.sample_type}</SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-1 flex items-end justify-end pt-5 md:pt-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={order.items.length === 1}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Remove test"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Test Metadata Footer (Reference Range, Unit, SLA) */}
                  {selectedTestObj && (
                    <div className="md:col-span-12 text-xs text-slate-500 flex flex-wrap gap-4 pt-1 border-t border-slate-100 mt-1">
                      <span>Method: <strong className="text-slate-700">{selectedTestObj.method}</strong></span>
                      <span>Ref Range: <strong className="text-slate-700">{selectedTestObj.reference_range} {selectedTestObj.units}</strong></span>
                      <span>SLA: <strong className="text-slate-700">{selectedTestObj.turnaround_time}</strong></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          className="bg-[#0E1680] hover:bg-[#0b1163] text-white px-6 font-semibold"
          onClick={handleSaveOrder}
          disabled={saving}
        >
          {saving ? "Submitting Requisition..." : orderId ? "Update Diagnostic Order" : "Submit Diagnostic Order"}
        </Button>
      </div>
    </div>
  );
}

export default LabTestOrder;
