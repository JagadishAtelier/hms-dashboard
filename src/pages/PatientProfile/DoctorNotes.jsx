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
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Doctor’s Clinical Consultation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Appointment #{appointment_id || "—"} · Record encounter, vitals, diagnosis, and e-prescription
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={handleLabTestOrder} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold">
            Lab Test Order
          </Button>
          <Button onClick={handleViewTest} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold">
            View Tests
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 w-fit shadow-xs gap-1">
          {[
            { value: "encounter", label: "Encounter", icon: <Stethoscope size={16} />, saved: Boolean(encounterId) },
            { value: "vitals", label: "Vitals", icon: <HeartPulse size={16} />, saved: Boolean(vitalsId) },
            { value: "diagnosis", label: "Diagnosis", icon: <ClipboardList size={16} />, saved: Boolean(diagnosisId) },
            { value: "clinical", label: "Clinical Note", icon: <FileText size={16} />, saved: Boolean(clinicalId) },
            { value: "prescriptions", label: "Prescriptions", icon: <FileText size={16} />, saved: presc.items?.length > 0 },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all
                ${activeTab === tab.value
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
            >
              {tab.icon}
              {tab.label}
              {tab.saved && (
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === tab.value ? "bg-white" : "bg-emerald-500"}`} />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Encounter */}
        <TabsContent value="encounter">
          <Card className="border border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Encounter Details</h3>
                {encounterId && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2 py-0.5 rounded-full">
                    Encounter Saved
                  </span>
                )}
              </div>
              {[
                ["chief_complaint", "Chief Complaint"],
                ["history", "Medical History"],
                ["examination", "Examination"],
                ["plan", "Treatment Plan"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
                  <Textarea name={name} value={encounter[name]} onChange={(e) => handleChange(e, setEncounter)} placeholder={`Enter ${label.toLowerCase()}...`} className="mt-1" />
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 font-medium shadow-sm" onClick={handleSaveEncounter}>
                  {encounterId ? "Update Encounter" : "Save Encounter"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vitals */}
        <TabsContent value="vitals">
          <Card className="border border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Patient Vitals</h3>
                {vitalsId && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2 py-0.5 rounded-full">
                    Vitals Recorded
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
                    <Input name={name} value={vitals[name]} onChange={(e) => handleChange(e, setVitals)} placeholder={label} className="mt-1" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 font-medium shadow-sm" onClick={handleSaveVitals}>
                  {vitalsId ? "Update Vitals" : "Save Vitals"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnosis */}
        <TabsContent value="diagnosis">
          <Card className="border border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Diagnosis Details</h3>
                {diagnosisId && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2 py-0.5 rounded-full">
                    Diagnosis Recorded
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">ICD Code</label>
                  <Input name="icd_code" value={diagnosis.icd_code} onChange={(e) => handleChange(e, setDiagnosis)} placeholder="e.g. J06.9 (Acute URI)" className="mt-1" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" name="primary" checked={diagnosis.primary} onChange={(e) => handleChange(e, setDiagnosis)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600" />
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Primary Diagnosis</label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Clinical Description</label>
                <Textarea name="description" value={diagnosis.description} onChange={(e) => handleChange(e, setDiagnosis)} placeholder="Enter detailed diagnostic findings..." className="mt-1" />
              </div>
              <div className="flex justify-end pt-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 font-medium shadow-sm" onClick={handleSaveDiagnosis}>
                  {diagnosisId ? "Update Diagnosis" : "Save Diagnosis"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical */}
        <TabsContent value="clinical">
          <Card className="border border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Doctor’s Clinical Note</h3>
                {clinicalId && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2 py-0.5 rounded-full">
                    Note Recorded
                  </span>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Clinical Note</label>
                <Textarea name="note" value={clinical.note} rows={4} onChange={(e) => handleChange(e, setClinical)} placeholder="Enter comprehensive clinical assessment notes..." className="mt-1" />
              </div>
              <div className="flex justify-end pt-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 font-medium shadow-sm" onClick={handleSaveClinicalNote}>
                  {clinicalId ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions */}
        <TabsContent value="prescriptions">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <div className="text-slate-900 font-bold text-base">e-Prescription & Pharmacy Order</div>
                <div className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">{presc.billing_date}</div>
              </div>

              <form onSubmit={handleSubmitPresc} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</label>
                    <input type="date" value={presc.billing_date} onChange={(e) => setPresc((p) => ({ ...p, billing_date: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Patient Name</label>
                    <Input value={presc.customer_name} onChange={(e) => setPresc((p) => ({ ...p, customer_name: e.target.value }))} className="mt-1" placeholder="Patient name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</label>
                    <Input value={presc.customer_phone} onChange={(e) => setPresc((p) => ({ ...p, customer_phone: e.target.value }))} className="mt-1" placeholder="Phone number" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Doctor Remarks</label>
                    <Input value={presc.remarks} onChange={(e) => setPresc((p) => ({ ...p, remarks: e.target.value }))} className="mt-1" placeholder="Instructions for patient/pharmacist" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Search / Scan Medication Product Code</label>
                  <div className="flex gap-2 mt-1">
                    <Input value={productCodePresc} onChange={(e) => setProductCodePresc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleProductCodePresc(productCodePresc); } }} placeholder="Scan barcode or enter medication code..." />
                    <Button type="button" onClick={() => handleProductCodePresc(productCodePresc)} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">Add Item</Button>
                  </div>
                </div>

                {/* Items table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 text-left font-semibold text-slate-600">#</th>
                        <th className="p-3 text-left font-semibold text-slate-600">Product / Medication</th>
                        <th className="p-3 text-center font-semibold text-slate-600">Qty</th>
                        <th className="p-3 text-right font-semibold text-slate-600">Unit Price</th>
                        <th className="p-3 text-right font-semibold text-slate-600">Discount</th>
                        <th className="p-3 text-right font-semibold text-slate-600">Tax</th>
                        <th className="p-3 text-right font-semibold text-slate-600">Total</th>
                        <th className="p-3 text-center font-semibold text-slate-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {presc.items && presc.items.length > 0 ? presc.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-medium text-slate-800">{it.product_name} <div className="text-[11px] text-slate-400 font-mono">{it.product_code}</div></td>
                          <td className="p-3 text-center">
                            <input type="number" min="1" value={it.quantity} onChange={(e) => handleItemChangePresc(idx, "quantity", Number(e.target.value || 0))} className="w-16 text-center border border-slate-200 rounded px-1.5 py-0.5 text-xs" />
                          </td>
                          <td className="p-3 text-right font-mono">₹<input type="number" min="0" value={it.unit_price} onChange={(e) => handleItemChangePresc(idx, "unit_price", Number(e.target.value || 0))} className="w-20 text-right border border-slate-200 rounded px-1.5 py-0.5 text-xs inline-block" /></td>
                          <td className="p-3 text-right font-mono">
                            <input type="number" min="0" value={it.discount_amount || 0} onChange={(e) => handleItemChangePresc(idx, "discount_amount", Number(e.target.value || 0))} className="w-16 text-right border border-slate-200 rounded px-1.5 py-0.5 text-xs" />
                          </td>
                          <td className="p-3 text-right font-mono text-slate-600">₹{(it.tax_amount || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-semibold text-slate-900">₹{(it.total_price || 0).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button type="button" onClick={() => removeItemPresc(idx)} className="text-rose-600 hover:text-rose-700 font-medium">Remove</button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="p-6 text-center text-slate-400 text-xs" colSpan={8}>No medication items added yet. Search or scan above to add.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end items-center gap-3 pt-2">
                  <div className="text-sm text-slate-600">Estimated Total: <strong className="font-mono text-slate-900 text-base">₹{prescSummary.subtotal.toFixed(2)}</strong></div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setPresc({ billing_date: dayjs().format("YYYY-MM-DD"), customer_name: presc.customer_name || "", customer_phone: "", payment_method: "cash", remarks: "", items: [] }); setProductCodePresc(""); }} className="border-slate-200 text-slate-700 hover:bg-slate-50">
                    Clear Form
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium" disabled={loadingPresc}>
                    {loadingPresc ? "Submitting..." : "Submit Prescription"}
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
