import React, { useEffect, useState, useMemo } from "react";
import {
  Bed,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ClipboardList,
  Building2,
  Calendar,
  XCircle,
  Timer
} from "lucide-react";
import bedsService from "../../service/bedsService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

export default function BedReadinessDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    summary: {
      total: 0,
      occupied: 0,
      discharge_pending: 0,
      cleaning: 0,
      inspection: 0,
      ready: 0,
      average_turnaround_mins: 0,
    },
    beds: [],
    recentLogs: [],
  });

  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'CLEAN' | 'INSPECT' | 'PREALLOCATE' | null
  const [selectedBed, setSelectedBed] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [patientIdInput, setPatientIdInput] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await bedsService.getBedReadinessDashboard();
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error("Failed to load bed readiness dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Filtered beds list
  const filteredBeds = useMemo(() => {
    if (!dashboardData?.beds) return [];
    return dashboardData.beds.filter((bed) => {
      const wardMatch =
        selectedWard === "ALL" ||
        bed.room?.ward?.name === selectedWard ||
        bed.room?.ward?.id === selectedWard;

      const status = bed.readiness_status || (bed.is_occupied ? "OCCUPIED" : "AVAILABLE_READY");
      const statusMatch = selectedStatus === "ALL" || status === selectedStatus;

      const searchMatch =
        searchTerm === "" ||
        bed.bed_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bed.room?.room_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bed.room?.ward?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      return wardMatch && statusMatch && searchMatch;
    });
  }, [dashboardData, selectedWard, selectedStatus, searchTerm]);

  // Unique wards for filter
  const wardsList = useMemo(() => {
    if (!dashboardData?.beds) return [];
    const set = new Set();
    dashboardData.beds.forEach((b) => {
      if (b.room?.ward?.name) set.add(b.room.ward.name);
    });
    return Array.from(set);
  }, [dashboardData]);

  // Action Handlers
  const handleStartCleaning = async (bed) => {
    try {
      setSubmittingAction(true);
      await bedsService.startCleaning(bed.id, "Housekeeping initiated from operations board");
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start cleaning");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCompleteCleaning = async () => {
    if (!selectedBed) return;
    try {
      setSubmittingAction(true);
      await bedsService.completeCleaning(selectedBed.id, actionNotes || "Sanitization and linen change completed");
      setActiveModal(null);
      setActionNotes("");
      setSelectedBed(null);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete cleaning");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleInspectAndRelease = async () => {
    if (!selectedBed) return;
    try {
      setSubmittingAction(true);
      await bedsService.inspectAndRelease(selectedBed.id, actionNotes || "Clinical inspection passed; bed certified ready");
      setActiveModal(null);
      setActionNotes("");
      setSelectedBed(null);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to release bed");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handlePreAllocate = async () => {
    if (!selectedBed || !patientIdInput.trim()) {
      alert("Please provide a valid Patient UUID or code");
      return;
    }
    try {
      setSubmittingAction(true);
      await bedsService.preAllocateBed(selectedBed.id, patientIdInput.trim(), actionNotes || "Pre-allocated for triage admission");
      setActiveModal(null);
      setPatientIdInput("");
      setActionNotes("");
      setSelectedBed(null);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to pre-allocate bed");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCancelPreAllocation = async (bed) => {
    if (!window.confirm(`Release reservation on Bed ${bed.bed_no}?`)) return;
    try {
      setSubmittingAction(true);
      await bedsService.cancelPreAllocation(bed.id, "Reservation released back to general ready pool");
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel pre-allocation");
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) return <Loading />;

  const { summary } = dashboardData;

  const getStatusBadge = (status, isOccupied) => {
    const s = status || (isOccupied ? "OCCUPIED" : "AVAILABLE_READY");
    switch (s) {
      case "OCCUPIED":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          label: "Occupied",
        };
      case "DISCHARGE_PENDING":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "Discharge Pending",
        };
      case "PHYSICALLY_VACATED":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          dot: "bg-sky-500",
          label: "Physically Vacated",
        };
      case "HOUSEKEEPING_CLEANING":
        return {
          bg: "bg-amber-100 text-amber-800 border-amber-300",
          dot: "bg-amber-600 animate-pulse",
          label: "Sanitizing in Progress",
        };
      case "MAINTENANCE_INSPECTION":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500",
          label: "Inspection Required",
        };
      case "AVAILABLE_READY":
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Available & Ready",
        };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 🏥 Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Bed-Readiness Operations Center
              </h1>
              <p className="text-sm text-gray-500">
                Real-time bed turnover orchestration, housekeeping workflow, and emergency pre-allocation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-medium border border-gray-200">
            <Timer className="w-4 h-4 text-blue-600" />
            Target SLA: <span className="font-bold text-gray-900">25 Mins</span>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 📊 KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Beds</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total}</p>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Facility Wide
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Occupied</span>
          <p className="text-2xl font-bold text-rose-700 mt-1">{summary.occupied}</p>
          <div className="text-[11px] text-rose-500 mt-1 font-medium">Inpatients Active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Discharge Pending</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{summary.discharge_pending}</p>
          <div className="text-[11px] text-amber-500 mt-1 font-medium">Decoupled Stage</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Cleaning</span>
          <p className="text-2xl font-bold text-amber-800 mt-1">{summary.cleaning}</p>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Housekeeping Cycle</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Inspection</span>
          <p className="text-2xl font-bold text-purple-700 mt-1">{summary.inspection}</p>
          <div className="text-[11px] text-purple-500 mt-1 font-medium">Nurse Certification</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Ready / Available</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{summary.ready}</p>
          <div className="text-[11px] text-emerald-500 mt-1 font-medium">Ready for Intake</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Average TAT</span>
          <p className="text-2xl font-bold text-blue-700 mt-1">{summary.average_turnaround_mins} <span className="text-xs font-normal">min</span></p>
          <div className="text-[11px] text-blue-500 mt-1 font-medium">
            {summary.average_turnaround_mins <= 25 ? "Within SLA" : "Over SLA"}
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bed, room, ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="py-2 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="ALL">All Wards</option>
            {wardsList.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          {[
            { id: "ALL", label: "All" },
            { id: "AVAILABLE_READY", label: "Ready" },
            { id: "OCCUPIED", label: "Occupied" },
            { id: "DISCHARGE_PENDING", label: "Discharge Pending" },
            { id: "HOUSEKEEPING_CLEANING", label: "Cleaning" },
            { id: "MAINTENANCE_INSPECTION", label: "Inspection" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedStatus === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🛏️ Interactive Bed Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const badge = getStatusBadge(bed.readiness_status, bed.is_occupied);
          const currentStatus = bed.readiness_status || (bed.is_occupied ? "OCCUPIED" : "AVAILABLE_READY");
          const isPreAllocated = Boolean(bed.reserved_for_patient_id);

          return (
            <div
              key={bed.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {bed.room?.ward?.name || "General Ward"}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                      Bed {bed.bed_no}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Room {bed.room?.room_no} • {bed.room?.room_type || "Standard"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>

                {isPreAllocated && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
                    <span className="flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Pre-Allocated for Emergency
                    </span>
                    <button
                      onClick={() => handleCancelPreAllocation(bed)}
                      disabled={submittingAction}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
                    >
                      Release
                    </button>
                  </div>
                )}

                {/* Housekeeping Timestamp Info */}
                {currentStatus === "HOUSEKEEPING_CLEANING" && bed.cleaning_started_at && (
                  <div className="mt-3 p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Cleaning Started:
                    </span>
                    <span className="font-bold">{dayjs(bed.cleaning_started_at).fromNow()}</span>
                  </div>
                )}

                {currentStatus === "MAINTENANCE_INSPECTION" && bed.cleaned_at && (
                  <div className="mt-3 p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Cleaned by {bed.cleaned_by || "Staff"}:
                    </span>
                    <span className="font-bold">{dayjs(bed.cleaned_at).fromNow()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Depending on State */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                {(currentStatus === "DISCHARGE_PENDING" || currentStatus === "PHYSICALLY_VACATED") && (
                  <button
                    onClick={() => handleStartCleaning(bed)}
                    disabled={submittingAction}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-amber-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Start Cleaning
                  </button>
                )}

                {currentStatus === "HOUSEKEEPING_CLEANING" && (
                  <button
                    onClick={() => {
                      setSelectedBed(bed);
                      setActiveModal("CLEAN");
                    }}
                    disabled={submittingAction}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-emerald-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete Cleaning
                  </button>
                )}

                {currentStatus === "MAINTENANCE_INSPECTION" && (
                  <button
                    onClick={() => {
                      setSelectedBed(bed);
                      setActiveModal("INSPECT");
                    }}
                    disabled={submittingAction}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-purple-200"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Inspect & Certify Ready
                  </button>
                )}

                {currentStatus === "AVAILABLE_READY" && !isPreAllocated && (
                  <button
                    onClick={() => {
                      setSelectedBed(bed);
                      setActiveModal("PREALLOCATE");
                    }}
                    disabled={submittingAction}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-all border border-blue-200"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Pre-Allocate
                  </button>
                )}

                {currentStatus === "OCCUPIED" && (
                  <div className="w-full text-center text-xs font-medium text-gray-400 py-1.5 bg-gray-50 rounded-xl">
                    Inpatient Assigned
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBeds.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Bed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700">No beds match your filter criteria</h3>
          <p className="text-xs text-gray-400 mt-1">Try resetting the ward or status filter above</p>
        </div>
      )}

      {/* 📜 Recent Turnaround Audit Trail */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Turnaround Audit Activity</h2>
            <p className="text-xs text-gray-500">Live operational log of bed sanitization, inspection, and stage handoffs</p>
          </div>
          <ClipboardList className="w-5 h-5 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Bed</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">State Flow</th>
                <th className="py-2.5 px-3">Staff / Performed By</th>
                <th className="py-2.5 px-3">TAT / Notes</th>
                <th className="py-2.5 px-3 rounded-r-lg">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {dashboardData.recentLogs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-gray-900">
                    Bed {log.bed?.bed_no || "N/A"}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-blue-600">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-gray-500">{log.previous_status || "—"}</span>
                    <span className="mx-1.5 text-gray-300">→</span>
                    <span className="font-semibold text-gray-800">{log.new_status}</span>
                  </td>
                  <td className="py-2.5 px-3">{log.performed_by_name || "System"}</td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-gray-500">
                    {log.notes || "—"}
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">
                    {dayjs(log.createdAt).format("MMM D, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧼 Modal: Complete Cleaning */}
      {activeModal === "CLEAN" && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-gray-900">Mark Bed Sanitized</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Certify that Bed <span className="font-bold text-gray-800">{selectedBed?.bed_no}</span> has been terminal-cleaned and prepped for inspection.
            </p>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Housekeeping Checklist Notes</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g., UV terminal disinfection completed, mattress sanitized, new sterile linen applied"
                className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteCleaning}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                Confirm Sanitization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 Modal: Inspect & Release */}
      {activeModal === "INSPECT" && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-gray-900">Clinical & Nurse Inspection</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Inspect Bed <span className="font-bold text-gray-800">{selectedBed?.bed_no}</span> and release it into the Available & Ready intake pool.
            </p>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Inspection Checklist Notes</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g., Suction and oxygen ports tested, bed controls verified, certified ready for admission"
                className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleInspectAndRelease}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
              >
                Release to Ready Pool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚑 Modal: Emergency Pre-Allocation */}
      {activeModal === "PREALLOCATE" && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <UserCheck className="w-5 h-5" />
                <h3 className="font-bold text-gray-900">Pre-Allocate Bed for Patient</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Reserve Bed <span className="font-bold text-gray-800">{selectedBed?.bed_no}</span> for an incoming emergency transfer or urgent admission.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Patient UUID / Code *</label>
                <input
                  type="text"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  placeholder="e.g., PAT-001002 or Patient UUID"
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Triage Notes</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g., Triage Red Code incoming via ambulance; ventilator support requested"
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePreAllocate}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                Confirm Pre-Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

