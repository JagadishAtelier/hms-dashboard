import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import billableItemService from "../../service/billableItemService.js";

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

    const [form, setForm] = useState({
        name: "", type: "Service", cost: "", price: "", category: "",
        tax_rate: "", tags: "", sku: "", barcode: "", manufacturer: "",
        duration: "", description: "", status: "Active",
        stock_tracking: false, initial_stock: "", reorder_level: "",
        // LabTest specific
        method: "", units: "", reference_range: "", turnaround_time: "",
        // Surgery specific
        risk_level: "",
        // Room specific
        ward_id: "", room_type: "General", capacity: "",
    });

    useEffect(() => {
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
            if (isEdit) { await billableItemService.update(id, payload); toast.success("Updated successfully"); }
            else { await billableItemService.create(payload); toast.success("Created successfully"); }
            navigate("/billable-items");
        } catch (err) { toast.error(err?.response?.data?.message || "Operation failed"); }
        finally { setLoading(false); }
    };

    if (fetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={24} /></div>;

    const isLabTest = form.type === "LabTest";
    const isSurgery = form.type === "Surgery";
    const isRoom = form.type === "Room";
    const isProduct = form.type === "Product" || form.type === "Medication";

    return (
        <div className="md:p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">{isEdit ? "Edit Item" : "Add Billable Item"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">

                {/* Type selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {TYPES.map(t => (
                            <button key={t} type="button" onClick={() => set("type", t)}
                                className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all ${form.type === t ? typeColor[t] : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                    {typeHint[form.type] && (
                        <p className="text-xs text-gray-400 mt-1.5">{typeHint[form.type]}</p>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <label>Name <span className="text-red-500">*</span>
                        <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder={isRoom ? "Room number e.g. R-101" : "Item name"} />
                    </label>
                    <label>Price (₹) <span className="text-red-500">*</span>
                        <Input type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} placeholder={isRoom ? "Price per day" : "Selling price"} />
                    </label>
                    {!isRoom && !isLabTest && (
                        <label>Cost (₹)
                            <Input type="number" step="0.01" value={form.cost} onChange={e => set("cost", e.target.value)} />
                        </label>
                    )}
                    <label>Category
                        <Input value={form.category} onChange={e => set("category", e.target.value)}
                            placeholder={isRoom ? "ICU / Private / General" : isLabTest ? "e.g. Haematology" : "e.g. Laboratory"} />
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

                {/* LabTest specific fields */}
                {isLabTest && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Lab Test Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <label>Method <span className="text-red-500">*</span>
                                <Input value={form.method} onChange={e => set("method", e.target.value)} placeholder="e.g. ELISA, PCR" />
                            </label>
                            <label>Units
                                <Input value={form.units} onChange={e => set("units", e.target.value)} placeholder="e.g. mg/dL" />
                            </label>
                            <label>Reference Range
                                <Input value={form.reference_range} onChange={e => set("reference_range", e.target.value)} placeholder="e.g. 70-110 mg/dL" />
                            </label>
                            <label>Turnaround Time
                                <Input value={form.turnaround_time} onChange={e => set("turnaround_time", e.target.value)} placeholder="e.g. 2 hours" />
                            </label>
                        </div>
                    </>
                )}

                {/* Surgery specific fields */}
                {isSurgery && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Surgery / Procedure Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <label>Risk Level
                                <select className="border rounded-md p-2 w-full mt-1" value={form.risk_level} onChange={e => set("risk_level", e.target.value)}>
                                    <option value="">Select risk level</option>
                                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                                </select>
                            </label>
                            <label>Duration (min)
                                <Input type="number" value={form.duration} onChange={e => set("duration", e.target.value)} />
                            </label>
                        </div>
                    </>
                )}

                {/* Room specific fields */}
                {isRoom && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Room Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <label>Room Type
                                <select className="border rounded-md p-2 w-full mt-1" value={form.room_type} onChange={e => set("room_type", e.target.value)}>
                                    <option>General</option><option>Private</option><option>ICU</option>
                                </select>
                            </label>
                            <label>Capacity (beds)
                                <Input type="number" value={form.capacity} onChange={e => set("capacity", e.target.value)} />
                            </label>
                            <label className="col-span-2">Ward ID
                                <Input value={form.ward_id} onChange={e => set("ward_id", e.target.value)} placeholder="Ward UUID (required to sync to Rooms table)" />
                            </label>
                        </div>
                    </>
                )}

                {/* Product/Medication specific */}
                {isProduct && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Product Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <label>Manufacturer
                                <Input value={form.manufacturer} onChange={e => set("manufacturer", e.target.value)} />
                            </label>
                            <label>Barcode
                                <Input value={form.barcode} onChange={e => set("barcode", e.target.value)} />
                            </label>
                            <label>Tags
                                <Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="comma separated" />
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="stock_tracking" checked={form.stock_tracking} onChange={e => set("stock_tracking", e.target.checked)} className="w-4 h-4" />
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
                    <textarea className="border rounded-md p-2 w-full mt-1 text-sm" rows={3} value={form.description} onChange={e => set("description", e.target.value)} />
                </label>

                <div className="flex items-center gap-3">
                    <input type="checkbox" id="status" checked={form.status === "Active"} onChange={e => set("status", e.target.checked ? "Active" : "Inactive")} className="w-4 h-4" />
                    <label htmlFor="status" className="text-sm font-medium">Active</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/billable-items")}>Cancel</Button>
                    <Button type="submit" className="bg-[#0E1680] text-white" disabled={loading}>
                        {loading ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
