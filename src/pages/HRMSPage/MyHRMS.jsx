import React, { useEffect, useState } from "react";
import { LogIn, LogOut, Plus, X, CheckCircle, Clock, CalendarDays, FileText } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import hrmsService from "../../service/hrmsService.js";

const LEAVE_TYPES = ["Paid", "Sick", "Casual", "Maternity", "Paternity", "Unpaid", "Permission", "Half Day"];

const statusColor = (s) => ({
    pending: "bg-yellow-100 text-yellow-700",
    hr_approved: "bg-blue-100 text-blue-700",
    hr_rejected: "bg-red-100 text-red-600",
    admin_approved: "bg-green-100 text-green-700",
    admin_rejected: "bg-red-100 text-red-600",
    auto_unpaid: "bg-gray-100 text-gray-600",
}[s] ?? "bg-gray-100 text-gray-600");

const attColor = (s) => ({
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-600",
    half_day: "bg-yellow-100 text-yellow-700",
    on_leave: "bg-blue-100 text-blue-700",
    holiday: "bg-purple-100 text-purple-700",
    permission: "bg-orange-100 text-orange-700",
}[s] ?? "bg-gray-100 text-gray-600");

export default function MyHRMS() {
    const staffProfileId = localStorage.getItem("staffProfileId");
    const staffProfile = JSON.parse(localStorage.getItem("staffProfile") || "{}");
    const username = localStorage.getItem("username") || "Staff";

    const [tab, setTab] = useState("attendance");
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState([]);
    const [todayRecord, setTodayRecord] = useState(null);
    const [showApply, setShowApply] = useState(false);
    const [form, setForm] = useState({ leave_type: "Paid", from_date: "", to_date: "", reason: "" });
    const [saving, setSaving] = useState(false);
    const [signingIn, setSigningIn] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const today = dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        if (!staffProfileId) return;
        loadAll();
    }, [staffProfileId]);

    const loadAll = async () => {
        try {
            const [attRes, leaveRes, balRes] = await Promise.allSettled([
                hrmsService.getAttendanceByStaff(staffProfileId, { month: dayjs().month() + 1, year: dayjs().year(), limit: 31 }),
                hrmsService.getAllLeaves({ staff_profile_id: staffProfileId, limit: 20 }),
                hrmsService.getLeaveBalance(staffProfileId, dayjs().year()),
            ]);

            if (attRes.status === "fulfilled") {
                const rows = attRes.value?.data?.data?.data ?? attRes.value?.data?.data ?? [];
                setAttendance(Array.isArray(rows) ? rows : []);
                const rec = rows.find(r => r.date === today);
                setTodayRecord(rec || null);
            }
            if (leaveRes.status === "fulfilled") {
                const d = leaveRes.value?.data?.data;
                setLeaves(d?.data ?? []);
            }
            if (balRes.status === "fulfilled") {
                setBalance(balRes.value?.data?.data ?? []);
            }
        } catch { toast.error("Failed to load HRMS data"); }
    };

    const handleSignIn = async () => {
        if (!staffProfileId) { toast.error("Staff profile not linked. Contact HR."); return; }
        setSigningIn(true);
        try { await hrmsService.signIn(staffProfileId); toast.success("Signed in successfully"); loadAll(); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed to sign in"); }
        finally { setSigningIn(false); }
    };

    const handleSignOut = async () => {
        if (!staffProfileId) { toast.error("Staff profile not linked. Contact HR."); return; }
        setSigningOut(true);
        try { await hrmsService.signOut(staffProfileId); toast.success("Signed out successfully"); loadAll(); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed to sign out"); }
        finally { setSigningOut(false); }
    };

    const applyLeave = async () => {
        if (!form.from_date || !form.to_date) { toast.error("Select from and to dates"); return; }
        setSaving(true);
        try {
            await hrmsService.applyLeave({ ...form, staff_profile_id: staffProfileId });
            toast.success("Leave applied successfully"); setShowApply(false);
            setForm({ leave_type: "Paid", from_date: "", to_date: "", reason: "" });
            loadAll();
        } catch (e) { toast.error(e?.response?.data?.message || "Failed to apply leave"); }
        finally { setSaving(false); }
    };

    if (!staffProfileId) {
        return (
            <div className="p-6 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
                    <p className="font-semibold text-yellow-700">Staff profile not linked</p>
                    <p className="text-sm text-yellow-600 mt-1">Please contact HR to link your account to a staff profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">My HRMS</h2>
                    <p className="text-xs text-gray-500">{username} · {staffProfile.employee_code}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSignIn} disabled={signingIn || !!todayRecord?.sign_in}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                        <LogIn size={14} /> {signingIn ? "Signing in..." : todayRecord?.sign_in ? `In: ${todayRecord.sign_in}` : "Sign In"}
                    </button>
                    <button onClick={handleSignOut} disabled={signingOut || !todayRecord?.sign_in || !!todayRecord?.sign_out}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50">
                        <LogOut size={14} /> {signingOut ? "Signing out..." : todayRecord?.sign_out ? `Out: ${todayRecord.sign_out}` : "Sign Out"}
                    </button>
                    <button onClick={() => setShowApply(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                        <Plus size={14} /> Apply Leave
                    </button>
                </div>
            </div>

            {/* Today's status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-400 uppercase">Today</p>
                    <p className="font-bold text-gray-800 mt-1">{dayjs().format("DD MMM YYYY")}</p>
                    {todayRecord ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${attColor(todayRecord.status)}`}>
                            {todayRecord.status?.replace("_", " ")}
                        </span>
                    ) : <span className="text-xs text-gray-400 mt-1 block">Not marked</span>}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-400 uppercase">Sign In</p>
                    <p className="font-bold text-gray-800 mt-1">{todayRecord?.sign_in || "—"}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-400 uppercase">Sign Out</p>
                    <p className="font-bold text-gray-800 mt-1">{todayRecord?.sign_out || "—"}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-400 uppercase">Hours Today</p>
                    <p className="font-bold text-gray-800 mt-1">{todayRecord?.working_hours ? `${todayRecord.working_hours}h` : "—"}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {[
                    { key: "attendance", label: "Attendance", icon: CalendarDays },
                    { key: "leaves", label: "My Leaves", icon: FileText },
                    { key: "balance", label: "Leave Balance", icon: CheckCircle },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-[#506EE4] text-[#506EE4]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                        <t.icon size={14} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Attendance Tab */}
            {tab === "attendance" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>{["Date", "Sign In", "Sign Out", "Hours", "Status"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {attendance.length === 0
                                ? <tr><td colSpan={5} className="py-8 text-center text-gray-400">No attendance records this month.</td></tr>
                                : attendance.map(r => (
                                    <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{dayjs(r.date).format("DD MMM YYYY")}</td>
                                        <td className="px-4 py-3">{r.sign_in || "—"}</td>
                                        <td className="px-4 py-3">{r.sign_out || "—"}</td>
                                        <td className="px-4 py-3">{r.working_hours ? `${r.working_hours}h` : "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${attColor(r.status)}`}>
                                                {r.status?.replace("_", " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Leaves Tab */}
            {tab === "leaves" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>{["Type", "From", "To", "Days", "Reason", "Status"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {leaves.length === 0
                                ? <tr><td colSpan={6} className="py-8 text-center text-gray-400">No leave applications.</td></tr>
                                : leaves.map(l => (
                                    <tr key={l.id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{l.leave_type}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{dayjs(l.from_date).format("DD MMM YYYY")}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{dayjs(l.to_date).format("DD MMM YYYY")}</td>
                                        <td className="px-4 py-3">{l.total_days}</td>
                                        <td className="px-4 py-3 max-w-[150px] truncate text-gray-500">{l.reason || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(l.status)}`}>
                                                {l.status?.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Balance Tab */}
            {tab === "balance" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {balance.length === 0
                        ? <p className="text-gray-400 text-sm col-span-3 text-center py-8">No leave balance configured.</p>
                        : balance.map(b => (
                            <div key={b.leave_type} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <p className="font-semibold text-gray-800">{b.leave_type} Leave</p>
                                <div className="mt-3 space-y-1.5 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Entitled</span><span className="font-medium">{b.entitled} days</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Used</span><span className="text-red-500">{b.used} days</span></div>
                                    <div className="flex justify-between border-t border-gray-100 pt-1.5"><span className="font-semibold">Balance</span><span className="font-bold text-green-600">{b.balance} days</span></div>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#506EE4] rounded-full" style={{ width: `${Math.min((b.used / b.entitled) * 100, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Apply Leave Modal */}
            {showApply && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[440px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setShowApply(false)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-4">Apply Leave</h2>
                        <div className="space-y-3 text-sm">
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Leave Type</label>
                                <select value={form.leave_type} onChange={e => setForm(f => ({ ...f, leave_type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                    {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs font-medium text-gray-500 uppercase">From *</label>
                                    <input type="date" value={form.from_date}
                                        onChange={e => setForm(f => ({ ...f, from_date: e.target.value, to_date: f.to_date || e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                                <div><label className="text-xs font-medium text-gray-500 uppercase">To *</label>
                                    <input type="date" value={form.to_date} min={form.from_date}
                                        onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                            </div>
                            {form.from_date && form.to_date && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 font-medium">
                                    {form.leave_type === "Half Day" ? "0.5 day" :
                                     form.leave_type === "Permission" ? "0 days (permission only)" :
                                     (() => {
                                         const days = Math.ceil((new Date(form.to_date) - new Date(form.from_date)) / (1000*60*60*24)) + 1;
                                         return `${days} day${days > 1 ? "s" : ""}`;
                                     })()
                                    }
                                </div>
                            )}
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Reason</label>
                                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" placeholder="Optional reason..." /></div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowApply(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={applyLeave} disabled={saving} className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">
                                {saving ? "Applying..." : "Apply Leave"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
