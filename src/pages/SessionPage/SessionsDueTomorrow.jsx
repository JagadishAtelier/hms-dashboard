import React, { useEffect, useState } from "react";
import { Phone, CheckCircle, RefreshCw, Clock, X } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import sessionService from "../../service/sessionService.js";

export default function SessionsDueTomorrow() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("today");
    const [confirmModal, setConfirmModal] = useState(null);
    const [time, setTime] = useState("09:00");
    const [saving, setSaving] = useState(false);
    const [rescheduling, setRescheduling] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

    const load = async () => {
        setLoading(true);
        try {
            const r = await sessionService.getSessionsDueTomorrow();
            setSessions(r?.data?.data ?? []);
        } catch { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const todaySessions = sessions.filter(s => s.scheduled_date === today);
    const tomorrowSessions = sessions.filter(s => s.scheduled_date === tomorrow);
    const displayed = tab === "today" ? todaySessions : tomorrowSessions;

    const createAppointment = async () => {
        setSaving(true);
        try {
            await sessionService.confirmAndCreateAppointment(confirmModal.id, { scheduled_time: time + ":00" });
            toast.success(`Appointment created for ${confirmModal.patient?.first_name} at ${time}`);
            setConfirmModal(null);
            load();
        } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
        finally { setSaving(false); }
    };

    const rescheduleToTomorrow = async (session) => {
        setRescheduling(session.id);
        try {
            await sessionService.rescheduleSession(session.id, tomorrow);
            toast.success(`Session moved to ${dayjs(tomorrow).format("DD MMM YYYY")}`);
            load();
        } catch (e) { toast.error(e?.response?.data?.message || "Failed to reschedule"); }
        finally { setRescheduling(null); }
    };

    const cancelSession = async (session) => {
        if (!confirm(`Cancel session #${session.session_no} for ${session.patient?.first_name}?`)) return;
        setCancelling(session.id);
        try {
            await sessionService.cancelSession(session.id);
            toast.success("Session cancelled");
            load();
        } catch (e) { toast.error(e?.response?.data?.message || "Failed to cancel"); }
        finally { setCancelling(null); }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Sessions</h2>
                    <p className="text-xs text-gray-500">Today & Tomorrow · {sessions.length} total sessions</p>
                </div>
                <button onClick={load} className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50"><RefreshCw size={14} /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                <button onClick={() => setTab("today")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "today" ? "border-[#506EE4] text-[#506EE4]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    Today
                    {todaySessions.length > 0 && <span className="bg-[#506EE4] text-white text-xs px-1.5 py-0.5 rounded-full">{todaySessions.length}</span>}
                </button>
                <button onClick={() => setTab("tomorrow")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "tomorrow" ? "border-[#506EE4] text-[#506EE4]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    Tomorrow
                    {tomorrowSessions.length > 0 && <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tomorrowSessions.length}</span>}
                </button>
            </div>

            {loading ? <div className="text-center py-10 text-gray-400">Loading...</div>
                : displayed.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No sessions for {tab === "today" ? "today" : "tomorrow"}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayed.map(s => (
                            <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-gray-800">{s.patient?.first_name} {s.patient?.last_name}</p>
                                        <span className="text-xs text-gray-400">#{s.patient?.patient_code}</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Session {s.session_no}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Dr. {s.doctor?.doctor_name} · {s.plan?.plan_name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        {s.patient?.phone && (
                                            <a href={`tel:${s.patient.phone}`} className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                                                <Phone size={12} /> {s.patient.phone}
                                            </a>
                                        )}
                                        {s.scheduled_time && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock size={12} /> {s.scheduled_time.slice(0, 5)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {s.status === "appointment_created" ? (
                                        <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                                            <CheckCircle size={14} /> Appointment Created
                                        </span>
                                    ) : (
                                        <div className="flex flex-col gap-2 items-end">
                                            <button onClick={() => { setConfirmModal(s); setTime(s.scheduled_time?.slice(0, 5) || "09:00"); }}
                                                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                                                <CheckCircle size={14} /> Book Appointment
                                            </button>
                                            {tab === "today" && (
                                                <button
                                                    onClick={() => rescheduleToTomorrow(s)}
                                                    disabled={rescheduling === s.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-50">
                                                    {rescheduling === s.id ? "Moving..." : "Not Available → Move to Tomorrow"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => cancelSession(s)}
                                                disabled={cancelling === s.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 disabled:opacity-50">
                                                {cancelling === s.id ? "Cancelling..." : "Cancel Session"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setConfirmModal(null)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-1">Create Appointment</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            {confirmModal.patient?.first_name} {confirmModal.patient?.last_name} · Session {confirmModal.session_no} · {dayjs(confirmModal.scheduled_date).format("DD MMM YYYY")}
                        </p>
                        <div className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Appointment Time *</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" />
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                                <p>Doctor: {confirmModal.doctor?.doctor_name}</p>
                                <p>Plan: {confirmModal.plan?.plan_name}</p>
                                <p>Visit: {confirmModal.plan?.visit_type}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={createAppointment} disabled={saving}
                                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                                {saving ? "Creating..." : "Confirm & Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
