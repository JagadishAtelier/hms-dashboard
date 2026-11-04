import React, { useEffect, useState, useMemo } from "react";
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlayCircle,
  Building2,
  Sliders,
  Filter,
  Search,
  Plus,
  RefreshCw,
  XCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  Sparkles,
  BedDouble,
  Calendar,
  User,
  ArrowUpRight,
  ShieldAlert,
  Save,
  CheckCheck
} from "lucide-react";
import taskBoardService from "../../service/taskBoardService.js";
import Loading from "../Loading.jsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

export default function CentralTaskBoard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    activeTotal: 0,
    statCount: 0,
    urgentCount: 0,
    routineCount: 0,
    breachedCount: 0,
    completedToday: 0,
    departmentBreakdown: {},
  });

  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Drawers
  const [slaModalOpen, setSlaModalOpen] = useState(false);
  const [wardSlaList, setWardSlaList] = useState([]);
  const [editingWardSla, setEditingWardSla] = useState(null);
  const [savingSla, setSavingSla] = useState(false);

  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    department: "NURSING",
    category: "VITAL_CHECK",
    priority: "ROUTINE",
    ward_id: "",
  });
  const [submittingTask, setSubmittingTask] = useState(false);

  // Status Action Modal
  const [statusModalTask, setStatusModalTask] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState("");

  const fetchBoardData = async () => {
    try {
      setRefreshing(true);
      const [tasksRes, statsRes] = await Promise.all([
        taskBoardService.getTasks({
          department: selectedDept,
          priority: selectedPriority,
          status: selectedStatus,
          ward_id: selectedWard,
          search: searchTerm,
        }),
        taskBoardService.getTaskStats(selectedWard),
      ]);

      if (tasksRes?.data?.tasks) setTasks(tasksRes.data.tasks);
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load task board data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadWardSlaConfigs = async () => {
    try {
      const res = await taskBoardService.getWardSLAConfigs();
      if (res?.data) {
        setWardSlaList(res.data);
      }
    } catch (err) {
      console.error("Failed to load ward SLA configs:", err);
    }
  };

  useEffect(() => {
    fetchBoardData();
    loadWardSlaConfigs();
    const interval = setInterval(fetchBoardData, 20000); // 20s live sync
    return () => clearInterval(interval);
  }, [selectedDept, selectedPriority, selectedStatus, selectedWard]);

  const handleSaveWardSla = async () => {
    if (!editingWardSla) return;
    try {
      setSavingSla(true);
      await taskBoardService.updateWardSLAConfig(editingWardSla.id, editingWardSla);
      await loadWardSlaConfigs();
      setEditingWardSla(null);
      await fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save SLA configuration");
    } finally {
      setSavingSla(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskData.title.trim()) {
      alert("Please enter a task title");
      return;
    }
    try {
      setSubmittingTask(true);
      await taskBoardService.createTask(newTaskData);
      setCreateTaskModalOpen(false);
      setNewTaskData({
        title: "",
        description: "",
        department: "NURSING",
        category: "VITAL_CHECK",
        priority: "ROUTINE",
        ward_id: "",
      });
      await fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleExecuteStatusChange = async () => {
    if (!statusModalTask || !targetStatus) return;
    try {
      await taskBoardService.updateTaskStatus(statusModalTask.id, {
        status: targetStatus,
        resolution_notes: actionNotes,
      });
      setStatusModalTask(null);
      setTargetStatus("");
      setActionNotes("");
      await fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "STAT":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-600 animate-pulse",
          label: "STAT - Immediate",
        };
      case "URGENT":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "Urgent",
        };
      case "ROUTINE":
      default:
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          label: "Routine",
        };
    }
  };

  const getDepartmentIcon = (dept) => {
    switch (dept) {
      case "NURSING":
        return <BedDouble className="w-4 h-4 text-emerald-600" />;
      case "PHARMACY":
        return <Pill className="w-4 h-4 text-purple-600" />;
      case "LABORATORY":
        return <FlaskConical className="w-4 h-4 text-blue-600" />;
      case "BILLING":
        return <Receipt className="w-4 h-4 text-amber-600" />;
      case "HOUSEKEEPING":
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case "CLINICAL":
      default:
        return <Stethoscope className="w-4 h-4 text-indigo-600" />;
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 🏥 Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Central Hospital Task Board
            </h1>
            <p className="text-sm text-gray-500">
              Cross-departmental real-time activity tracker, clinical workflows, and per-ward SLA monitoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSlaModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition-all"
          >
            <Sliders className="w-4 h-4 text-gray-500" />
            Configure Ward SLAs
          </button>

          <button
            onClick={() => setCreateTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Dispatch Task
          </button>

          <button
            onClick={fetchBoardData}
            disabled={refreshing}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 📊 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Tasks</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeTotal}</p>
          <div className="text-[11px] text-gray-400 mt-1">Pending & In-Progress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">STAT Critical</span>
            {stats.statCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.statCount}</p>
          <div className="text-[11px] text-rose-500 mt-1 font-medium">Needs Immediate Attention</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Urgent Tasks</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.urgentCount}</p>
          <div className="text-[11px] text-amber-500 mt-1 font-medium">Priority Escalation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">SLA Breached</span>
          <p className="text-2xl font-bold text-rose-800 mt-1">{stats.breachedCount}</p>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            {stats.breachedCount === 0 ? "All Within SLA" : "Overdue Benchmarks"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed Today</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.completedToday}</p>
          <div className="text-[11px] text-emerald-500 mt-1 font-medium">Resolved Daily Target</div>
        </div>
      </div>

      {/* 🏢 Department Selector Tabs */}
      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-1.5 items-center">
        {[
          { id: "ALL", label: "All Departments", icon: ClipboardList },
          { id: "NURSING", label: "Nursing", icon: BedDouble },
          { id: "PHARMACY", label: "Pharmacy", icon: Pill },
          { id: "LABORATORY", label: "Laboratory", icon: FlaskConical },
          { id: "BILLING", label: "Billing & Cashier", icon: Receipt },
          { id: "HOUSEKEEPING", label: "Housekeeping", icon: Sparkles },
          { id: "CLINICAL", label: "Clinical & Rounds", icon: Stethoscope },
        ].map((dept) => {
          const Icon = dept.icon;
          const isSelected = selectedDept === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                isSelected
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {dept.label}
              {dept.id !== "ALL" && stats.departmentBreakdown[dept.id] > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {stats.departmentBreakdown[dept.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 🔍 Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by task #, title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="py-2 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="ALL">All Wards / Floors</option>
            {wardSlaList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.floor})
              </option>
            ))}
          </select>
        </div>

        {/* Priority & Status Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="py-1.5 px-2.5 text-xs border border-gray-200 rounded-lg text-gray-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="STAT">STAT Only</option>
            <option value="URGENT">Urgent Only</option>
            <option value="ROUTINE">Routine Only</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-2.5 text-xs border border-gray-200 rounded-lg text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>
      </div>

      {/* 📋 Tasks Table & Kanban Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Hospital Operational Tasks</h2>
            <p className="text-xs text-gray-500">
              Sorted by urgency and dynamic ward SLA countdown
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700">
            {tasks.length} Tasks Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Task / Serial</th>
                <th className="py-3 px-3">Dept & Category</th>
                <th className="py-3 px-3">Ward & Location</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">SLA Status</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {tasks.map((task) => {
                const prio = getPriorityBadge(task.priority);
                const isOverdue = task.sla_breached;
                const isCompleted = task.status === "COMPLETED";

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-gray-50/60 transition-colors ${
                      task.priority === "STAT" && !isCompleted ? "bg-rose-50/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{task.task_no}</div>
                      <div className="font-medium text-gray-800 text-xs mt-0.5 line-clamp-1">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        {getDepartmentIcon(task.department)}
                        {task.department}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {task.category.replace(/_/g, " ")}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-900">
                        {task.ward?.name || "Facility"}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {task.room?.room_no ? `Room ${task.room.room_no}` : ""}
                        {task.bed?.bed_no ? ` • Bed ${task.bed.bed_no}` : ""}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {task.patient ? (
                        <div>
                          <span className="font-semibold text-gray-900">
                            {task.patient.first_name} {task.patient.last_name || ""}
                          </span>
                          <div className="text-[11px] text-gray-400">
                            {task.patient.patient_code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">General</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${prio.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                        {prio.label}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {isCompleted ? (
                        <div className="text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCheck className="w-3.5 h-3.5" />
                          Resolved
                        </div>
                      ) : isOverdue ? (
                        <div className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                          Breached (+{task.sla_breach_minutes}m)
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {task.remaining_sla_minutes > 0
                            ? `${task.remaining_sla_minutes}m left`
                            : "Due now"}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : task.status === "ESCALATED"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {task.status === "PENDING" && (
                        <button
                          onClick={() => {
                            setStatusModalTask(task);
                            setTargetStatus("IN_PROGRESS");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-all border border-blue-200"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Start
                        </button>
                      )}

                      {task.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => {
                            setStatusModalTask(task);
                            setTargetStatus("COMPLETED");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </button>
                      )}

                      {task.status === "COMPLETED" && (
                        <span className="text-[11px] text-gray-400">
                          by {task.completed_by_name || "Staff"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No active tasks in this view</h3>
            <p className="text-xs text-gray-400 mt-1">
              All activities are up-to-date or match criteria
            </p>
          </div>
        )}
      </div>

      {/* ⚙️ Per-Ward Configurable SLA Targets Modal */}
      {slaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  Per-Ward SLA Target Benchmarks
                </h3>
                <p className="text-xs text-gray-500">
                  Configure custom turnaround targets per ward (e.g. ICU vs General Ward vs Emergency)
                </p>
              </div>
              <button onClick={() => setSlaModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {wardSlaList.map((ward) => {
                const isEditing = editingWardSla?.id === ward.id;
                const current = isEditing ? editingWardSla : ward;

                return (
                  <div
                    key={ward.id}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-gray-900 text-sm">
                          {ward.name} <span className="text-xs text-gray-500">({ward.floor})</span>
                        </h4>
                      </div>

                      {!isEditing ? (
                        <button
                          onClick={() => setEditingWardSla({ ...ward })}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Edit SLAs
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingWardSla(null)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveWardSla}
                            disabled={savingSla}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block">
                          STAT Lab SLA (m)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={current.stat_lab_sla_minutes}
                            onChange={(e) =>
                              setEditingWardSla({ ...current, stat_lab_sla_minutes: e.target.value })
                            }
                            className="mt-1 w-full text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-800">
                            {ward.stat_lab_sla_minutes} mins
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block">
                          Bed Cleaning (m)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={current.bed_cleaning_sla_minutes}
                            onChange={(e) =>
                              setEditingWardSla({
                                ...current,
                                bed_cleaning_sla_minutes: e.target.value,
                              })
                            }
                            className="mt-1 w-full text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-800">
                            {ward.bed_cleaning_sla_minutes} mins
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block">
                          Discharge Meds (m)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={current.discharge_meds_sla_minutes}
                            onChange={(e) =>
                              setEditingWardSla({
                                ...current,
                                discharge_meds_sla_minutes: e.target.value,
                              })
                            }
                            className="mt-1 w-full text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-800">
                            {ward.discharge_meds_sla_minutes} mins
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block">
                          Vital Checks (hrs)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={current.vital_check_interval_hours}
                            onChange={(e) =>
                              setEditingWardSla({
                                ...current,
                                vital_check_interval_hours: e.target.value,
                              })
                            }
                            className="mt-1 w-full text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-800">
                            Every {ward.vital_check_interval_hours} hrs
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block">
                          Rounding SLA (hrs)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={current.rounding_sla_hours}
                            onChange={(e) =>
                              setEditingWardSla({
                                ...current,
                                rounding_sla_hours: e.target.value,
                              })
                            }
                            className="mt-1 w-full text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-800">
                            Within {ward.rounding_sla_hours} hrs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ➕ Modal: Dispatch Task */}
      {createTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Dispatch Hospital Task</h3>
              <button onClick={() => setCreateTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-gray-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., STAT ABG sample collection or Bed 102 terminal cleaning"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Target Department</label>
                  <select
                    value={newTaskData.department}
                    onChange={(e) => setNewTaskData({ ...newTaskData, department: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NURSING">Nursing</option>
                    <option value="PHARMACY">Pharmacy</option>
                    <option value="LABORATORY">Laboratory</option>
                    <option value="BILLING">Billing</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="CLINICAL">Clinical</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-1">Priority</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 font-semibold text-rose-700"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="STAT">STAT (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Ward Location</label>
                <select
                  value={newTaskData.ward_id}
                  onChange={(e) => setNewTaskData({ ...newTaskData, ward_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Ward (Auto-derives Ward SLA)</option>
                  {wardSlaList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Clinical Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Provide clinical context or urgency notes..."
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateTaskModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔄 Modal: Task Status Resolution */}
      {statusModalTask && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">
                {targetStatus === "COMPLETED" ? "Resolve & Complete Task" : "Acknowledge Task"}
              </h3>
              <button onClick={() => setStatusModalTask(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Update status for <span className="font-bold text-gray-900">{statusModalTask.task_no}</span>:{" "}
              {statusModalTask.title}
            </p>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Resolution / Progress Notes</label>
              <textarea
                rows={3}
                placeholder="Document resolution findings or handoff notes..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusModalTask(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteStatusChange}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

