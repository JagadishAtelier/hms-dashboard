// src/notes/DoctorNotes.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Stethoscope, HeartPulse, ClipboardList, FileText } from "lucide-react";

import encounterService from "../../service/encounterService.js";
import vitalsService from "../../service/vitalsService.js";
import diagnosisService from "../../service/diagnosisService.js";
import clinicalNoteService from "../../service/clinicalnoteService.js";

import dayjs from "dayjs";
import productService from "../../service/productService.js";
import billingService from "../../service/billingService.js";

function DoctorNotes() {
  const { appointment_id } = useParams();
  const navigate = useNavigate();

  // ---------- Encounter / Vitals / Diagnosis / Clinical ----------
  const [encounter, setEncounter] = useState({
    appointment_id: "",
    encounter_date: dayjs().format("YYYY-MM-DD"),
    chief_complaint: "",
    history: "",
    examination: "",
    plan: "",
    notes: "",
  });
  const [encounterId, setEncounterId] = useState(null);

  const [vitals, setVitals] = useState({
    appointment_id: "",
    encounter_id: null,
    height: "",
    weight: "",
    temperature: "",
    pulse: "",
    blood_pressure: "",
    respiratory_rate: "",
    spo2: "",
    vitals_notes: "",
  });
  const [vitalsId, setVitalsId] = useState(null);

  const [diagnosis, setDiagnosis] = useState({
    appointment_id: "",
    encounter_id: null,
    icd_code: "",
    description: "",
    primary: false,
  });
  const [diagnosisId, setDiagnosisId] = useState(null);

  const [clinical, setClinical] = useState({
    encounter_id: null,
    note_type: "doctor",
    note: "",
  });
  const [clinicalId, setClinicalId] = useState(null);

  const [activeTab, setActiveTab] = useState("encounter");

  useEffect(() => {
    if (appointment_id) {
      setEncounter((p) => ({ ...p, appointment_id }));
      setVitals((p) => ({ ...p, appointment_id }));
      setDiagnosis((p) => ({ ...p, appointment_id }));
      fetchEncounter(appointment_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment_id]);

  const fetchEncounter = async (id) => {
    try {
      const res = await encounterService.getEncounterById(id);
      const data = res?.data || res;
      if (data) {
        setEncounter({
          appointment_id: data.appointment_id,
          encounter_date: data.encounter_date?.split("T")[0] || dayjs().format("YYYY-MM-DD"),
          chief_complaint: data.chief_complaint || "",
          history: data.history || "",
          examination: data.examination || "",
          plan: data.plan || "",
          notes: data.notes || "",
        });
        setEncounterId(data.id);
        setVitals((prev) => ({ ...prev, encounter_id: data.id }));
        setDiagnosis((prev) => ({ ...prev, encounter_id: data.id }));
        setClinical((prev) => ({ ...prev, encounter_id: data.id }));

        fetchVitals(data.id);
        fetchDiagnosis(data.id);
        fetchClinical(data.id);
      }
    } catch (err) {
      console.log("No encounter found for this appointment", err);
    }
  };

  const fetchVitals = async (id) => {
    try {
      const res = await vitalsService.getVitalsByAdmissionId(id);
      const dataArray = res?.data || res;
      const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
      if (data) {
        setVitals({
          appointment_id: data.appointment_id || "",
          encounter_id: data.encounter_id || "",
          height: data.height ?? "",
          weight: data.weight ?? "",
          temperature: data.temperature ?? "",
          pulse: data.pulse ?? "",
          blood_pressure: data.blood_pressure ?? "",
          respiratory_rate: data.respiratory_rate ?? "",
          spo2: data.spo2 ?? "",
          vitals_notes: data.notes || "",
        });
        setVitalsId(data.id);

        // **Auto-fill patient name into prescription**
        if (data.patient) {
          const fullName = `${data.patient.first_name || ""} ${data.patient.last_name || ""}`.trim();
          setPresc((p) => ({ ...p, customer_name: fullName || p.customer_name }));
        }
      }
    } catch (err) {
      console.log("No vitals found:", err);
    }
  };

  const fetchDiagnosis = async (encId) => {
    try {
      const res = await diagnosisService.getDiagnosesByEncounterId(encId);
      const dataArray = res?.data || res;
      const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
      if (data) {
        setDiagnosis({
          appointment_id: data.appointment_id || "",
          encounter_id: data.encounter_id || "",
          icd_code: data.icd_code || "",
          description: data.description || "",
          primary: data.primary || false,
        });
        setDiagnosisId(data.id);
      }
    } catch (err) {
      console.log("No diagnosis found:", err);
    }
  };

  const fetchClinical = async (encId) => {
    try {
      const res = await clinicalNoteService.getClinicalNotesByEncounterId(encId);
      const dataArray = res?.data || res;
      const doctorNote = Array.isArray(dataArray)
        ? dataArray.find((n) => n.note_type === "doctor")
        : dataArray;
      if (doctorNote) {
        setClinical({
          encounter_id: doctorNote.encounter_id,
          note_type: doctorNote.note_type,
          note: doctorNote.note,
        });
        setClinicalId(doctorNote.id);
      }
    } catch (err) {
      console.log("No clinical note found:", err);
    }
  };

  const handleChange = (e, setter) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSaveEncounter = async () => {
    try {
      const payload = {
        ...encounter,
        encounter_date: encounter.encounter_date || dayjs().format("YYYY-MM-DD"),
      };
      if (encounterId) {
        await encounterService.updateEncounter(encounterId, payload);
        toast.success("Encounter updated successfully!");
      } else {
        const res = await encounterService.createEncounter(payload);
        const newId = res?.data?.id;
        setEncounterId(newId);
        setVitals((p) => ({ ...p, encounter_id: newId }));
        setDiagnosis((p) => ({ ...p, encounter_id: newId }));
        setClinical((p) => ({ ...p, encounter_id: newId }));
        toast.success("Encounter saved successfully!");
      }
      setActiveTab("vitals");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save encounter");
    }
  };

  const handleSaveVitals = async () => {
    try {
      if (!vitals.encounter_id) {
        toast.error("Please save the encounter before adding vitals");
        return;
      }
      const payload = {
        ...vitals,
        height: Number(vitals.height) || null,
        weight: Number(vitals.weight) || null,
        temperature: Number(vitals.temperature) || null,
        pulse: Number(vitals.pulse) || null,
        respiratory_rate: Number(vitals.respiratory_rate) || null,
        spo2: Number(vitals.spo2) || null,
      };

      if (vitalsId) {
        await vitalsService.updateVitals(vitalsId, payload);
        toast.success("Vitals updated successfully!");
      } else {
        const res = await vitalsService.createVitals(payload);
        setVitalsId(res?.data?.id);
        toast.success("Vitals saved successfully!");
      }
      setActiveTab("diagnosis");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save vitals");
    }
  };

  const handleSaveDiagnosis = async () => {
    try {
      if (!encounterId) {
        toast.error("Please save the encounter first");
        return;
      }
      const payload = { ...diagnosis, encounter_id: encounterId };

      if (diagnosisId) {
        await diagnosisService.updateDiagnosis(diagnosisId, payload);
        toast.success("Diagnosis updated successfully!");
      } else {
        const res = await diagnosisService.createDiagnosis(payload);
        setDiagnosisId(res?.data?.id);
        toast.success("Diagnosis saved successfully!");
      }
      setActiveTab("clinical");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save diagnosis");
    }
  };

  const handleSaveClinicalNote = async () => {
    try {
      if (!encounterId) {
        toast.error("Please save encounter first");
        return;
      }
      const payload = {
        encounter_id: encounterId,
        note_type: "doctor",
        note: clinical.note,
      };

      if (clinicalId) {
        await clinicalNoteService.updateClinicalNote(clinicalId, payload);
        toast.success("Clinical note updated successfully!");
      } else {
        const res = await clinicalNoteService.createClinicalNote(payload);
        setClinicalId(res?.data?.id);
        toast.success("Clinical note saved successfully!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save clinical note");
    }
  };

  const handleViewTest = () => {
    const targetId = encounterId || appointment_id;
    if (!targetId) {
      toast.error("No encounter id available — please save the encounter first.");
      return;
    }
    const query = appointment_id ? `?appointment_id=${encodeURIComponent(appointment_id)}` : "";
    navigate(`/testresults/${targetId}${query}`);
  };

  const handleLabTestOrder = () => {
    const targetId = encounterId || appointment_id;
    if (!targetId) {
      toast.error("No encounter id available — please save the encounter first.");
      return;
    }
    const query = appointment_id ? `?appointment_id=${encodeURIComponent(appointment_id)}` : "";
    navigate(`/labtestorder/${targetId}${query}`);
  };

  // ---------- Prescriptions (no Ant) ----------
  const [presc, setPresc] = useState({
    // note: bill_no not displayed and not sent (server will generate)
    billing_date: dayjs().format("YYYY-MM-DD"),
    customer_name: "",
    customer_phone: "",
    payment_method: "cash",
    remarks: "",
    items: [],
  });
  const [loadingPresc, setLoadingPresc] = useState(false);
  const [productCodePresc, setProductCodePresc] = useState("");

  useEffect(() => {
    // ensure billing_date initialized
    setPresc((p) => ({ ...p, billing_date: dayjs().format("YYYY-MM-DD") }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateItemCalculationsPresc = (item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);
    const discount = Number(item.discount_amount || 0);
    const taxPerc = Number(item.tax_percentage || 0);
    const tax = ((qty * price * taxPerc) / 100);
    const total = qty * price + tax - discount;
    return {
      ...item,
      tax_amount: parseFloat(tax.toFixed(2)),
      total_price: parseFloat(total.toFixed(2)),
    };
  };

  const handleProductCodePresc = async (code) => {
    const trimmed = String(code || "").trim();
    if (!trimmed) return;
    setLoadingPresc(true);
    try {
      const product = await productService.getByCode(trimmed);
      if (!product || !product.product_code) {
        toast.error("No product found for code: " + trimmed);
        setLoadingPresc(false);
        return;
      }
      const resolvedProductId = product.id || product._id || product.uuid || null;
      if (!resolvedProductId) {
        toast.error("Product missing id/uuid");
        setLoadingPresc(false);
        return;
      }

      setPresc((prev) => {
        const items = Array.isArray(prev.items) ? [...prev.items] : [];
        const idx = items.findIndex((i) => i.product_code === product.product_code);
        if (idx >= 0) {
          items[idx].quantity = Number(items[idx].quantity || 0) + 1;
          items[idx] = updateItemCalculationsPresc(items[idx]);
        } else {
          const newItem = updateItemCalculationsPresc({
            product_id: String(resolvedProductId),
            product_code: product.product_code,
            product_name: product.product_name || product.name || "",
            quantity: 1,
            unit_price: Number(product.selling_price || product.price || 0),
            discount_amount: 0,
            tax_percentage: Number(product.tax_percentage || product.tax || 0),
            tax_amount: 0,
            total_price: 0,
            unit: product.unit || "",
            instructions: "",
          });
          items.push(newItem);
        }
        setProductCodePresc("");
        return { ...prev, items };
      });
      toast.success(`${product.product_name || product.product_code} added`);
    } catch (err) {
      console.error("handleProductCode error:", err);
      toast.error("Failed to fetch product");
    } finally {
      setLoadingPresc(false);
    }
  };

  const handleItemChangePresc = (index, field, value) => {
    setPresc((prev) => {
      const items = [...(prev.items || [])];
      if (!items[index]) return prev;
      items[index] = { ...items[index], [field]: value };
      items[index] = updateItemCalculationsPresc(items[index]);
      return { ...prev, items };
    });
  };

  const removeItemPresc = (index) => {
    setPresc((prev) => {
      const items = [...(prev.items || [])];
      items.splice(index, 1);
      return { ...prev, items };
    });
  };

  const calculateSummaryFromItemsPresc = (items) => {
    const subtotal = items.reduce((sum, i) => sum + (Number(i.unit_price) || 0) * (Number(i.quantity) || 0), 0);
    const totalDiscount = items.reduce((sum, i) => sum + (Number(i.discount_amount) || 0), 0);
    const totalTax = items.reduce((sum, i) => sum + (Number(i.tax_amount) || 0), 0);
    const grandTotal = subtotal - totalDiscount + totalTax;
    return { subtotal, totalDiscount, totalTax, grandTotal };
  };

  const handleSubmitPresc = async (e) => {
    e.preventDefault();
    setLoadingPresc(true);
    try {
      const itemsRaw = presc.items || [];
      if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
        toast.error("Add at least one medicine before submitting the prescription.");
        setLoadingPresc(false);
        return;
      }
      for (const it of itemsRaw) {
        if (!it.product_id) {
          toast.error("One or more items missing product_id. Re-add them.");
          setLoadingPresc(false);
          return;
        }
      }

      const items = itemsRaw.map((i) => {
        const item = updateItemCalculationsPresc({ ...i });
        return {
          product_id: String(item.product_id),
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || 0),
          unit: item.unit || "",
          discount_amount: Number(item.discount_amount || 0),
          tax_amount: Number(item.tax_amount || 0),
          total_price: Number(item.total_price || 0),
          instructions: item.instructions || "",
        };
      });

      const subtotal = items.reduce((s, it) => s + (it.unit_price * it.quantity), 0);
      const discount_amount = items.reduce((s, it) => s + (it.discount_amount || 0), 0);
      const tax_amount = items.reduce((s, it) => s + (it.tax_amount || 0), 0);
      const totalQuantity = items.reduce((s, it) => s + (it.quantity || 0), 0);
      const totalAmount = subtotal - discount_amount + tax_amount;

      const payload = {
        // OMIT bill_no so server will auto-generate it
        status: "prescriptions",
        customer_name: presc.customer_name || "",
        customer_phone: presc.customer_phone || "",
        billing_date: presc.billing_date ? dayjs(presc.billing_date).toISOString() : new Date().toISOString(),
        discount_amount,
        tax_amount,
        total_amount: totalAmount,
        total_quantity: totalQuantity,
        notes: presc.remarks || "",
        is_active: true,
        items,
        encounter_id: encounterId || undefined,
        appointment_id: appointment_id || undefined,
      };

      // Use billingService.create by default — replace with prescription service if you have one
      await billingService.create(payload);

      toast.success("Prescription saved successfully");
      // redirect to billing list / prescriptions list
      setTimeout(() => navigate("/billing/list"), 350);
    } catch (err) {
      console.error("create prescription error:", err);
      toast.error(err?.response?.data?.message || "Failed to create prescription");
    } finally {
      setLoadingPresc(false);
    }
  };

  // derived summary
  const prescSummary = calculateSummaryFromItemsPresc(presc.items || []);

  // ---------- UI: return JSX ----------
  return (
    <div className="p-6 w-full flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0E1680]">Doctor’s Consultation Notes</h2>
        <div className="flex gap-3">
          <Button onClick={handleLabTestOrder} className="bg-gradient-to-r from-[#0E1680] to-[#2433D3] text-white shadow-md">Lab Test Order</Button>
          <Button onClick={handleViewTest} className="bg-gradient-to-r from-[#0E1680] to-[#2433D3] text-white shadow-md">View Test</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex bg-[#EEF0FF] rounded-2xl p-1 w-fit shadow-inner">
          {[
            { value: "encounter", label: "Encounter", icon: <Stethoscope size={18} /> },
            { value: "vitals", label: "Vitals", icon: <HeartPulse size={18} /> },
            { value: "diagnosis", label: "Diagnosis", icon: <ClipboardList size={18} /> },
            { value: "clinical", label: "Clinical Note", icon: <FileText size={18} /> },
            { value: "prescriptions", label: "Prescriptions", icon: <FileText size={18} /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`flex items-center gap-2 px-6 py-2 mx-1 rounded-lg text-sm font-semibold transition-all duration-300
                ${activeTab === tab.value
                  ? "bg-gradient-to-r from-[#0E1680] to-[#2433D3] text-white shadow-md scale-105"
                  : "text-[#0E1680]/70 hover:bg-[#DDE0FF] hover:text-[#0E1680]"
                }`}
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Encounter */}
        <TabsContent value="encounter">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-lg font-semibold text-[#0E1680]">Encounter Details</h3>
              {[
                ["chief_complaint", "Chief Complaint"],
                ["history", "Medical History"],
                ["examination", "Examination"],
                ["plan", "Treatment Plan"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="text-sm font-medium">{label}</label>
                  <Textarea name={name} value={encounter[name]} onChange={(e) => handleChange(e, setEncounter)} placeholder={`Enter ${label.toLowerCase()}`} />
                </div>
              ))}
              <div className="flex justify-end">
                <Button className="bg-[#0E1680] text-white px-8" onClick={handleSaveEncounter}>
                  {encounterId ? "Update Encounter" : "Save Encounter"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vitals */}
        <TabsContent value="vitals">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-lg font-semibold text-[#0E1680]">Patient Vitals</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ["height", "Height (cm)"],
                  ["weight", "Weight (kg)"],
                  ["temperature", "Temperature (°C)"],
                  ["pulse", "Pulse (bpm)"],
                  ["blood_pressure", "Blood Pressure (mmHg)"],
                  ["respiratory_rate", "Respiratory Rate (/min)"],
                  ["spo2", "SpO₂ (%)"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label className="text-sm font-medium">{label}</label>
                    <Input name={name} value={vitals[name]} onChange={(e) => handleChange(e, setVitals)} placeholder={label} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button className="bg-[#0E1680] text-white px-8" onClick={handleSaveVitals}>
                  {vitalsId ? "Update Vitals" : "Save Vitals"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnosis */}
        <TabsContent value="diagnosis">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-lg font-semibold text-[#0E1680]">Diagnosis Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ICD Code</label>
                  <Input name="icd_code" value={diagnosis.icd_code} onChange={(e) => handleChange(e, setDiagnosis)} placeholder="Enter ICD code" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" name="primary" checked={diagnosis.primary} onChange={(e) => handleChange(e, setDiagnosis)} className="w-4 h-4 accent-[#0E1680]" />
                  <label className="text-sm font-medium">Primary Diagnosis</label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" value={diagnosis.description} onChange={(e) => handleChange(e, setDiagnosis)} placeholder="Enter diagnosis description" />
              </div>
              <div className="flex justify-end">
                <Button className="bg-[#0E1680] text-white px-8" onClick={handleSaveDiagnosis}>
                  {diagnosisId ? "Update Diagnosis" : "Save Diagnosis"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical */}
        <TabsContent value="clinical">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-lg font-semibold text-[#0E1680]">Doctor’s Clinical Note</h3>
              <div>
                <label className="text-sm font-medium">Clinical Note</label>
                <Textarea name="note" value={clinical.note} onChange={(e) => handleChange(e, setClinical)} placeholder="Enter clinical note" />
              </div>
              <div className="flex justify-end">
                <Button className="bg-[#0E1680] text-white px-8" onClick={handleSaveClinicalNote}>
                  {clinicalId ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions (no Prescription No field; patient name auto-filled from vitals) */}
        <TabsContent value="prescriptions">
          <div className="grid grid-cols-1 gap-6">
            {/* LEFT: form */}
            <div className="bg-white rounded-md p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="text-blue-600 font-semibold">Prescription Details</div>
                <div className="text-sm text-gray-500">{presc.billing_date}</div>
              </div>

              <form onSubmit={handleSubmitPresc} className="space-y-3">
                {/* NOTE: Prescription No removed (server will auto-generate) */}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm">Date</label>
                    <input type="date" value={presc.billing_date} onChange={(e) => setPresc((p) => ({ ...p, billing_date: e.target.value }))} className="w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="text-sm">Patient Name</label>
                    {/* auto-filled from vitals; user can still edit if needed */}
                    <Input value={presc.customer_name} onChange={(e) => setPresc((p) => ({ ...p, customer_name: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm">Phone</label>
                    <Input value={presc.customer_phone} onChange={(e) => setPresc((p) => ({ ...p, customer_phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm">Remarks</label>
                    <Input value={presc.remarks} onChange={(e) => setPresc((p) => ({ ...p, remarks: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="text-sm">Scan / Enter Product Code</label>
                  <div className="flex gap-2">
                    <Input value={productCodePresc} onChange={(e) => setProductCodePresc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleProductCodePresc(productCodePresc); } }} />
                    <button type="button" onClick={() => handleProductCodePresc(productCodePresc)} className="px-3 py-2 bg-[#0E1680] text-white rounded">Add</button>
                  </div>
                </div>

                {/* Items table */}
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Unit Price</th>
                        <th className="p-2">Discount</th>
                        <th className="p-2">Tax</th>
                        <th className="p-2">Total</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {presc.items && presc.items.length > 0 ? presc.items.map((it, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{idx + 1}</td>
                          <td className="p-2">{it.product_name} <div className="text-xs text-gray-400">{it.product_code}</div></td>
                          <td className="p-2">
                            <input type="number" min="1" value={it.quantity} onChange={(e) => handleItemChangePresc(idx, "quantity", Number(e.target.value || 0))} className="w-20 border rounded px-1 py-0.5" />
                          </td>
                          <td className="p-2">₹<input type="number" min="0" value={it.unit_price} onChange={(e) => handleItemChangePresc(idx, "unit_price", Number(e.target.value || 0))} className="w-24 border rounded px-1 py-0.5 inline-block" /></td>
                          <td className="p-2">
                            <input type="number" min="0" value={it.discount_amount || 0} onChange={(e) => handleItemChangePresc(idx, "discount_amount", Number(e.target.value || 0))} className="w-20 border rounded px-1 py-0.5" />
                          </td>
                          <td className="p-2">₹{(it.tax_amount || 0).toFixed(2)}</td>
                          <td className="p-2">₹{(it.total_price || 0).toFixed(2)}</td>
                          <td className="p-2">
                            <button type="button" onClick={() => removeItemPresc(idx)} className="text-red-600">Remove</button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="p-4 text-center text-gray-500" colSpan={8}>No items added</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end items-center gap-3">
                  <div className="text-sm text-gray-600">Subtotal: <strong>₹{prescSummary.subtotal.toFixed(2)}</strong></div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" onClick={() => { setPresc({ billing_date: dayjs().format("YYYY-MM-DD"), customer_name: presc.customer_name || "", customer_phone: "", payment_method: "cash", remarks: "", items: [] }); setProductCodePresc(""); }}>
                    Save Draft
                  </Button>
                  <Button type="submit" className="bg-[#0E1680] text-white" disabled={loadingPresc}>
                    {loadingPresc ? "Saving..." : "Add Prescription"}
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DoctorNotes;
