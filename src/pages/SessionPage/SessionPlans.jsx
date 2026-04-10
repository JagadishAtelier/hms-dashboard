import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Eye, XCircle, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import sessionService from "../../service/sessionService.js";

const statusColor = (s) => ({
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-600",
    paused: "bg-yellow-100 text-yellow-700",
}[s] ?? "bg-gray-100 text-gray-600");

export default function SessionPlans() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const r = await sessionService.getAllPlans({ limit: 50 });
            const d = r?.data?.data;
            setPlans(d?.data ?? []); setTotal(d?.total ?? 0);
        } catch { toast.error("Failed to load session plans"); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const cancel = async (id) => {
        if (!confirm("Cancel this session plan?")) return;
        try { await sessionService.cancelPlan(id); toast.success("Plan cancelled"); load(); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Session Plans</h2>
                    <p className="text-xs text-gray-500">{total} plans · recurring patient sessions</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50"><RefreshCw size={14} /></button>
                    <button onClick={() => navigate("/session-plans/create")}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                        <Plus size={14} /> New Plan
                    </button>
                    <button onClick={() => navigate("/session-plans/due-tomorrow")}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600">
                        <CalendarDays size={14} /> Due Tomorrow
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>{["Patient", "Doctor", "Plan", "Frequency", "Sessions", "Progress", "Start", "Status", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={9} className="py-10 text-center text-gray-400">Loading...</td></tr>
                            : plans.length === 0 ? <tr><td colSpan={9} className="py-10 text-center text-gray-400">No session plans found.</td></tr>
                                : plans.map(p => (
                                    <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{p.patient?.first_name} {p.patient?.last_name}</p>
                                            <p className="text-xs text-gray-400">{p.patient?.patient_code} · {p.patient?.phone}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{p.doctor?.doctor_name}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{p.plan_name}</td>
                                        <td className="px-4 py-3 text-gray-500 capitalize">{p.frequency_type} · {p.sessions_per_period}x</td>
                                        <td className="px-4 py-3 text-gray-500">{p.total_sessions} total</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#506EE4] rounded-full" style={{ width: `${Math.min((p.sessions_completed / p.total_sessions) * 100, 100)}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-500">{p.sessions_completed}/{p.total_sessions}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dayjs(p.start_date).format("DD MMM YYYY")}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor(p.status)}`}>{p.status}</span>
                                        </td>
                                        <td className="px-4 py-3 flex gap-1.5">
                                            <button onClick={() => navigate(`/session-plans/${p.id}`)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-600" title="View"><Eye size={13} /></button>
                                            {p.status === "active" && <button onClick={() => cancel(p.id)} className="p-1.5 border border-red-200 rounded hover:bg-red-50 text-red-500" title="Cancel"><XCircle size={13} /></button>}
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
