import React, { useEffect, useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  XCircle,
  Building2,
  Pill,
  FlaskConical,
  BedDouble,
  Receipt,
  RotateCcw,
  CheckCheck
} from "lucide-react";
import revenueLeakageService from "../../service/revenueLeakageService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

export default function RevenueLeakageDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState({
    totalLeakagesLogged: 0,
    pendingCount: 0,
    resolvedCount: 0,
    totalDetectedValue: 0,
    totalRecoveredValue: 0,
    totalPendingValue: 0,
    breakdownByType: {},
    breakdownByDept: {},
  });

  const [logs, setLogs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Reconcile Modal
  const [activeItem, setActiveItem] = useState(null);
  const [actionType, setActionType] = useState("RECONCILED"); // 'RECONCILED' | 'WAIVED'
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, logsRes] = await Promise.all([
        revenueLeakageService.getStats(),
        revenueLeakageService.getLeakageLogs({
          status: selectedStatus,
          department: selectedDept,
          limit: 100,
        }),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (logsRes?.data?.logs) setLogs(logsRes.data.logs);
    } catch (err) {
      console.error("Failed to load revenue leakage data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedStatus, selectedDept]);

  const handleRunFacilityScan = async () => {
    try {
      setScanning(true);
      const res = await revenueLeakageService.runFacilityScan();
      alert(`Audit Scan Complete: ${res?.data?.admissionsScanned || 0} admissions cross-audited. ${res?.data?.newDetectionsCount || 0} unbilled items flagged totaling ₹${res?.data?.totalLeakageValue || 0}.`);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to run audit scan");
    } finally {
      setScanning(false);
    }
  };

  const handleReconcileAction = async () => {
    if (!activeItem) return;
    try {
      setSubmittingAction(true);
      await revenueLeakageService.reconcileItem(activeItem.id, {
        action: actionType,
        resolution_notes: resolutionNotes || `Action marked as ${actionType} from revenue leakage console`,
      });
      setActiveItem(null);
      setResolutionNotes("");
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update item");
    } finally {
      setSubmittingAction(false);
    }
  };

  const getDepartmentIcon = (dept) => {
    switch (dept) {
      case "PHARMACY":
        return <Pill className="w-4 h-4 text-purple-600" />;
      case "LABORATORY":
        return <FlaskConical className="w-4 h-4 text-blue-600" />;
      case "INPATIENT_OPERATIONS":
        return <BedDouble className="w-4 h-4 text-emerald-600" />;
      default:
        return <Receipt className="w-4 h-4 text-amber-600" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const matchSearch =
      log.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source_reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.patient?.patient_code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 🏥 Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Revenue Leakage Detection Engine
            </h1>
            <p className="text-sm text-gray-500">
              Cross-audit clinical orders, dispensed medications, lab tests, and room rent against patient billing ledgers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunFacilityScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shadow-rose-200 disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4" />
            {scanning ? "Auditing Admissions..." : "Run Facility-Wide Audit Scanner"}
          </button>

          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 📊 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Unbilled Leakage</span>
            <span className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-rose-700 mt-2">
            ₹{stats.totalPendingValue.toLocaleString("en-IN")}
          </p>
          <div className="text-xs text-rose-500 mt-1 font-medium">
            {stats.pendingCount} unbilled clinical items detected
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Recovered Revenue</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">
            ₹{stats.totalRecoveredValue.toLocaleString("en-IN")}
          </p>
          <div className="text-xs text-emerald-500 mt-1 font-medium">
            {stats.resolvedCount} items recovered & billed
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Audited Volume</span>
            <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">
            ₹{stats.totalDetectedValue.toLocaleString("en-IN")}
          </p>
          <div className="text-xs text-blue-500 mt-1 font-medium">
            {stats.totalLeakagesLogged} total audit events logged
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Recovery Efficiency</span>
            <span className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <CheckCheck className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-purple-700 mt-2">
            {stats.totalDetectedValue > 0
              ? `${Math.round((stats.totalRecoveredValue / stats.totalDetectedValue) * 100)}%`
              : "100%"}
          </p>
          <div className="text-xs text-purple-500 mt-1 font-medium">
            Audit reconciliation rate
          </div>
        </div>
      </div>

      {/* 🔍 Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by service, ref #, or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl text-gray-700"
          >
            <option value="ALL">All Departments</option>
            <option value="PHARMACY">Pharmacy</option>
            <option value="LABORATORY">Laboratory</option>
            <option value="INPATIENT_OPERATIONS">Inpatient Bed Rent</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="DETECTED">Pending Unbilled</option>
            <option value="RECONCILED">Reconciled / Billed</option>
            <option value="WAIVED">Waived</option>
          </select>
        </div>
      </div>

      {/* 📋 Leakage Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Unbilled Clinical Activities Ledger</h2>
            <p className="text-xs text-gray-500">Clinical services performed without corresponding ledger invoice lines</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700">
            {filteredLogs.length} Records Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Service & Reference</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Service Date</th>
                <th className="py-3 px-3">Unbilled Value</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredLogs.map((log) => {
                const isPending = log.status === "DETECTED";
                const isReconciled = log.status === "RECONCILED";

                return (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{log.service_name}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {log.source_reference_id} • {log.leakage_type.replace(/_/g, " ")}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        {getDepartmentIcon(log.department)}
                        {log.department.replace(/_/g, " ")}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-900">
                        {log.patient?.first_name} {log.patient?.last_name || ""}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {log.patient?.patient_code}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-medium text-gray-600">
                      {dayjs(log.service_date).format("MMM D, YYYY")}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-rose-700 text-sm">
                        ₹{parseFloat(log.estimated_leakage_amount).toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isReconciled
                            ? "bg-emerald-50 text-emerald-700"
                            : isPending
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveItem(log);
                              setActionType("RECONCILED");
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Reconcile
                          </button>
                          <button
                            onClick={() => {
                              setActiveItem(log);
                              setActionType("WAIVED");
                            }}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                          >
                            Waive
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400">
                          {log.resolution_notes || "Resolved"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-xs">
            No revenue leakage records found. Click "Run Facility-Wide Audit Scanner" to check clinical ledgers.
          </div>
        )}
      </div>

      {/* 🔄 Modal: Reconcile / Waive Item */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">
                {actionType === "RECONCILED" ? "Reconcile Unbilled Service" : "Waive Unbilled Service"}
              </h3>
              <button onClick={() => setActiveItem(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Confirm action for <span className="font-bold text-gray-900">{activeItem.service_name}</span> (Amount: ₹
              {activeItem.estimated_leakage_amount}).
            </p>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Audit Resolution Notes</label>
              <textarea
                rows={3}
                placeholder={
                  actionType === "RECONCILED"
                    ? "e.g., Added to supplementary discharge invoice; payment collected."
                    : "e.g., Authorized clinical waiver by Medical Director."
                }
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReconcileAction}
                disabled={submittingAction}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm ${
                  actionType === "RECONCILED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-gray-800 hover:bg-black"
                }`}
              >
                Confirm {actionType === "RECONCILED" ? "Reconciliation" : "Waiver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

