import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, X, ArrowLeft, User, Phone, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import posService from "../../service/posService.js";
import patientService from "../../service/patientService.js";
import admissionsService from "../../service/addmissionsService.js";
import appointmentsService from "../../service/appointmentsService.js";
import dayjs from "dayjs";

const fmt = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

const typeColor = (type) => ({
    Service: "bg-blue-100 text-blue-700",
    Product: "bg-green-100 text-green-700",
    Medication: "bg-purple-100 text-purple-700",
    LabTest: "bg-yellow-100 text-yellow-700",
    Surgery: "bg-red-100 text-red-700",
    Room: "bg-orange-100 text-orange-700",
}[type] ?? "bg-gray-100 text-gray-600");

export default function POSPage() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Items
    const [allItems, setAllItems] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [itemSearch, setItemSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Cart
    const [cart, setCart] = useState([]);

    // Patient / Customer
    const [phoneQuery, setPhoneQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [patient, setPatient] = useState(null);           // selected patient
    const [appointments, setAppointments] = useState([]);
    const [admissions, setAdmissions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null); // { type: 'appointment'|'admission', data }

    // Customer fields (autofilled or manual)
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [notes, setNotes] = useState("");

    // Payment
    const [saving, setSaving] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");

    // Load billable items
    useEffect(() => {
        setLoading(true);
        posService.getAllItems({ limit: 500, status: "Active" })
            .then(res => setAllItems(res?.data?.data?.data ?? []))
            .catch(() => toast.error("Failed to load items"))
            .finally(() => setLoading(false));
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Search patient by phone
    const handlePhoneSearch = async () => {
        if (!phoneQuery.trim()) return;
        setSearching(true);
        setPatient(null); setAppointments([]); setAdmissions([]); setSelectedRecord(null);
        try {
            const res = await patientService.getAllPatients({ search: phoneQuery, limit: 5 });
            const rows = res?.data?.data ?? res?.data ?? [];
            const list = Array.isArray(rows) ? rows : rows?.data ?? [];
            if (list.length === 0) { toast.error("No patient found with this phone number"); return; }
            const p = list[0];
            setPatient(p);
            setCustomerName(`${p.first_name} ${p.last_name}`);
            setCustomerPhone(p.phone || phoneQuery);

            // Fetch appointments & admissions in parallel
            const [apptRes, admRes] = await Promise.allSettled([
                appointmentsService.getByPatientId(p.id),
                admissionsService.getAllAdmissions({ patient_id: p.id, limit: 10 }),
            ]);

            if (apptRes.status === "fulfilled") {
                const d = apptRes.value?.data ?? apptRes.value;
                setAppointments(Array.isArray(d) ? d : d?.data ?? []);
            }
            if (admRes.status === "fulfilled") {
                const d = admRes.value?.data ?? admRes.value;
                setAdmissions(Array.isArray(d) ? d : d?.data ?? []);
            }
            setShowDropdown(true);
        } catch (err) {
            toast.error("Failed to search patient");
        } finally { setSearching(false); }
    };

    const selectRecord = (type, record) => {
        setSelectedRecord({ type, data: record });
        setShowDropdown(false);

        if (type === "appointment") {
            const doc = record.doctor ? `Dr. ${record.doctor.first_name} ${record.doctor.last_name}` : "";
            setNotes(`Appointment: ${record.appointment_no || record.id} | ${doc} | ${dayjs(record.scheduled_at).format("DD MMM YYYY HH:mm")}`);
        } else {
            const ward = record.ward?.name || "";
            const room = record.room?.room_number || record.room?.room_no || "";
            setNotes(`Admission: ${record.admission_no || record.id} | Ward: ${ward} | Room: ${room} | ${dayjs(record.admission_date).format("DD MMM YYYY")}`);
        }
    };

    const clearPatient = () => {
        setPatient(null); setPhoneQuery(""); setCustomerName(""); setCustomerPhone("");
        setAppointments([]); setAdmissions([]); setSelectedRecord(null); setNotes("");
    };

    // Cart
    const addToCart = (item) => {
        setCart(prev => {
            const exist = prev.find(p => p.id === item.id);
            if (exist) return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p);
            const taxRate = parseFloat((item.tax_rate || "0").toString().replace("%", "")) || 0;
            return [...prev, { id: item.id, name: item.name, price: parseFloat(item.price), type: item.type, qty: 1, tax_rate: taxRate }];
        });
    };
    const updateQty = (id, delta) => setCart(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p));
    const removeItem = (id) => setCart(prev => prev.filter(p => p.id !== id));

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = cart.reduce((s, i) => s + (i.price * i.qty) * (i.tax_rate / 100), 0);
    const total = subtotal + tax;

    const filteredItems = allItems.filter(item => {
        const matchTab = activeTab === "all" || item.type.toLowerCase() === activeTab.toLowerCase();
        const matchSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase()) || (item.sku || "").toLowerCase().includes(itemSearch.toLowerCase());
        return matchTab && matchSearch;
    });

    const handleConfirmPayment = async () => {
        if (cart.length === 0) { toast.error("Cart is empty"); return; }
        setSaving(true);
        try {
            await posService.createSale({
                customer_name: customerName || "Walk-in Customer",
                customer_phone: customerPhone || null,
                subtotal_amount: subtotal,
                tax_amount: tax,
                discount_amount: 0,
                total_amount: total,
                paid_amount: total,
                payment_method: paymentMethod,
                status: "completed",
                notes: notes || null,
                items: cart.map(item => ({
                    billable_item_id: item.id,
                    item_name: item.name,
                    item_type: item.type,
                    quantity: item.qty,
                    unit_price: item.price,
                    discount_amount: 0,
                    tax_amount: (item.price * item.qty) * (item.tax_rate / 100),
                    total_price: (item.price * item.qty) * (1 + item.tax_rate / 100),
                })),
            });
            toast.success("Sale completed!");
            setCart([]); clearPatient(); setShowPayment(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to complete sale");
        } finally { setSaving(false); }
    };

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    <ArrowLeft size={14} /> Back
                </button>
                <h1 className="text-lg font-bold text-[#0E1680]">Point of Sale</h1>
                <div className="w-20" />
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
                {/* LEFT — Patient + Cart */}
                <div className="w-full lg:w-[45%] bg-white border-r border-gray-200 flex flex-col overflow-hidden">

                    {/* Patient Search */}
                    <div className="p-4 border-b border-gray-100 space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient / Customer</p>

                        {/* Phone search */}
                        <div className="flex gap-2" ref={dropdownRef}>
                            <div className="relative flex-1">
                                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={phoneQuery}
                                    onChange={e => setPhoneQuery(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handlePhoneSearch()}
                                    placeholder="Search by phone number..."
                                    className="w-full pl-8 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30"
                                />
                            </div>
                            <button onClick={handlePhoneSearch} disabled={searching}
                                className="px-3 py-2 bg-[#506EE4] text-white rounded-lg text-sm hover:bg-[#3f56c2] disabled:opacity-60 shrink-0">
                                {searching ? "..." : "Search"}
                            </button>
                        </div>

                        {/* Patient found card */}
                        {patient && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 relative">
                                <button onClick={clearPatient} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                <div className="flex items-center gap-2 mb-1">
                                    <User size={14} className="text-blue-600" />
                                    <span className="font-semibold text-sm text-gray-800">{patient.first_name} {patient.last_name}</span>
                                    <span className="text-xs text-gray-500">#{patient.patient_code}</span>
                                </div>
                                <p className="text-xs text-gray-500">{patient.phone} · {patient.email}</p>

                                {/* Select appointment or admission */}
                                {(appointments.length > 0 || admissions.length > 0) && (
                                    <div className="mt-2 relative">
                                        <button onClick={() => setShowDropdown(v => !v)}
                                            className="flex items-center gap-1 text-xs text-[#506EE4] font-medium hover:underline">
                                            <ChevronDown size={12} />
                                            {selectedRecord
                                                ? `Selected: ${selectedRecord.type === "appointment" ? "Appointment" : "Admission"}`
                                                : "Link to Appointment / Admission"}
                                        </button>

                                        {showDropdown && (
                                            <div className="absolute left-0 top-6 z-30 w-80 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                                                {appointments.length > 0 && (
                                                    <>
                                                        <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">Appointments</p>
                                                        {appointments.map(a => (
                                                            <button key={a.id} onClick={() => selectRecord("appointment", a)}
                                                                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                                                                <p className="text-sm font-medium text-gray-800">
                                                                    {a.appointment_no || "Appointment"} · {dayjs(a.scheduled_at).format("DD MMM YYYY")}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {a.doctor ? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}` : ""} · {a.status}
                                                                </p>
                                                            </button>
                                                        ))}
                                                    </>
                                                )}
                                                {admissions.length > 0 && (
                                                    <>
                                                        <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">Admissions</p>
                                                        {admissions.map(a => (
                                                            <button key={a.id} onClick={() => selectRecord("admission", a)}
                                                                className="w-full text-left px-3 py-2 hover:bg-purple-50 border-b border-gray-50 last:border-0">
                                                                <p className="text-sm font-medium text-gray-800">
                                                                    {a.admission_no || "Admission"} · {dayjs(a.admission_date).format("DD MMM YYYY")}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Ward: {a.ward?.name || "—"} · Room: {a.room?.room_number || a.room?.room_no || "—"} · {a.status}
                                                                </p>
                                                            </button>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedRecord && (
                                    <div className="mt-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600">
                                        {notes}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual fallback if no patient found */}
                        {!patient && (
                            <div className="grid grid-cols-2 gap-2">
                                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Name (optional)"
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30" />
                                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone (optional)"
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30" />
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <p className="text-lg font-semibold">Cart is empty</p>
                                <p className="text-sm">Select items from the right panel</p>
                            </div>
                        ) : cart.map(item => (
                            <div key={item.id} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${typeColor(item.type)}`}>{item.type}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-[#506EE4] hover:text-white transition">-</button>
                                    <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-[#506EE4] hover:text-white transition">+</button>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-sm text-gray-800">{fmt(item.price * item.qty)}</p>
                                    <p className="text-xs text-gray-400">{item.qty} × {fmt(item.price)}</p>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={15} /></button>
                            </div>
                        ))}
                    </div>

                    {/* Totals + Pay */}
                    <div className="p-4 border-t border-gray-200 bg-white space-y-2 shrink-0">
                        <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                        <div className="flex justify-between text-sm text-gray-600"><span>Tax</span><span>{fmt(tax)}</span></div>
                        <div className="flex justify-between text-lg font-bold text-gray-800 pt-1 border-t border-gray-100"><span>Total</span><span>{fmt(total)}</span></div>
                        <div className="grid grid-cols-3 gap-2 pt-2">
                            {["cash", "card", "upi"].map(m => (
                                <button key={m} onClick={() => { setPaymentMethod(m); setShowPayment(true); }}
                                    className={`py-2 rounded-lg text-sm font-medium ${m === "cash" ? "bg-green-600 text-white" : m === "card" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"}`}>
                                    {m.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT — Items */}
                <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
                    <div className="relative shrink-0">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={itemSearch} onChange={e => setItemSearch(e.target.value)} placeholder="Search items..."
                            className="w-full pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30" />
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                        {["all", "service", "product", "medication", "labtest", "surgery", "room"].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1 rounded-lg text-sm capitalize ${activeTab === tab ? "bg-[#506EE4] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                                {tab === "all" ? "All" : tab === "labtest" ? "Lab Test" : tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {loading ? (
                            <div className="text-center py-10 text-gray-400">Loading items...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No items found</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredItems.map(item => (
                                    <div key={item.id} onClick={() => addToCart(item)}
                                        className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[#506EE4] hover:shadow-md transition-all">
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${typeColor(item.type)}`}>{item.type}</span>
                                        <p className="font-semibold text-gray-800 text-sm mt-2 leading-tight">{item.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.sku}</p>
                                        <p className="text-[#506EE4] font-bold mt-2">{fmt(parseFloat(item.price))}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[420px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setShowPayment(false)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-1">Confirm Payment</h2>
                        {customerName && <p className="text-sm text-gray-500 mb-4">Patient: <span className="font-medium text-gray-700">{customerName}</span></p>}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{fmt(tax)}</span></div>
                            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{fmt(total)}</span></div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Payment Method</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                    {["cash", "card", "upi", "net_banking", "wallet"].map(m => (
                                        <option key={m} value={m}>{m.replace("_", " ").toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" placeholder="Optional notes..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowPayment(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleConfirmPayment} disabled={saving}
                                className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#3f56c2] disabled:opacity-60">
                                {saving ? "Processing..." : "Confirm Sale"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
