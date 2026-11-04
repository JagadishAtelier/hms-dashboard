import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  RefreshCw,
  HardDrive,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileCheck,
  Server,
  Layers,
  ArrowDownToLine,
  HelpCircle,
  FileText
} from "lucide-react";
import disasterRecoveryService from "../../service/disasterRecoveryService.js";

const DisasterRecoveryPage = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupType, setBackupType] = useState("MANUAL_ON_DEMAND");
  const [copiedHash, setCopiedHash] = useState(null);
  const [alertBanner, setAlertBanner] = useState(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const results = await Promise.allSettled([
        disasterRecoveryService.getHealthTelemetry(),
        disasterRecoveryService.getBackupHistory(25),
      ]);

      if (results[0].status === "fulfilled" && results[0].value?.success) {
        setTelemetry(results[0].value.data);
      } else if (results[0].status === "rejected") {
        console.warn("Health telemetry probe issue:", results[0].reason);
      }

      if (results[1].status === "fulfilled" && results[1].value?.success) {
        setBackups(results[1].value.data || []);
      } else if (results[1].status === "rejected") {
        console.warn("Backup history fetch issue:", results[1].reason);
      }
    } catch (err) {
      console.error("Failed to load disaster recovery telemetry:", err);
      setAlertBanner({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to load real-time system telemetry probes.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 30000); // auto-refresh probe every 30s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleTriggerSnapshot = async () => {
    setSnapshotLoading(true);
    try {
      const res = await disasterRecoveryService.triggerBackupSnapshot(backupType);
      if (res.success) {
        setAlertBanner({
          type: "success",
          message: `Point-in-time snapshot created successfully: ${res.data.backupName} (${res.data.totalRecords} records across ${res.data.totalTables} tables). SHA-256 verification passed.`,
        });
        setShowBackupModal(false);
        await loadData(true);
      }
    } catch (err) {
      console.error("Backup snapshot failed:", err);
      setAlertBanner({
        type: "error",
        message: err.response?.data?.message || "Failed to generate point-in-time backup snapshot.",
      });
    } finally {
      setSnapshotLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(" ");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Disaster Recovery & Forensic Audit
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                High-availability point-in-time snapshots, SHA-256 cryptographic immutability, and system health telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </button>
          <button
            onClick={() => setShowBackupModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <Database className="w-4 h-4" />
            Create Snapshot
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between border ${
            alertBanner.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {alertBanner.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="text-sm font-medium">{alertBanner.message}</span>
          </div>
          <button
            onClick={() => setAlertBanner(null)}
            className="text-xs font-semibold underline ml-4 hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Probe 1: Overall System Status */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Health Status
            </span>
            <div className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  telemetry?.status === "HEALTHY" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  telemetry?.status === "HEALTHY" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {telemetry?.status === "HEALTHY" ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            )}
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {telemetry ? telemetry.status : "PROBING..."}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Last probe: {telemetry ? new Date(telemetry.probedAt).toLocaleTimeString() : "--"}
          </p>
        </div>

        {/* Probe 2: Database Heartbeat */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Database Latency
            </span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {telemetry?.database?.latencyMs ?? 0}
            </span>
            <span className="text-sm font-medium text-slate-500">ms roundtrip</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Dialect: {telemetry?.database?.dialect || "MySQL 8.0+"}
          </p>
        </div>

        {/* Probe 3: Live Workload */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Hospital Entities
            </span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {telemetry?.liveEntityCounts?.activeInpatients ?? 0}
            </span>
            <span className="text-sm font-medium text-slate-500">Inpatients</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {telemetry?.liveEntityCounts?.activePatients ?? 0} registered &bull;{" "}
            {telemetry?.liveEntityCounts?.pendingTasks ?? 0} pending tasks
          </p>
        </div>

        {/* Probe 4: Server Runtime */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Node Runtime & Heap
            </span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {telemetry?.serverRuntime?.heapUsedMB ?? 0}
            </span>
            <span className="text-sm font-medium text-slate-500">
              / {telemetry?.serverRuntime?.heapTotalMB ?? 0} MB
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Server uptime: {formatUptime(telemetry?.serverRuntime?.uptimeSeconds)}
          </p>
        </div>
      </div>

      {/* Latest Snapshot Hero Card */}
      {telemetry?.latestBackup && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md border border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {telemetry.latestBackup.verificationStatus}
                </span>
                <span className="text-xs text-slate-400">
                  Backed up on {new Date(telemetry.latestBackup.createdAt).toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-100">
                {telemetry.latestBackup.name}
              </h3>
              <p className="text-xs text-slate-300">
                Size: <span className="font-semibold text-white">{formatBytes(telemetry.latestBackup.sizeBytes)}</span> &bull; Type: <span className="font-semibold text-white">{telemetry.latestBackup.type}</span>
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-700/80 max-w-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Forensic SHA-256 Checksum
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(telemetry.latestBackup.checksum, telemetry.latestBackup.id)
                  }
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                >
                  {copiedHash === telemetry.latestBackup.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy Hash</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-mono text-slate-300 truncate bg-slate-900 px-2 py-1.5 rounded border border-slate-800">
                {telemetry.latestBackup.checksum}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Historical Snapshot Archive & Audits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable archive of full-facility relational snapshots with cryptographically verified checksums.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 self-start sm:self-auto">
            Showing last {backups.length} snapshots
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading backup archive...
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No point-in-time snapshots created yet. Click "Create Snapshot" to initialize the archive.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Snapshot Name & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Tables / Records</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Verification Checksum</th>
                  <th className="py-3 px-4">Integrity Status</th>
                  <th className="py-3 px-4">Initiator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                {backups.map((bk) => (
                  <tr
                    key={bk.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium font-mono text-slate-900 dark:text-slate-100">
                        {bk.backup_name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(bk.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {bk.backup_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {formatBytes(bk.file_size_bytes)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {bk.total_records_count?.toLocaleString() || 0} records
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {bk.total_tables_backed_up || 0} tables
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {bk.duration_ms ? `${bk.duration_ms}ms` : "--"}
                    </td>
                    <td className="py-3 px-4">
                      {bk.checksum_sha256 ? (
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                            {bk.checksum_sha256.substring(0, 10)}...{bk.checksum_sha256.slice(-6)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(bk.checksum_sha256, bk.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHash === bk.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {bk.verification_status === "VERIFIED_HEALTHY" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                        </span>
                      ) : bk.verification_status === "CORRUPT_CHECKSUM" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          CORRUPT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          {bk.verification_status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                      {bk.initiated_by || "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Snapshot Trigger Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Execute Snapshot
                </h3>
                <p className="text-xs text-slate-500">
                  Full relational point-in-time database snapshot
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Backup Purpose / Classification
                </label>
                <select
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="MANUAL_ON_DEMAND">Manual On-Demand Audit</option>
                  <option value="PRE_UPGRADE_AUDIT">Pre-Upgrade / Pre-Maintenance</option>
                  <option value="SCHEDULED_AUTOMATED">Automated Disaster Protocol</option>
                  <option value="COMPLIANCE_EXPORT">HIPAA / Compliance Snapshot</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Integrity Guarantee:
                </p>
                <p>
                  &bull; Exports 18 enterprise tables (patients, beds, admissions, orders, billing).
                </p>
                <p>
                  &bull; Generates an immutable SHA-256 hash immediately upon file serialization.
                </p>
                <p>
                  &bull; Re-reads the generated snapshot to verify zero byte-level truncation.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                disabled={snapshotLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerSnapshot}
                disabled={snapshotLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-60"
              >
                {snapshotLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {snapshotLoading ? "Executing Backup..." : "Start Snapshot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterRecoveryPage;

