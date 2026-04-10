import React, { useEffect, useState } from "react";
import { RefreshCw, ClipboardList, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import sessionService from "../../service/sessionService.js";

const statusColor = (s) => ({
    upcoming: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    appointment_created: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    missed: "bg-red-100 text-red-600",
    cancelled: "bg-gray-100 text-gray-500",
}[s] ?? "bg-gray-100 text-gray-600");

export default function DoctorSessions() {
    // Get doctor_id from localStorage (stored after login via doctor profile)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const doctorId = localStorage.getItem("doctorId") || user?.doctor_id;

    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [recordModal, setRecordModal] = useState(null);
    const [recordForm, setRecordForm] = useState({ status: "completed", session_notes: "", notes: "" });
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState({});

    const load = async () => {
        if (!doctorId) return;
        setLoading(true);
        try {
            const r = await sessionService.getSessionsByDoctor(doctorId, { limit: 50, status: statusFilter || undefined });
            const d = r?.data?.data;
            setSessions(d?.data ?? []); setTotal(d?.total ?? 0);
        } catch { toast.error("Failed to load sessions"); }
        finally { setLoading(false)