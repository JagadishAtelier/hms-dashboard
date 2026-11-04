import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import billableItemService from "../../service/billableItemService.js";
import clinicalMasterService from "../../service/clinicalMasterService.js";

const TYPES = ["Service", "Product", "Medication", "LabTest", "Surgery", "Room"];

const typeHint = {
    Service: "General service (consultation, cleaning, etc.)",
    Product: "Physical product — syncs to Products table",
    Medication: "Medicine/drug — syncs to Products table",
    LabTest: "Lab test — syncs to Lab Tests master",
    Surgery: "Surgical procedure — syncs to Procedures table",
    Room: "Hospital room — syncs to Rooms table",
};

const typeColor = {
    Service: "bg-blue-50 text-blue-700 border-blue-200",
    Product: "bg-green-50 text-green-700 border-green-200",
    Medication: "bg-purple-50 text-purple-700 border-purple-200",
    LabTest: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Surgery: "bg-red-50 text-red-700 border-red-200",
    Room: "bg-orange-50 text-orange-700 border-orange-200",
};

export default function BillableItemForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Masters state
    const [methods, setMethods] = useState([]);
    const [unitsList, setUnitsList] = useState([]);
    const [turnaroundTimes, setTurnaroundTimes] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);

    const [form, setForm] = useState({
        name: "", type: "Service", cost: "", price: "", category: "",
        tax_rate: "", tags: "", sku: "", barcode: "", manufacturer: "",
        duration: "", description: "", status: "Active",
        stock_tracking: false, initial_stock: "", reorder_level: "",
        // LabTest specific
        method: "", units: "", reference_range: "", turnaround_time: "",
        // Surgery specific
        risk_level: "Low",
        // Room specific
        ward_id: "", room_type: "General Ward", capacity: "",
    });

    useEffect(() => {
        // Load clinical masters
        const loadMasters = async () => {
            try {
                const [m, u, t, r] = await Promise.all([
                    clinicalMasterService.getMastersByCategory("LAB_METHOD"),
                    clinicalMasterService.getMastersByCategory("LAB_UNIT"),
                    clinicalMasterService.getMastersByCategory("TURNAROUND_TIME"),
                    clinicalMasterService.getMastersByCategory("ROOM_TYPE"),
                ]);
                setMethods(m);
                setUnitsList(u);
                setTurnaroundTimes(t);
                setRoomTypes(r);
            } catch (err) {
                console.error("Failed to load masters in billable item form", err);
            }
        };
        loadMasters();

        if (!id) return;
        setFetching(true);
        billableItemService.getById(id)
            .then(res => {
                const d = res?.data?.data || res?.data;
                setForm(prev => ({ ...prev, ...d, cost: d.cost ?? "", price: d.price ?? "" }));
            })
            .catch(() => toast.error("Failed to load item"))
            .finally(() => setFetching(false));
    }, [id]);

    const set = (k, v) => setForm(p => {
        const next = { ...p, [k]: v };
        if ((k === "cost" || k === "price") && next.cost && next.price) {
            const cost = parseFloat(next.cost), price = parseFloat(next.price);
            if (cost > 0) next.profit_margin = ((price - cost) / cost * 100).toFixed(2);
        }
        return next;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) { toast.error("Name and price are required"); return; }

        const payload = {
            name: form.name, type: form.type,
            cost: parseFloat(form.cost) || 0,
            price: parseFloat(form.price),
            category: form.category || null,
            tax_rate: form.tax_rate || null,
            tags: form.tags || null,
            stock_tracking: form.stock_tracking,
            initial_stock: form.stock_tracking ? parseInt(form.initial_stock) || 0 : null,
            current_stock: form.stock_tracking ? parseInt(form.initial_stock) || 0 : null,
            reorder_level: form.stock_tracking ? parseInt(form.reorder_level) || 0 : null,
            sku: form.sku || null, barcode: form.barcode || null,
            manufacturer: form.manufacturer || null,
            duration: form.duration || null,
            description: form.description || null,
            status: form.status,
            // type-specific
            method: form.method || null,
            units: form.units || null,
            reference_range: form.reference_range || null,
            turnaround_time: form.turnaround_time || null,
            risk_level: form.risk_level || null,
            ward_id: form.ward_id || null,
            room_type: form.room_type || null,
            capacity: form.capacity ? parseInt(form.capacity) : null,
        };

        setLoading(true);
        try {
            if (isEdit) {
                await billableItemService.update(id, payload);
                toast.success("Item updated");
            } else {
                await billableItemService.create(payload);
                toast.success("Item created");
            }
            navigate("/billable-items");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save item");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    const isLabTest = form.type === "LabTest";
    const isSurgery = form.type === "Surgery";
    const isRoom    = form.type === "Room";
    const isProduct = form.type === "Product" || form.type === "Medication";

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{isEdit ? "Edit Billable Item" : "New Billable Item"}</h1>
            <p className="text-sm text-gray-500 mb-6">Master catalog entry with automated sub-table synchronization</p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                {/* Item Type selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Type *</label>
                    <div className="grid grid-cols-3 gap-2">
                        {TYPES.map(t => (
                            <button key={t} type="button" onClick={() => set("type", t)}
                                className={`p-3 rounded-lg border text-left transition text-sm cursor-pointer ${
                                    form.type === t ? `${typeColor[t]} font-semibold ring-2 ring-indigo-500` : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}>
                                <div className="font-medium">{t}</div>
                                <div className="text-xs text-gray-400 mt-0.5 truncate">{typeHint[t].split("—")[0]}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Basic info */}
                <div className="grid md:grid-cols-2 gap-4">
                    <label className="col-span-2">Item Name *
                        <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Complete Blood Count / Consultation Fee" required />
                    </label>
                    <label>Selling Price (Rs.) *
                        <Input type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" required />
                    </label>
                    <label>Cost / Purchase Price (Rs.)
                        <Input type="number" step="0.01" value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="0.00" />
                    </label>
                    {form.profit_margin && (
                        <div className="col-span-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                            Profit Margin: <strong>{form.profit_margin}%</strong>
                        </div>
                    )}
                    <label>Category
                        <Input value={form.category} onChange={e => set("category", e.target.value)}
                            placeholder={isRoom ? "ICU / Private / General" : isLabTest ? "e.g. Hematology" : "e.g. Outpatient"} />
                    </label>
                    {!isRoom && (
                        <label>Tax Rate
                            <Input value={form.tax_rate} onChange={e => set("tax_rate", e.target.value)} placeholder="e.g. 5%" />
                        </label>
                    )}
                    {!isRoom && !isLabTest && (
                        <label>SKU
                            <Input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="Auto-generated if blank" />
                        </label>
                    )}
                </div>

                {/* LabTest specific fields with Radix-UI Select */}
                {isLabTest && (
                    <>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Lab Test Parameters</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Method *</label>
                                <Select value={form.method} onValueChange={val => set("method", val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {methods.map(m => (
                                            <SelectItem key={m.code || m.display_label} value={m.display_label}>{m.display_label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Units *</label>
                                <Select value={form.units} onValueChange={val => set("units", val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-56 overflow-y-auto">
                                        {unitsList.map(u => (
                                            <SelectItem key={u.code || u.display_label} value={u.display_label}>{u.display_label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Reference Range</label>
                                <Input value={form.reference_range} onChange={e => set("reference_range", e.target.value)} placeholder="e.g. 70-110 mg/dL" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Turnaround Time (SLA)</label>
                                <Select value={form.turnaround_time} onValueChange={val => set("turnaround_time", val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select SLA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {turnaroundTimes.map(tat => (
                                            <SelectItem key={tat.code || tat.display_label} value={tat.display_label}>{tat.display_label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                )}

                {/* Surgery specific fields with Radix-UI Select */}
                {isSurgery && (
                    <>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Surgery / Procedure Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Risk Level</label>
                                <Select value={form.risk_level || "Low"} onValueChange={val => set("risk_level", val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Risk Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low Risk</SelectItem>
                                        <SelectItem value="Medium">Medium Risk</SelectItem>
                                        <SelectItem value="High">High Risk</SelectItem>
                                        <SelectItem value="Critical">Critical Risk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Duration (min)</label>
                                <Input type="number" value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="e.g. 45" />
                            </div>
                        </div>
                    </>
                )}

                {/* Room specific fields with Radix-UI Select */}
                {isRoom && (
                    <>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Room Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Room Category</label>
                                <Select value={form.room_type || "General Ward"} onValueChange={val => set("room_type", val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Room Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomTypes.map(rt => (
                                            <SelectItem key={rt.code || rt.display_label} value={rt.display_label}>{rt.display_label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Capacity (beds)</label>
                                <Input type="number" value={form.capacity} onChange={e => set("capacity", e.target.value)} placeholder="1" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Ward ID</label>
                                <Input value={form.ward_id} onChange={e => set("ward_id", e.target.value)} placeholder="Ward UUID (to sync to Rooms table)" />
                            </div>
                        </div>
                    </>
                )}

                {/* Product/Medication specific */}
                {isProduct && (
                    <>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Product Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <label>Manufacturer
                                <Input value={form.manufacturer} onChange={e => set("manufacturer", e.target.value)} />
                            </label>
                            <label>Barcode
                                <Input value={form.barcode} onChange={e => set("barcode", e.target.value)} />
                            </label>
                            <label className="col-span-2">Tags
                                <Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="comma separated" />
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="stock_tracking" checked={form.stock_tracking} onChange={e => set("stock_tracking", e.target.checked)} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                            <label htmlFor="stock_tracking" className="text-sm font-medium">Enable Stock Tracking</label>
                        </div>
                        {form.stock_tracking && (
                            <div className="grid md:grid-cols-2 gap-4">
                                <label>Initial Stock<Input type="number" value={form.initial_stock} onChange={e => set("initial_stock", e.target.value)} /></label>
                                <label>Reorder Level<Input type="number" value={form.reorder_level} onChange={e => set("reorder_level", e.target.value)} /></label>
                            </div>
                        )}
                    </>
                )}

                <label className="block">Description
                    <textarea className="border border-gray-300 rounded-md p-2 w-full mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" rows={3} value={form.description} onChange={e => set("description", e.target.value)} />
                </label>

                <div className="flex items-center gap-3">
                    <input type="checkbox" id="status" checked={form.status === "Active"} onChange={e => set("status", e.target.checked ? "Active" : "Inactive")} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                    <label htmlFor="status" className="text-sm font-medium">Active in Billing and Order Catalogs</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={() => navigate("/billable-items")}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="bg-[#0E1680] hover:bg-[#0b1163] text-white">
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                        {isEdit ? "Update Billable Item" : "Create Billable Item"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
