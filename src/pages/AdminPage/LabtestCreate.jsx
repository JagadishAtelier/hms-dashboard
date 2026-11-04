import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FlaskConical, Clock, Activity, ShieldAlert, Sparkles } from "lucide-react";
import labtestService from "../../service/labtestService.js";
import clinicalMasterService from "../../service/clinicalMasterService.js";

export default function LabtestCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  // Clinical Masters State
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [specimens, setSpecimens] = useState([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState([]);

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "",
    method: "",
    units: "",
    reference_range: "",
    critical_low: "",
    critical_high: "",
    turnaround_time: "",
    default_specimen_type: "",
    amount: "500",
    is_active: true,
  });

  // Load Clinical Master options
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [cats, meths, uns, specs, tats] = await Promise.all([
          clinicalMasterService.getMastersByCategory("LAB_CATEGORY"),
          clinicalMasterService.getMastersByCategory("LAB_METHOD"),
          clinicalMasterService.getMastersByCategory("LAB_UNIT"),
          clinicalMasterService.getMastersByCategory("SPECIMEN_TYPE"),
          clinicalMasterService.getMastersByCategory("TURNAROUND_TIME"),
        ]);
        setCategories(cats);
        setMethods(meths);
        setUnitsList(uns);
        setSpecimens(specs);
        setTurnaroundTimes(tats);
      } catch (err) {
        console.error("Failed to load clinical masters", err);
      }
    };
    loadMasters();
  }, []);

  // Fetch existing lab test (edit mode)
  useEffect(() => {
    if (!isEdit) return;
    const fetchLabtest = async () => {
      setFetching(true);
      try {
        const res = await labtestService.getLabTestById(id);
        const data = res?.data?.data || res?.data || res;
        setForm({
          name: data.name || "",
          code: data.code || "",
          category: data.category || "",
          method: data.method || "",
          units: data.units || "",
          reference_range: data.reference_range || "",
          critical_low: data.critical_low !== null && data.critical_low !== undefined ? String(data.critical_low) : "",
          critical_high: data.critical_high !== null && data.critical_high !== undefined ? String(data.critical_high) : "",
          turnaround_time: data.turnaround_time || "",
          default_specimen_type: data.default_specimen_type || "",
          amount: data.amount ? String(data.amount) : "500",
          is_active: data.is_active ?? true,
        });
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Failed to load lab test details");
      } finally {
        setFetching(false);
      }
    };
    fetchLabtest();
  }, [id, isEdit]);

  // Intelligent auto-determination of Specimen Type as name/code/category changes
  const handleNameBlur = () => {
    if (!form.default_specimen_type && (form.name || form.code || form.category)) {
      const autoSpecimen = clinicalMasterService.determineSpecimen(form.name, form.code, form.category);
      if (autoSpecimen) {
        setForm((prev) => ({ ...prev, default_specimen_type: autoSpecimen }));
      }
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Lab test name is required";
    if (!form.code.trim()) newErrors.code = "Lab test code is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.method.trim()) newErrors.method = "Method is required";
    if (!form.units.trim()) newErrors.units = "Units are required";
    if (!form.reference_range.trim()) newErrors.reference_range = "Reference range is required";
    if (!form.turnaround_time.trim()) newErrors.turnaround_time = "Turnaround time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount) || 0,
        critical_low: form.critical_low !== "" ? parseFloat(form.critical_low) : null,
        critical_high: form.critical_high !== "" ? parseFloat(form.critical_high) : null,
      };

      if (isEdit) {
        await labtestService.updateLabTest(id, payload);
        toast.success("Lab test updated successfully");
      } else {
        await labtestService.createLabTest(payload);
        toast.success("Lab test created successfully");
      }
      navigate("/labtest");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0E1680]">
            {isEdit ? "Edit Diagnostic Test" : "Create Diagnostic Test"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configured test parameters, biological reference intervals, and automated specimen accessioning rules
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/labtest")}>
          Back to Catalog
        </Button>
      </div>

      {fetching ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lab Test Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Lab Test Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={handleNameBlur}
                placeholder="e.g. Complete Blood Count (CBC)"
                className="w-full"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Code */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Test Code / LOINC <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value)}
                onBlur={handleNameBlur}
                placeholder="e.g. CBC-01"
                className="w-full uppercase"
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>

            {/* Category Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Diagnostic Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.category}
                onValueChange={(val) => {
                  handleChange("category", val);
                  if (!form.default_specimen_type) {
                    const autoSpecimen = clinicalMasterService.determineSpecimen(form.name, form.code, val);
                    if (autoSpecimen) handleChange("default_specimen_type", autoSpecimen);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.code || cat.display_label} value={cat.display_label}>
                      {cat.display_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            {/* Method Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Analytical Method <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.method}
                onValueChange={(val) => handleChange("method", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Analytical Method" />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m.code || m.display_label} value={m.display_label}>
                      {m.display_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.method && <p className="text-xs text-red-500 mt-1">{errors.method}</p>}
            </div>

            {/* Units Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Reporting Units <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.units}
                onValueChange={(val) => handleChange("units", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Reporting Unit" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {unitsList.map((u) => (
                    <SelectItem key={u.code || u.display_label} value={u.display_label}>
                      {u.display_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.units && <p className="text-xs text-red-500 mt-1">{errors.units}</p>}
            </div>

            {/* Default Specimen Type (Auto-Determined or Selectable) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Specimen / Collection Tube
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const auto = clinicalMasterService.determineSpecimen(form.name, form.code, form.category);
                    handleChange("default_specimen_type", auto);
                    toast.info(`Auto-determined: ${auto}`);
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" /> Auto-Detect
                </button>
              </div>
              <Select
                value={form.default_specimen_type}
                onValueChange={(val) => handleChange("default_specimen_type", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Specimen Type" />
                </SelectTrigger>
                <SelectContent>
                  {specimens.map((sp) => (
                    <SelectItem key={sp.code || sp.display_label} value={sp.display_label}>
                      {sp.display_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Turnaround Time Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Turnaround Time (SLA) <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.turnaround_time}
                onValueChange={(val) => handleChange("turnaround_time", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select SLA Duration" />
                </SelectTrigger>
                <SelectContent>
                  {turnaroundTimes.map((tat) => (
                    <SelectItem key={tat.code || tat.display_label} value={tat.display_label}>
                      {tat.display_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.turnaround_time && <p className="text-xs text-red-500 mt-1">{errors.turnaround_time}</p>}
            </div>

            {/* Base Tariff Amount */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Tariff Amount (Rs.)
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="500.00"
                className="w-full"
              />
            </div>
          </div>

          {/* Reference Intervals & Critical Panic Bounds */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Biological Reference Intervals & Critical Alarm Thresholds
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Standard Reference Range <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.reference_range}
                  onChange={(e) => handleChange("reference_range", e.target.value)}
                  placeholder="e.g. 70 - 110 mg/dL"
                />
                {errors.reference_range && (
                  <p className="text-xs text-red-500 mt-1">{errors.reference_range}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Critical Panic Low Threshold (&lt;)
                </label>
                <Input
                  type="number"
                  step="any"
                  value={form.critical_low}
                  onChange={(e) => handleChange("critical_low", e.target.value)}
                  placeholder="e.g. 50 (triggers emergency alarm)"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Critical Panic High Threshold (&gt;)
                </label>
                <Input
                  type="number"
                  step="any"
                  value={form.critical_high}
                  onChange={(e) => handleChange("critical_high", e.target.value)}
                  placeholder="e.g. 400 (triggers emergency alarm)"
                />
              </div>
            </div>
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <span className="text-sm font-semibold text-slate-800">Test Active Status</span>
              <p className="text-xs text-slate-500">Enable or disable this test in clinical ordering catalogs</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(val) => handleChange("is_active", val)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => navigate("/labtest")}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0E1680] hover:bg-[#0b1163] text-white font-medium"
              disabled={loading}
            >
              {loading ? "Saving Diagnostic Master..." : isEdit ? "Update Test Master" : "Save Test Master"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
