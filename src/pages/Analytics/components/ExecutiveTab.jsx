import React from "react";
import {
  IndianRupee,
  Bed,
  CalendarCheck,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Activity,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const DEPT_COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6"];

export default function ExecutiveTab({ data, onSelectTab }) {
  if (!data) return null;

  const { executive_kpis, breakdowns, period } = data;
  const financials = breakdowns?.financials;
  const inpatient = breakdowns?.inpatient;
  const opd = breakdowns?.opd;
  const lab = breakdowns?.laboratory;
  const pharmacy = breakdowns?.pharmacy;

  const deptData = financials?.departmental_revenue || [];

  return (
    <div className="space-y-6">
      {/* 1. TOP 4 GLASSMORPHIC EXECUTIVE STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Collected Cash */}
        <div
          onClick={() => onSelectTab?.("financials")}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <IndianRupee size={20} />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 flex items-center gap-1">
              <TrendingUp size={11} /> Net Cash
            </span>
          </div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Net Collected Cash
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            ₹{Number(executive_kpis?.net_collected_cash || 0).toLocaleString("en-IN")}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Gross Billed: ₹{Number(executive_kpis?.gross_revenue || 0).toLocaleString("en-IN")}</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Details <ArrowUpRight size={13} />
            </span>
          </div>
        </div>

        {/* Card 2: Bed Occupancy Rate */}
        <div
          onClick={() => onSelectTab?.("inpatient")}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Bed size={20} />
            </div>
            <span className={cn(
              "text-[11px] font-semibold px-2.5 py-0.5 rounded-full border",
              (executive_kpis?.current_bed_occupancy_pct || 0) > 85
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            )}>
              {executive_kpis?.current_bed_occupancy_pct || 0}% Occupancy
            </span>
          </div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Bed Occupancy Rate
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {executive_kpis?.current_bed_occupancy_pct || 0}%
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {inpatient?.census?.occupied_beds || 0} Occupied / {inpatient?.census?.total_active_beds || 0} Beds
            </span>
            <span className="text-purple-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Wards <ArrowUpRight size={13} />
            </span>
          </div>
        </div>

        {/* Card 3: OPD Completion Rate */}
        <div
          onClick={() => onSelectTab?.("opd")}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <CalendarCheck size={20} />
            </div>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/70">
              {opd?.summary?.completed_count || 0} Fulfilled
            </span>
          </div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            OPD Fulfillment Rate
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {executive_kpis?.opd_completion_rate_pct || 0}%
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{opd?.summary?.total_appointments || 0} Appointments Scheduled</span>
            <span className="text-sky-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              OPD <ArrowUpRight size={13} />
            </span>
          </div>
        </div>

        {/* Card 4: Pharmacy Inventory & Expiry Risk */}
        <div
          onClick={() => onSelectTab?.("pharmacy")}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Package size={20} />
            </div>
            {Number(executive_kpis?.pharmacy_expiry_risk_90d || 0) > 0 ? (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70 flex items-center gap-1">
                <AlertTriangle size={11} /> Risk 90d
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                Safe Stock
              </span>
            )}
          </div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Pharmacy Valuation (Cost)
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            ₹{Number(executive_kpis?.pharmacy_inventory_cost || 0).toLocaleString("en-IN")}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>₹{Number(executive_kpis?.pharmacy_expiry_risk_90d || 0).toLocaleString("en-IN")} expiring 90d</span>
            <span className="text-amber-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Stock <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHARTS & OPERATIONAL VELOCITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Departmental Revenue Contribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Departmental Revenue Contribution
              </h3>
              <p className="text-xs text-slate-500">
                Gross revenue generated by healthcare service channels for {period?.label}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
              Total: ₹{Number(financials?.revenue?.gross_billed || 0).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptData}
                margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "10px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {deptData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DEPT_COLORS[index % DEPT_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Clinical Operations Velocity Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Operational Velocity
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Core clinical turnaround times & efficiency metrics.
            </p>

            <div className="space-y-3.5">
              {/* Metric A: ALOS */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Average Length of Stay (ALOS)
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {executive_kpis?.average_length_of_stay_days || 0} days
                  </div>
                </div>
                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-md">
                  IPD Cohort
                </span>
              </div>

              {/* Metric B: Lab TAT */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Diagnostic Turnaround Time
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {executive_kpis?.lab_avg_turnaround_time_hours || 0} hours
                  </div>
                </div>
                <span className="text-xs text-sky-600 font-semibold bg-sky-50 px-2 py-1 rounded-md flex items-center gap-1">
                  <Clock size={12} /> Avg TAT
                </span>
              </div>

              {/* Metric C: Outstanding Receivables */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Outstanding Receivables
                  </div>
                  <div className="text-base font-bold text-rose-600 mt-0.5">
                    ₹{Number(executive_kpis?.outstanding_receivables || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded-md">
                  Pending Due
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onSelectTab?.("financials")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
            >
              View Full Healthcare P&L →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
