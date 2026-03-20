import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import prescriptionService from '../../service/prescriptionService.js';
import productService from '../../service/productService.js';

const EMPTY_ITEM = { medicine_name: '', product_id: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: '', unit_price: '', total_price: '' };

function Prescription() {
    const { patient_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const appointment_id = new URLSearchParams(location.search).get('appointment_id');
    const admission_id = new URLSearchParams(location.search).get('admission_id');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [prescriptionId, setPrescriptionId] = useState(null);
    const [products, setProducts] = useState([]);

    const [form, setForm] = useState({
        notes: '',
        status: 'active',
        items: [{ ...EMPTY_ITEM }],
    });

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const init = async () => {
        setLoading(true);
        try {
            // load products for medicine dropdown
            const res = await productService.getAll({ limit: 500 });
            const list = res?.data?.data ?? res?.data ?? [];
            setProducts(Array.isArray(list) ? list : []);

            if (appointment_id) await fetchExisting();
        } catch (err) {
            console.error('Init error', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchExisting = async () => {
        try {
            const res = await prescriptionService.getPrescriptionByAppointmentId(appointment_id);
            const data = res?.data ?? res;
            if (data?.id) {
                setPrescriptionId(data.id);
                setForm({
                    notes: data.notes || '',
                    status: data.status || 'active',
                    items: (data.items || []).length
                        ? data.items.map(i => ({
                            id: i.id,
                            product_id: i.product_id || '',
                            medicine_name: i.medicine_name || '',
                            dosage: i.dosage || '',
                            frequency: i.frequency || '',
                            duration: i.duration || '',
                            instructions: i.instructions || '',
                            quantity: i.quantity || '',
                            unit_price: i.unit_price || '',
                            total_price: i.total_price || '',
                        }))
                        : [{ ...EMPTY_ITEM }],
                });
            }
        } catch {
            // no existing prescription — fine
        }
    };

    // When a product is selected from dropdown, auto-fill name + price
    const handleProductSelect = (idx, productId) => {
        const product = products.find(p => p.id === productId);
        setForm(prev => {
            const items = [...prev.items];
            const qty = Number(items[idx].quantity) || 1;
            const unitPrice = product ? Number(product.selling_price || 0) : 0;
            items[idx] = {
                ...items[idx],
                product_id: productId,
                medicine_name: product ? product.product_name : items[idx].medicine_name,
                unit_price: unitPrice,
                total_price: +(unitPrice * qty).toFixed(2),
            };
            return { ...prev, items };
        });
    };

    const handleItemChange = (idx, field, value) => {
        setForm(prev => {
            const items = [...prev.items];
            items[idx] = { ...items[idx], [field]: value };

            // recalculate total when qty or unit_price changes
            if (field === 'quantity' || field === 'unit_price') {
                const qty = field === 'quantity' ? Number(value) : Number(items[idx].quantity);
                const price = field === 'unit_price' ? Number(value) : Number(items[idx].unit_price);
                items[idx].total_price = isNaN(qty * price) ? '' : +(qty * price).toFixed(2);
            }

            return { ...prev, items };
        });
    };

    const handleAddItem = () => {
        setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
    };

    const handleRemoveItem = (idx) => {
        setForm(prev => {
            const items = prev.items.filter((_, i) => i !== idx);
            return { ...prev, items: items.length ? items : [{ ...EMPTY_ITEM }] };
        });
    };

    const grandTotal = form.items.reduce((sum, i) => sum + (Number(i.total_price) || 0), 0);

    const validate = () => {
        if (!patient_id) { toast.error('Patient ID is missing'); return false; }
        for (let i = 0; i < form.items.length; i++) {
            if (!form.items[i].medicine_name?.trim()) {
                toast.error(`Enter medicine name for row ${i + 1}`);
                return false;
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                patient_id,
                appointment_id: appointment_id || undefined,
                admission_id: admission_id || undefined,
                notes: form.notes || undefined,
                status: form.status,
                items: form.items.map(i => ({
                    id: i.id,
                    product_id: i.product_id || undefined,
                    medicine_name: i.medicine_name,
                    dosage: i.dosage || undefined,
                    frequency: i.frequency || undefined,
                    duration: i.duration || undefined,
                    instructions: i.instructions || undefined,
                    quantity: i.quantity ? Number(i.quantity) : undefined,
                    unit_price: i.unit_price !== '' ? Number(i.unit_price) : undefined,
                    total_price: i.total_price !== '' ? Number(i.total_price) : undefined,
                })),
            };

            if (prescriptionId) {
                await prescriptionService.updatePrescription(prescriptionId, { notes: payload.notes, status: payload.status, items: payload.items });
                toast.success('Prescription updated');
            } else {
                const res = await prescriptionService.createPrescription(payload);
                const data = res?.data ?? res;
                setPrescriptionId(data?.id ?? data);
                toast.success('Prescription created');
            }
            navigate(-1);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save prescription');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 flex items-center justify-center h-64 text-gray-500 text-sm">Loading...</div>;
    }

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#0E1680]">Prescription</h2>
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            </div>

            {/* Header fields */}
            <Card className="mb-6">
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div>
                        <label className="text-sm font-medium">Status</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full border rounded px-2 py-2 mt-1 text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="dispensed">Dispensed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Input
                            value={form.notes}
                            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes..."
                            className="mt-1"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Medicine items */}
            <Card className="mb-6">
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[#0E1680]">Medicines</h3>
                        <Button onClick={handleAddItem}>Add Medicine</Button>
                    </div>

                    <div className="space-y-4">
                        {form.items.map((item, idx) => (
                            <div key={item.id ?? idx} className="border rounded p-3 space-y-3">
                                <div className="grid grid-cols-12 gap-3 items-start">
                                    {/* Product dropdown */}
                                    <div className="col-span-12 sm:col-span-4">
                                        <label className="text-xs font-medium">Select from Inventory</label>
                                        <select
                                            value={item.product_id}
                                            onChange={e => handleProductSelect(idx, e.target.value)}
                                            className="w-full border rounded px-2 py-2 mt-1 text-sm"
                                        >
                                            <option value="">-- Select product --</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.product_name} ({p.product_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Medicine name (editable, auto-filled from product) */}
                                    <div className="col-span-12 sm:col-span-4">
                                        <label className="text-xs font-medium">Medicine Name *</label>
                                        <Input
                                            value={item.medicine_name}
                                            onChange={e => handleItemChange(idx, 'medicine_name', e.target.value)}
                                            placeholder="e.g. Paracetamol"
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Dosage */}
                                    <div className="col-span-6 sm:col-span-2">
                                        <label className="text-xs font-medium">Dosage</label>
                                        <Input
                                            value={item.dosage}
                                            onChange={e => handleItemChange(idx, 'dosage', e.target.value)}
                                            placeholder="500mg"
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Remove button */}
                                    <div className="col-span-6 sm:col-span-2 flex items-end justify-end">
                                        <Button variant="secondary" onClick={() => handleRemoveItem(idx)} className="h-9 text-xs w-full">Remove</Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 gap-3 items-start">
                                    <div className="col-span-6 sm:col-span-2">
                                        <label className="text-xs font-medium">Frequency</label>
                                        <Input value={item.frequency} onChange={e => handleItemChange(idx, 'frequency', e.target.value)} placeholder="3x daily" className="mt-1" />
                                    </div>
                                    <div className="col-span-6 sm:col-span-2">
                                        <label className="text-xs font-medium">Duration</label>
                                        <Input value={item.duration} onChange={e => handleItemChange(idx, 'duration', e.target.value)} placeholder="5 days" className="mt-1" />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="text-xs font-medium">Qty</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                            placeholder="1"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="text-xs font-medium">Unit Price (₹)</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                                            placeholder="0.00"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="text-xs font-medium">Total (₹)</label>
                                        <Input
                                            value={item.total_price !== '' ? item.total_price : ''}
                                            readOnly
                                            className="mt-1 bg-gray-50 font-semibold text-[#0E1680]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-2">
                                        <label className="text-xs font-medium">Instructions</label>
                                        <Input value={item.instructions} onChange={e => handleItemChange(idx, 'instructions', e.target.value)} placeholder="After meals" className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grand total */}
                    <div className="flex justify-end mt-4 border-t pt-3">
                        <div className="text-right">
                            <span className="text-sm text-gray-500 mr-4">Grand Total</span>
                            <span className="text-lg font-bold text-[#0E1680]">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button className="bg-[#0E1680] text-white" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : prescriptionId ? 'Update Prescription' : 'Create Prescription'}
                </Button>
            </div>
        </div>
    );
}

export default Prescription;
