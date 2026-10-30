import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Search, Trash2, X, ArrowLeft, User, Phone, ChevronDown, ChevronUp, MessageCircle, LayoutDashboard, Printer, ShoppingCart, CreditCard, Plus, Minus } from "lucide-react";
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

    // Responsive device detection
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1200
    );
    const [mobileCartOpen, setMobileCartOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;

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

    const totalItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    const renderCartContent = (isDrawer = false) => (
        <div className="flex flex-col h-full bg-white select-none">
            {/* Patient Search & Profile */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient / Customer</p>
                    {patient && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Linked
                        </span>
                    )}
                </div>

                <div className="flex gap-2" ref={dropdownRef}>
                    <div className="relative flex-1">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            value={phoneQuery} 
                            onChange={e => setPhoneQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handlePhoneSearch()}
                            placeholder="Search by phone number..."
                            className="w-full pl-9 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={handlePhoneSearch} 
                        disabled={searching}
                        className="px-3.5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 active:scale-95 disabled:opacity-60 shrink-0 transition-all cursor-pointer shadow-xs"
                    >
                        {searching ? "..." : "Search"}
                    </button>
                </div>

                {patient && (
                    <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 relative">
                        <button 
                            type="button"
                            onClick={clearPatient} 
                            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove Patient"
                        >
                            <X size={14} />
                        </button>
                        <div className="flex items-center gap-2 mb-1">
                            <User size={14} className="text-indigo-600 shrink-0" />
                            <span className="font-bold text-sm text-slate-900 truncate">{patient.first_name} {patient.last_name}</span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-100">#{patient.patient_code}</span>
                        </div>
                        <p className="text-xs text-slate-500">{patient.phone} {patient.email ? `· ${patient.email}` : ""}</p>
                        
                        {(appointments.length > 0 || admissions.length > 0) && (
                            <div className="mt-2.5 relative">
                                <button 
                                    type="button"
                                    onClick={() => setShowDropdown(v => !v)}
                                    className="flex items-center gap-1 text-xs text-indigo-700 font-bold hover:underline"
                                >
                                    <ChevronDown size={13} />
                                    {selectedRecord ? `Selected: ${selectedRecord.type === "appointment" ? "Appointment" : "Admission"}` : "Link to Appointment / Admission"}
                                </button>
                                {showDropdown && (
                                    <div className="absolute left-0 top-7 z-30 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-1.5">
                                        {appointments.length > 0 && (
                                            <>
                                                <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointments</p>
                                                {appointments.map(a => (
                                                    <button 
                                                        key={a.id} 
                                                        type="button"
                                                        onClick={() => selectRecord("appointment", a)}
                                                        className="w-full text-left px-2.5 py-2 hover:bg-indigo-50/70 rounded-lg border-b border-slate-50 last:border-0 transition-colors"
                                                    >
                                                        <p className="text-xs font-bold text-slate-800">{a.appointment_no || "Appointment"} · {dayjs(a.scheduled_at).format("DD MMM YYYY")}</p>
                                                        <p className="text-[11px] text-slate-500">{a.doctor ? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}` : ""} · {a.status}</p>
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                        {admissions.length > 0 && (
                                            <>
                                                <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admissions</p>
                                                {admissions.map(a => (
                                                    <button 
                                                        key={a.id} 
                                                        type="button"
                                                        onClick={() => selectRecord("admission", a)}
                                                        className="w-full text-left px-2.5 py-2 hover:bg-purple-50 rounded-lg border-b border-slate-50 last:border-0 transition-colors"
                                                    >
                                                        <p className="text-xs font-bold text-slate-800">{a.admission_no || "Admission"} · {dayjs(a.admission_date).format("DD MMM YYYY")}</p>
                                                        <p className="text-[11px] text-slate-500">Ward: {a.ward?.name || "—"} · Room: {a.room?.room_number || a.room?.room_no || "—"}</p>
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedRecord && (
                            <div className="mt-2 bg-white/90 border border-indigo-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium">
                                {notes}
                            </div>
                        )}
                    </div>
                )}

                {!patient && (
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            value={customerName} 
                            onChange={e => setCustomerName(e.target.value)} 
                            placeholder="Name (optional)"
                            className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                        />
                        <input 
                            value={customerPhone} 
                            onChange={e => setCustomerPhone(e.target.value)} 
                            placeholder="Phone (optional)"
                            className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                        />
                    </div>
                )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 min-h-[160px] custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full py-12 flex flex-col items-center justify-center text-slate-400">
                        <ShoppingCart size={36} className="text-slate-300 mb-2 stroke-1" />
                        <p className="text-sm font-bold text-slate-600">Cart is empty</p>
                        <p className="text-xs text-slate-400 mt-0.5">Select items from the catalogue</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between gap-2.5 bg-white hover:border-slate-300 transition-all shadow-2xs">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{item.name}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${typeColor(item.type)}`}>
                                    {item.type}
                                </span>
                            </div>

                            {/* Stepper Buttons (>= 36px touch targets) */}
                            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                <button 
                                    type="button"
                                    onClick={() => updateQty(item.id, -1)} 
                                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white active:scale-90 transition-all cursor-pointer font-bold text-sm"
                                    aria-label="Decrease quantity"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center text-xs font-black text-slate-800">{item.qty}</span>
                                <button 
                                    type="button"
                                    onClick={() => updateQty(item.id, 1)} 
                                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white active:scale-90 transition-all cursor-pointer font-bold text-sm"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="font-black text-xs sm:text-sm text-slate-900">{fmt(item.price * item.qty)}</p>
                                <p className="text-[10px] text-slate-400">{item.qty} × {fmt(item.price)}</p>
                            </div>

                            <button 
                                type="button"
                                onClick={() => removeItem(item.id)} 
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 active:scale-90 transition-all shrink-0 cursor-pointer"
                                aria-label="Remove item"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Totals + Quick Actions */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200/90 bg-white space-y-2.5 shrink-0">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-700">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Tax</span>
                    <span className="font-bold text-slate-700">{fmt(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-100">
                    <span>Total</span>
                    <span className="text-indigo-600">{fmt(total)}</span>
                </div>

                {/* Session payment quick-add */}
                {showSessionPay && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                        <p className="text-xs font-bold text-indigo-700">Add Session Fee</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={sessionAmount}
                                onChange={e => setSessionAmount(e.target.value)}
                                placeholder="Enter session amount..."
                                className="flex-1 border border-indigo-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white font-semibold"
                                autoFocus
                            />
                            <button 
                                type="button"
                                onClick={() => {
                                    if (!sessionAmount || parseFloat(sessionAmount) <= 0) { toast.error("Enter a valid amount"); return; }
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
                                    toast.success(`Session fee ₹${sessionAmount} added`);
                                }} 
                                className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95"
                            >
                                Add
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setShowSessionPay(false); setSessionAmount(""); }} 
                                className="px-3 py-2 border border-slate-200 rounded-xl text-xs hover:bg-slate-100"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Buttons Grid */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                    {["cash", "card", "upi"].map(m => (
                        <button 
                            key={m} 
                            type="button"
                            disabled={cart.length === 0}
                            onClick={() => { 
                                if (isDrawer) setMobileCartOpen(false);
                                setPaymentMethod(m); 
                                setPaidAmount(total.toFixed(2)); 
                                setShowPayment(true); 
                            }}
                            className={`py-2.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer ${
                                m === "cash" 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" 
                                    : m === "card" 
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20" 
                                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                    <button 
                        type="button"
                        onClick={() => setShowSessionPay(v => !v)}
                        className="py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 transition-all cursor-pointer shadow-indigo-600/20 shadow-xs"
                    >
                        Session
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-full bg-[#F8FAFC] flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => navigate("/dashboard")} 
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl active:scale-95 transition-all" 
                        title="Return to Atelier HMS Dashboard"
                    >
                        <LayoutDashboard size={14} className="text-indigo-600" /> 
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => navigate("/pos/sales")} 
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        <ArrowLeft size={14} /> 
                        <span>Sales</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        {isEdit ? "Edit Sale" : "Atelier POS Terminal"}
                    </h1>
                </div>
                <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    {dayjs().format("DD MMM YYYY")}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
                {/* Desktop & Tablet Persistent Cart Panel (Hidden on Mobile) */}
                <div className="hidden md:flex w-[380px] lg:w-[420px] bg-white border-r border-slate-200 flex-col overflow-hidden shrink-0 shadow-2xs">
                    {renderCartContent(false)}
                </div>

                {/* Items catalogue (Full-width on Mobile, Flex on Desktop) */}
                <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 gap-3 bg-[#F8FAFC]">
                    {/* Search Bar */}
                    <div className="relative shrink-0">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            value={itemSearch} 
                            onChange={e => setItemSearch(e.target.value)} 
                            placeholder="Search billable items, services, products, lab tests..."
                            className="w-full pl-10 border border-slate-200/90 bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all" 
                        />
                    </div>

                    {/* Category Tabs Horizontal Scroller */}
                    <div className="flex gap-1.5 shrink-0 overflow-x-auto pb-1 no-scrollbar">
                        {["all", "service", "product", "medication", "labtest", "surgery", "room"].map(tab => (
                            <button 
                                key={tab} 
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                                    activeTab === tab 
                                        ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30" 
                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {tab === "all" ? "All Items" : tab === "labtest" ? "Lab Test" : tab}
                            </button>
                        ))}
                    </div>

                    {/* Items Grid */}
                    <div className="flex-1 overflow-y-auto min-h-0 pb-28 md:pb-4 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-16 text-slate-400 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                                <span className="text-xs font-bold">Loading items catalogue...</span>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <p className="text-sm font-bold text-slate-600">No items found</p>
                                <p className="text-xs text-slate-400 mt-1">Try another search term or category</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
                                {filteredItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => addToCart(item)}
                                        className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all active:scale-[0.96] flex flex-col justify-between group shadow-2xs"
                                    >
                                        <div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${typeColor(item.type)}`}>
                                                {item.type}
                                            </span>
                                            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-2 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                {item.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{item.sku || "#" + item.id}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                                            <span className="text-indigo-600 font-black text-xs sm:text-sm">{fmt(parseFloat(item.price))}</span>
                                            <span className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                                                + Add
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sticky Order Pill (< 768px) */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 z-40 shadow-2xl pb-safe">
                    <div className="flex items-center justify-between gap-2.5">
                        <div
                            onClick={() => setMobileCartOpen(true)}
                            className="flex-1 flex items-center justify-between bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2.5 rounded-xl border border-slate-200 active:scale-95 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                                    {totalItemCount}
                                </span>
                                <span className="text-xs font-bold text-slate-800">View Cart</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-black text-indigo-600">{fmt(total)}</span>
                                <ChevronUp size={16} className="text-slate-400" />
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={cart.length === 0}
                            onClick={() => {
                                setPaymentMethod("cash");
                                setPaidAmount(total.toFixed(2));
                                setShowPayment(true);
                            }}
                            className="min-h-[44px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                            <CreditCard size={15} />
                            <span>Pay</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Sheet Drawer (< 768px) */}
            {isMobile && mobileCartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileCartOpen(false)}
                    />
                    <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
                        {/* Gesture handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1 rounded-full bg-slate-300" />
                        </div>

                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-black text-slate-900">Current Order</h2>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                                </span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setMobileCartOpen(false)}
                                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 active:scale-95"
                                aria-label="Close cart"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {renderCartContent(true)}
                        </div>
                    </div>
                </div>
            )}


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
                                    {["cash", "card", "upi", "split", "scheme", "net_banking", "wallet"].map(m => (
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
            {/* Receipt & WhatsApp Modal */}
            {completedSale && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-6 text-center border border-slate-100">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageCircle size={28} className="text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">
                            {isEdit ? "Sale Updated Successfully!" : "Sale Completed!"}
                        </h2>
                        <p className="text-sm text-slate-500 font-mono mb-4">
                            {completedSale.sale_no} · ₹{parseFloat(completedSale.total_amount || total).toLocaleString("en-IN")}
                        </p>

                        <div className="flex flex-col gap-2.5 mb-2">
                            <button
                                onClick={() => window.open(`/receipt/${completedSale.id || completedSale.sale_no}`, '_blank')}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                                <Printer size={16} /> Print Thermal Receipt
                            </button>

                            {completedSale.customer_phone ? (
                                <button
                                    onClick={handleSendWhatsApp}
                                    disabled={sendingWA}
                                    className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors shadow-sm"
                                >
                                    <MessageCircle size={16} />
                                    {sendingWA ? "Sending..." : `Send WhatsApp to ${completedSale.customer_phone}`}
                                </button>
                            ) : null}

                            <button
                                onClick={() => { setCompletedSale(null); navigate("/pos/sales"); }}
                                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl py-2 text-sm font-medium transition-colors"
                            >
                                Done / Return to Sales List
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
