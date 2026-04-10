import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import sessionService from "../../service/sessionService.js";

const statusColor = (s) => ({
    upcoming: "bg-gray-100 text-gray-600",
    confirmed: "bg-blue-100 text-blue-700",
    appointment_created: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    missed: "bg-red-100 text-red-600",
    cancelled: "bg-red-100 text-red-600",
}[s] ?? "bg-gray-100 text-gray-600");

export default function SessionPlanDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sessionService.getPlanById(id)
            .then(r => setPlan(r?.data?.data ?? r?.data))
            .catch(() => toast.error("Failed to load plan"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-[60vh] text-gray-400">Loading...</div>;
    if (!plan) return <div className="p-6 text-center text-gray-400">Plan not found.</div>;

    const sessions = (plan.sessions || []).slice().sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
    const completed = sessions.filter(s => ["appointment_created", "completed"].includes(s.status)).length;

    return (
        <div className="p-4 space-y-5 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate("/session-plans")} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{plan.plan_name}</h2>
                    <p className="text-xs text-gray-500">{plan.patient?.first_name} {plan.patient?.last_name} · {plan.patient?.patient_code}</p>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Sessions", value: plan.total_sessions, color: "text-gray-800" },
                    { label: "Completed", value: completed, color: "text-green-600" },
                    { label: "Remaining", value: plan.total_sessions - completed, color: "text-blue-600" },
                    { label: "Frequency", value: `${plan.sessions_per_period}x ${plan.frequency_type}`, color: "text-gray-600" },
                ].map(c => (
                    <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-400 uppercase">{c.label}</p>
                        <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Progress</span><span>{completed} / {plan.total_sessions} sessions</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#506EE4] rounded-full transition-all" style={{ width: `${Math.min((completed / plan.total_sessions) * 100, 100)}%` }} />
                </div>
            </div>

            {/* Plan info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Doctor</span><p className="font-medium text-gray-800 mt-0.5">{plan.doctor?.doctor_name}</p></div>
                <div><span className="text-gray-400">Visit Type</span><p className="font-medium text-gray-800 mt-0.5">{plan.visit_type}</p></div>
                <div><span className="text-gray-400">Start Date</span><p className="font-medium text-gray-800 mt-0.5">{dayjs(plan.start_date).format("DD MMM YYYY")}</p></div>
                <div><span className="text-gray-400">Preferred Time</span><p className="font-medium text-gray-800 mt-0.5">{plan.preferred_time || "—"}</p></div>
                {plan.reason && <div className="sm:col-span-2"><span className="text-gray-400">Reason</span><p className="font-medium text-gray-800 mt-0.5">{plan.reason}</p></div>}
            </div>

            {/* Sessions list */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">All Sessions</h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>{["#", "Date", "Time", "Status", "Appointment"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {sessions.length === 0
                            ? <tr><td colSpan={5} className="py-8 text-center text-gray-400">No sessions found.</td></tr>
                            : sessions.map(s => (
                                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-500">#{s.session_no}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{dayjs(s.scheduled_date).format("DD MMM YYYY")}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.scheduled_time ? s.scheduled_time.slice(0, 5) : "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor(s.status)}`}>
                                            {s.status?.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {s.appointment_id ? <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Created</span> : "—"}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
