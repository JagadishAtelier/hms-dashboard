import React, { useEffect, useState } from "react";
import { RefreshCw, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import hrmsService from "../../service/hrmsService.js";

const STATUSES = [
    { key: "present", label: "P", color: "bg-green-500 text-white", light: "bg-green-50 text-green-700 border-green-200" },
    { key: "absent", label: "A", color: "bg-red-500 text-white", light: "bg-red-50 text-red-700 border-red-200" },
    { key: "half_day", label: "H", color: "bg-yellow-500 text-white", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { key: "on_leave", label: "L", color: "bg-blue-500 text-white", light: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "permission", label: "Pe", color: "bg-orange-500 text-white", light: "bg-orange-50 text-orange-700 border-orange-200" },
    { key: "holiday", label: "Ho", color: "bg-purple-500 text-white", light: "bg-purple-50 text-purple-700 border-purple-200" },
];

const statusStyle = (s) => STATUSES.find(x => x.key === s) || STATUSES[0];

export default function Attendance() {
    const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [staffList, setStaffList] = useState([]);
    const [attendance, setAttendance] = useState({}); // { staff_profile_id: { status, sign_in, sign_out } }
    const [saving, setSaving] = useState({});
    const [loadingStaff, setLoadingStaff] = useState(false);
    const staffId = localStorage.getItem("staffProfileId");

    // Load all staff
    useEffect(() => {
        setLoadingStaff(true);
        hrmsService.getAllStaffProfiles({ limit: 500 })
            .then(res => {
                const raw = res?.data;
                let list = [];
                if (Array.isArray(raw)) list = raw;
                else if (Array.isArray(raw?.data)) list = raw.data;
                else if (Array.isArray(raw?.data?.data)) list = raw.data.data;
                else if (raw?.data?.data?.data) list = raw.data.data.data;
                setStaffList(list);
            })
            .catch(() => toast.error("Failed to load staff"))
            .finally(() => setLoadingStaff(false));
    }, []);

    // Load existing attendance for selected date
    useEffect(() => {
        if (!date) return;
        hrmsService.getAllAttendance({ date, limit: 500 })
            .then(res => {
                const rows = res?.data?.data?.data ?? res?.data?.data ?? [];
                const map = {};
                rows.forEach(r => { map[r.staff_profile_id] = r; });
                setAttendance(map);
            })
            .catch(() => {});
    }, [date]);

    const markStatus = async (staffProfileId, status) => {
        setSaving(p => ({ ...p, [staffProfileId]: true }));
        try {
            await hrmsService.markAttendance({ staff_profile_id: staffProfileId, date, status });
            setAttendance(p => ({ ...p, [staffProfileId]: { ...p[staffProfileId], status } }));
        } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to mark");
        } finally {
            setSaving(p => ({ ...p, [staffProfileId]: false }));
        }
    };

    const handleSignIn = async () => {
        if (!staffId) { toast.error("Staff profile not linked to your account"); return; }
        try { await hrmsService.signIn(staffId); toast.success("Signed in"); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    };

    const handleSignOut = async () => {
        if (!staffId) { toast.error("Staff profile not linked to your account"); return; }
        try { await hrmsService.signOut(staffId); toast.success("Signed out"); }
        catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Attendance</h2>
                    <p className="text-xs text-gray-500">{staffList.length} staff members</p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30" />
                    <button onClick={handleSignIn} className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700">
                        <LogIn size={14} /> My Sign In
                    </button>
                    <button onClick={handleSignOut} className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600">
                        <LogOut size={14} /> My Sign Out
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                    <span key={s.key} className={`px-2 py-0.5 rounded text-xs font-semibold border ${s.light}`}>
                        {s.label} — {s.key.replace("_", " ")}
                    </span>
                ))}
            </div>

            {/* Attendance Grid */}
            {loadingStaff ? (
                <div className="text-center py-10 text-gray-400">Loading staff...</div>
            ) : staffList.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No staff found.</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Staff</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Current Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Mark As</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(staff => {
                                const rec = attendance[staff.id];
                                const currentStatus = rec?.status;
                                const isSaving = saving[staff.id];
                                return (
                                    <tr key={staff.id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {staff.first_name} {staff.last_name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{staff.employee_code}</td>
                                        <td className="px-4 py-3">
                                            {currentStatus ? (
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${statusStyle(currentStatus).light}`}>
                                                    {currentStatus.replace("_", " ")}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs">Not marked</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {STATUSES.map(s => (
                                                    <button
                                                        key={s.key}
                                                        disabled={isSaving || currentStatus === s.key}
                                                        onClick={() => markStatus(staff.id, s.key)}
                                                        title={s.key.replace("_", " ")}
                                                        className={`w-8 h-8 rounded text-xs font-bold transition-all disabled:opacity-40
                                                            ${currentStatus === s.key ? s.color + " ring-2 ring-offset-1 ring-gray-400" : "bg-gray-100 text-gray-600 hover:" + s.color.split(" ")[0] + " hover:text-white border border-gray-200"}`}>
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
