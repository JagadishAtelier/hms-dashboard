import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Search, Trash2, X, ArrowLeft, User, Phone, ChevronDown, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import posService from "../../service/posService.js";
import patientService from "../../service/patientService.js";
import admissionsService from "../../service/addmissionsService.js";
import appointmentsService from "../../service/appointmentsService.js";
import whatsappService from "../../service/whatsappService.js";
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
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const editId = searchParams.get("edit");
    const isEdit = Boolean(editId);
    const dropdownRef = useRef(null);

    // Items catalogue
    const [allItems, setAllItems] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [itemSearch, setItemSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Cart
    const [cart, setCart] = useState([]);

    // Patient / Customer
    const [phoneQuery, setPhoneQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [admissions, setAdmissions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [notes, setNotes] = useState("");

    // Payment
    const [saving, setSaving] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [saleStatus, setSaleStatus] = useState("completed");
    const [paidAmount, setPaidAmount] = useState("");
    const [completedSale, setCompletedSale] = useState(null);
    const [sendingWA, setSendingWA] = useState(false);
    // Session payment
    const [showSessionPay, setShowSessionPay] = useState(false);
    const [sessionAmount, setSessionAmount] = useState("");

    // Load billable items catalogue
    useEffect(() => {
        setLoading(true);
        posService.getAllItems({ limit: 500, status: "Active" })
            .then(res => setAllItems(res?.data?.data?.data ?? []))
            .catch(() => toast.error("Failed to load items"))
            .finally(() => setLoading(false));
    }, []);

    // Pre-fill from prescription (navigate state)
    useEffect(() => {
        const prefill = location.state?.prefill;
        if (!prefill) return;
        if (prefill.customerName) setCustomerName(prefill.customerName);
        if (prefill.customerPhone) setCustomerPhone(prefill.customerPhone);
        if (prefill.notes) setNotes(prefill.notes);
        if (Array.isArray(prefill.cart) && prefill.cart.length > 0) {
            setCart(prefill.cart);
        }
        // Clear state so refresh doesn't re-apply
        window.history.replaceState({}, document.title);
    }, [location.state]);

    // If edit mode — load existing sale and prefill everything
    useEffect(() => {
        if (!editId) return;
        posService.getSaleById(editId)
            .then(res => {
                const sale = res?.data?.data ?? res?.data;
                if (!sale) return;
                setCustomerName(sale.customer_name || "");
                setCustomerPhone(sale.customer_phone || "");
                setNotes(sale.notes || "");
                setPaymentMethod(sale.payment_method || "cash");
                setSaleStatus(sale.status || "completed");
                // Prefill cart from sale items
                if (Array.isArray(sale.items)) {
                    setCart(sale.items.map(i => ({
                        id: i.billable_item_id,
                        name: i.item_name,
                        type: i.item_type || "Service",
                        price: parseFloat(i.unit_price),
                        qty: i.quantity,
                        tax_rate: parseFloat(i.tax_amount || 0) / (parseFloat(i.unit_price) * i.quantity || 1) * 100,
                        _sale_item_id: i.id,
                    })));
                }
            })
            .catch(() => toast.error("Failed to load sale"));
    }, [editId]);

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
            if (list.length === 0) { toast.error("No patient found"); return; }
            const p = list[0];
            setPatient(p);
            setCustomerName(`${p.first_name} ${p.last_name}`);
            setCustomerPhone(p.phone || phoneQuery);
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
        } catch { toast.error("Failed to search patient"); }
        finally { setSearching(false); }
    };

    const selectRecord = (type, record) => {
        setSelectedRecord({ type, data: record });
        setShowDropdown(false);
        if (type === "appointment") {
            const doc = record.doctor ? `Dr. ${record.doctor.first_name} ${record.doctor.last_name}` : "";
            setNotes(`Appointment: ${record.appointment_no || record.id} | ${doc} | ${dayjs(record.scheduled_at).format("DD MMM YYYY HH:mm")}`);
        } else {
            setNotes(`Admission: ${record.admission_no || record.id} | Ward: ${record.ward?.name || "—"} | Room: ${record.room?.room_number || record.room?.room_no || "—"} | ${dayjs(record.admission_date).format("DD MMM YYYY")}`);
        }
    };

    const clearPatient = () => {
        setPatient(null); setPhoneQuery(""); setCustomerName(""); setCustomerPhone("");
        setAppointments([]); setAdmissions([]); setSelectedRecord(null); setNotes("");
    };

    // Cart ops
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

    const buildSalePayload = ({ paid, due, change, autoStatus } = {}) => {
        const paidAmt = paid ?? total;
        const dueAmt = due ?? 0;
        const changeAmt = change ?? 0;
        const status = isEdit ? saleStatus : (autoStatus ?? "completed");
        return {
            customer_name: customerName || "Walk-in Customer",
            customer_phone: customerPhone || null,
            subtotal_amount: subtotal,
            tax_amount: tax,
            discount_amount: 0,
            total_amount: total,
            paid_amount: paidAmt,
            due_amount: dueAmt,
            change_amount: changeAmt,
            payment_method: paymentMethod,
            status,
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
        };
    };

    const handleConfirmPayment = async ({ paid, due, change, autoStatus } = {}) => {
        if (cart.length === 0) { toast.error("Cart is empty"); return; }
        setSaving(true);
        try {
            let result;
            const payload = buildSalePayload({ paid, due, change, autoStatus });
            if (isEdit) {
                result = await posService.updateSale(editId, payload);
                toast.success("Sale updated!");
            } else {
                result = await posService.createSale(payload);
                toast.success("Sale completed!");
            }
            const sale = result?.data?.data ?? result?.data;
            setCompletedSale({ ...sale, customer_phone: customerPhone, customer_name: customerName || "Customer" });
            setShowPayment(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save sale");
        } finally { setSaving(false); }
    };

    const handleSendWhatsApp = async () => {
        if (!completedSale?.customer_phone) { toast.error("No phone number available"); return; }
        const phone = completedSale.customer_phone.replace(/\D/g, '');
        if (phone.length < 10) { toast.error("Invalid phone number"); return; }
        setSendingWA(true);
        try {
            await whatsappService.sendReceipt({
                to: phone,
                customerName: completedSale.customer_name || "Customer",
                amount: parseFloat(completedSale.total_amount || total).toFixed(0),
                transactionId: completedSale.sale_no || completedSale.id || "TXN",
                date: dayjs(completedSale.sale_date || new Date()).format("YYYY-MM-DD"),
                saleId: completedSale.id,
            });
            toast.success("Receipt sent on WhatsApp!");
            setCompletedSale(null);
            navigate("/pos/sales");
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to send WhatsApp");
        } finally { setSendingWA(false); }
    };

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
                <button onClick={() => navigate("/pos/sales")} className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    <ArrowLeft size={14} /> Sales List
                </button>
                <h1 className="text-lg font-bold text-[#0E1680]">
                    {isEdit ? "Edit Sale" : "Point of Sale"}
                </h1>
                <div className="w-24" />
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
                {/* LEFT — Patient + Cart */}
                <div className="w-full lg:w-[45%] bg-white border-r border-gray-200 flex flex-col overflow-hidden">

                    {/* Patient Search */}
                    <div className="p-4 border-b border-gray-100 space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient / Customer</p>
                        <div className="flex gap-2" ref={dropdownRef}>
                            <div className="relative flex-1">
                                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input value={phoneQuery} onChange={e => setPhoneQuery(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handlePhoneSearch()}
                                    placeholder="Search by phone number..."
                                    className="w-full pl-8 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30" />
                            </div>
                            <button onClick={handlePhoneSearch} disabled={searching}
                                className="px-3 py-2 bg-[#506EE4] text-white rounded-lg text-sm hover:bg-[#3f56c2] disabled:opacity-60 shrink-0">
                                {searching ? "..." : "Search"}
                            </button>
                        </div>

                        {patient && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 relative">
                                <button onClick={clearPatient} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                <div className="flex items-center gap-2 mb-1">
                                    <User size={14} className="text-blue-600" />
                                    <span className="font-semibold text-sm text-gray-800">{patient.first_name} {patient.last_name}</span>
                                    <span className="text-xs text-gray-500">#{patient.patient_code}</span>
                                </div>
                                <p className="text-xs text-gray-500">{patient.phone} · {patient.email}</p>
                                {(appointments.length > 0 || admissions.length > 0) && (
                                    <div className="mt-2 relative">
                                        <button onClick={() => setShowDropdown(v => !v)}
                                            className="flex items-center gap-1 text-xs text-[#506EE4] font-medium hover:underline">
                                            <ChevronDown size={12} />
                                            {selectedRecord ? `Selected: ${selectedRecord.type === "appointment" ? "Appointment" : "Admission"}` : "Link to Appointment / Admission"}
                                        </button>
                                        {showDropdown && (
                                            <div className="absolute left-0 top-6 z-30 w-80 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                                                {appointments.length > 0 && (<>
                                                    <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">Appointments</p>
                                                    {appointments.map(a => (
                                                        <button key={a.id} onClick={() => selectRecord("appointment", a)}
                                                            className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-50">
                                                            <p className="text-sm font-medium text-gray-800">{a.appointment_no || "Appointment"} · {dayjs(a.scheduled_at).format("DD MMM YYYY")}</p>
                                                            <p className="text-xs text-gray-500">{a.doctor ? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}` : ""} · {a.status}</p>
                                                        </button>
                                                    ))}
                                                </>)}
                                                {admissions.length > 0 && (<>
                                                    <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">Admissions</p>
                                                    {admissions.map(a => (
                                                        <button key={a.id} onClick={() => selectRecord("admission", a)}
                                                            className="w-full text-left px-3 py-2 hover:bg-purple-50 border-b border-gray-50">
                                                            <p className="text-sm font-medium text-gray-800">{a.admission_no || "Admission"} · {dayjs(a.admission_date).format("DD MMM YYYY")}</p>
                                                            <p className="text-xs text-gray-500">Ward: {a.ward?.name || "—"} · Room: {a.room?.room_number || a.room?.room_no || "—"} · {a.status}</p>
                                                        </button>
                                                    ))}
                                                </>)}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {selectedRecord && <div className="mt-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600">{notes}</div>}
                            </div>
                        )}

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

                        {/* Session payment quick-add */}
                        {showSessionPay ? (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2">
                                <p className="text-xs font-semibold text-indigo-700">Session Payment</p>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={sessionAmount}
                                        onChange={e => setSessionAmount(e.target.value)}
                                        placeholder="Enter session amount..."
                                        className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                                        autoFocus
                                    />
                                    <button onClick={() => {
                                        if (!sessionAmount || parseFloat(sessionAmount) <= 0) { toast.error("Enter a valid amount"); return; }
                                        // Add session fee as a cart item
                                        const sessionItem = {
                                            id: `session-${Date.now()}`,
                                            name: `Session Fee`,
                                            type: "Service",
                                            price: parseFloat(sessionAmount),
                                            qty: 1,
                                            tax_rate: 0,
                                        };
                                        setCart(prev => {
                                            const existing = prev.find(p => p.id.startsWith("session-"));
                                            if (existing) return prev.map(p => p.id.startsWith("session-") ? { ...p, price: parseFloat(sessionAmount) } : p);
                                            return [...prev, sessionItem];
                                        });
                                        setShowSessionPay(false);
                                        setSessionAmount("");
                                        toast.success(`Session fee ₹${sessionAmount} added to cart`);
                                    }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                                        Add
                                    </button>
                                    <button onClick={() => { setShowSessionPay(false); setSessionAmount(""); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-4 gap-2 pt-2">
                            {["cash", "card", "upi"].map(m => (
                                <button key={m} onClick={() => { setPaymentMethod(m); setPaidAmount(total.toFixed(2)); setShowPayment(true); }}
                                    className={`py-2 rounded-lg text-sm font-medium ${m === "cash" ? "bg-green-600 text-white" : m === "card" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"}`}>
                                    {m.toUpperCase()}
                                </button>
                            ))}
                            <button onClick={() => setShowSessionPay(v => !v)}
                                className="py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
                                Session
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT — Items catalogue */}
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

            {/* Payment / Confirm Modal */}
            {showPayment && (() => {
                const paid = parseFloat(paidAmount) || 0;
                const due = Math.max(total - paid, 0);
                const change = paid > total ? paid - total : 0;
                const isPartial = paid > 0 && paid < total;
                const autoStatus = paid <= 0 ? "pending" : isPartial ? "pending" : "completed";
                return (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[440px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setShowPayment(false)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-1">{isEdit ? "Update Sale" : "Confirm Payment"}</h2>
                        {customerName && <p className="text-sm text-gray-500 mb-3">Patient: <span className="font-medium text-gray-700">{customerName}</span></p>}

                        <div className="space-y-3 text-sm">
                            {/* Summary */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{fmt(tax)}</span></div>
                                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
                                    <span>Total</span><span>{fmt(total)}</span>
                                </div>
                            </div>

                            {/* Paid Amount input */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Amount Paid by Customer</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={paidAmount}
                                    onChange={e => setPaidAmount(e.target.value)}
                                    placeholder={`Full amount: ${total.toFixed(2)}`}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30"
                                />
                            </div>

                            {/* Live feedback */}
                            {paid > 0 && (
                                <div className={`rounded-lg p-3 space-y-1.5 text-sm ${isPartial ? "bg-yellow-50 border border-yellow-200" : paid > total ? "bg-blue-50 border border-blue-200" : "bg-green-50 border border-green-200"}`}>
                                    {isPartial && (
                                        <div className="flex justify-between font-semibold text-yellow-700">
                                            <span>⚠ Pending Due</span>
                                            <span>{fmt(due)}</span>
                                        </div>
                                    )}
                                    {change > 0 && (
                                        <div className="flex justify-between font-semibold text-blue-700">
                                            <span>💵 Change to Return</span>
                                            <span>{fmt(change)}</span>
                                        </div>
                                    )}
                                    {!isPartial && change === 0 && (
                                        <div className="flex justify-between font-semibold text-green-700">
                                            <span>✓ Fully Paid</span>
                                            <span>{fmt(paid)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs text-gray-500 border-t border-gray-200 pt-1.5">
                                        <span>Status</span>
                                        <span className={`font-semibold capitalize ${autoStatus === "completed" ? "text-green-600" : "text-yellow-600"}`}>
                                            {autoStatus}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Payment Method */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Payment Method</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                    {["cash", "card", "upi", "net_banking", "wallet"].map(m => (
                                        <option key={m} value={m}>{m.replace("_", " ").toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status override (edit mode) */}
                            {isEdit && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                                    <select value={saleStatus} onChange={e => setSaleStatus(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                        <option value="completed">Completed</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" placeholder="Optional notes..." />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowPayment(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleConfirmPayment({ paid, due, change, autoStatus })} disabled={saving}
                                className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#3f56c2] disabled:opacity-60">
                                {saving ? "Saving..." : isEdit ? "Update Sale" : "Confirm Sale"}
                            </button>
                        </div>
                    </div>
                </div>
                );
            })()}
            {/* WhatsApp Receipt Modal */}
            {completedSale && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageCircle size={28} className="text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">
                            {isEdit ? "Sale Updated!" : "Sale Completed!"}
                        </h2>
                        <p className="text-sm text-gray-500 mb-1">
                            {completedSale.sale_no} · ₹{parseFloat(completedSale.total_amount || total).toLocaleString("en-IN")}
                        </p>
                        {completedSale.customer_phone ? (
                            <>
                                <p className="text-sm text-gray-500 mb-5">
                                    Send receipt to <span className="font-medium text-gray-700">{completedSale.customer_phone}</span> via WhatsApp?
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => { setCompletedSale(null); navigate("/pos/sales"); }}
                                        className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">
                                        Skip
                                    </button>
                                    <button onClick={handleSendWhatsApp} disabled={sendingWA}
                                        className="flex-1 bg-[#25D366] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1ebe5d] disabled:opacity-60 flex items-center justify-center gap-2">
                                        <MessageCircle size={15} />
                                        {sendingWA ? "Sending..." : "Send on WhatsApp"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button onClick={() => { setCompletedSale(null); navigate("/pos/sales"); }}
                                className="w-full bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#3f56c2]">
                                Go to Sales List
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
