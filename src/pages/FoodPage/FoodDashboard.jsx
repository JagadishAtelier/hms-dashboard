import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Users, ClipboardList, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import foodService from "../../service/foodService";

const MEAL_COLORS = {
  breakfast: "bg-yellow-100 text-yellow-700 border-yellow-200",
  lunch: "bg-blue-100 text-blue-700 border-blue-200",
  dinner: "bg-indigo-100 text-indigo-700 border-indigo-200",
  snack: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_COLORS = {
  pending: "bg-orange-100 text-orange-700",
  prepared: "bg-blue-100 text-blue-700",
  distributed: "bg-green-100 text-green-700",
  skipped: "bg-gray-100 text-gray-500",
};

export default function FoodDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const today = dayjs().format("YYYY-MM-DD");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await foodService.getDashboard();
      setData(res.data?.data || res.data);
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await foodService.generateDailyLogs(today);
      toast.success(res.data?.message || "Meal logs generated");
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate logs");
    } finally {
      setGenerating(false);
    }
  };

  const handleMark = async (id) => {
    try {
      await foodService.markDistributed(id);
      toast.success("Marked as distributed");
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  const stats = [
    { label: "Admitted Patients", value: data?.totalAdmitted ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active Meal Plans", value: data?.totalPlans ?? 0, icon: ClipboardList, color: "text-indigo-600 bg-indigo-50" },
    { label: "Today Distributed", value: data?.distributed ?? 0, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "Today Pending", value: data?.pending ?? 0, icon: Clock, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <UtensilsCrossed className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Food Management</h2>
            <p className="text-xs text-gray-500">{dayjs().format("dddd, MMMM D, YYYY")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60">
            <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
            {generating ? "Generating..." : "Generate Today's Logs"}
          </button>
          <button onClick={() => navigate("/food/meal-plans")}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            Meal Plans
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Meal Logs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Today's Meal Distribution</h3>
          <button onClick={fetch} className="text-gray-400 hover:text-gray-600"><RefreshCw size={14} /></button>
        </div>

        {!data?.todayLogs?.length ? (
          <div className="p-8 text-center text-gray-400">
            No meal logs for today. Click "Generate Today's Logs" to create them.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Patient", "Code", "Meal Type", "Status", "Distributed By", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.todayLogs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {log.patient ? `${log.patient.first_name} ${log.patient.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{log.patient?.patient_code || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${MEAL_COLORS[log.meal_type] || ""}`}>
                        {log.meal_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[log.status] || ""}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{log.distributed_by_name || "—"}</td>
                    <td className="px-4 py-3">
                      {log.status !== "distributed" && log.status !== "skipped" ? (
                        <button onClick={() => handleMark(log.id)}
                          className="px-3 py-1 text-xs rounded-md bg-green-500 text-white hover:bg-green-600">
                          Mark Distributed
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
