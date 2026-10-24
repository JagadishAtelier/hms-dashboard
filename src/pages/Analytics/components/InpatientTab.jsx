import React from "react";
import {
  Bed,
  DoorOpen,
  CalendarDays,
  Clock,
  TrendingUp,
  Info,
  ShieldAlert,
  AlertCircle,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InpatientTab({ data }) {
  if (!data) return null;

  const { census, cohort_flow, alos, utilization_economics, bed_turnover_interval, ward_occupancy_breakdown, period } = data;

  const borPct = census?.current_occupancy_rate_pct || 0;

  return (
    <div className="space-y-6">
      {/* 1. REAL-TIME BED CENSUS BAROMETER & FLOW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Total Active Beds
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {census?.total_active_beds || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Physical hospital capacity
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Occupied Beds
          </div>
          <div className="text-2xl font-black text-purple-600 mt-1 tabular-nums">
            {census?.occupied_beds || 0}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            Currently admitted patients
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Available Beds
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">
            {census?.available_beds || 0}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Ready for admission
          </div>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border shadow-xs",
          borPct > 85
            ? "bg-rose-50 border-rose-200 text-rose-900"
            : borPct > 70
            ? "bg-purple-50 border-purple-200 text-purple-900"
            : "bg-emerald-50 border-emerald-200 text-emerald-900"
        )}>
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
            Current BOR
          </div>
          <div className="text-2xl font-black mt-1 tabular-nums">
            {borPct}%
          </div>
          <div className="text-[11px] font-medium mt-1 opacity-80">
            {borPct > 85 ? "Near Capacity" : borPct > 70 ? "Optimal Utilization" : "High Availability"}
          </div>
        </div>
      </div>

      {/* 2. ALOS, REVPAB, AND FLOW SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ALOS Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Average Length of Stay (ALOS)
              </span>
              <Clock size={16} className="text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
              {alos?.average_days || 0} <span className="text-base font-semibold text-slate-500">days</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Range: {alos?.min_days || 0}d min to {alos?.max_days || 0}d max stay.
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5">
            <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span>
              Calculated on the {cohort_flow?.discharged_cohort_count || 0} patients discharged in this period.
            </span>
          </div>
        </div>

        {/* RevPAB Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                RevPAB (Revenue / Avail. Bed)
              </span>
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
              ₹{Number(utilization_economics?.revpab || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Per available bed-day across {utilization_economics?.total_available_bed_days || 0} capacity days.
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Total Inpatient Bed Revenue: ₹{Number(utilization_economics?.period_bed_revenue || 0).toLocaleString("en-IN")}
          </div>
        </div>

        {/* Patient Inflow vs Outflow */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Inpatient Patient Flow
              </span>
              <CalendarDays size={16} className="text-purple-600" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">New Admissions:</span>
                <span className="font-bold text-slate-900 tabular-nums">+{cohort_flow?.new_admissions || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Discharged Cohort:</span>
                <span className="font-bold text-slate-900 tabular-nums">-{cohort_flow?.discharged_cohort_count || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 font-bold">
                <span className="text-slate-700">Net Bed Flow:</span>
                <span className={cn(
                  "tabular-nums",
                  (cohort_flow?.net_bed_flow || 0) >= 0 ? "text-purple-600" : "text-emerald-600"
                )}>
                  {(cohort_flow?.net_bed_flow || 0) > 0 ? `+${cohort_flow?.net_bed_flow}` : cohort_flow?.net_bed_flow} beds
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-slate-400">
            Period: {period?.label}
          </div>
        </div>
      </div>

      {/* 3. WARD & ROOM TYPE OCCUPANCY BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-1">
          Ward & Room Unit Occupancy Breakdown
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Live capacity, active occupancy, and pricing across hospital units.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(ward_occupancy_breakdown || []).map((w, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {w.ward_name}
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                  w.room_type === "ICU"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : w.room_type === "Private"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                )}>
                  {w.room_type}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>{w.occupied_beds} occupied / {w.total_beds} beds</span>
                <span className="font-bold text-slate-900">{w.occupancy_pct}%</span>
              </div>

              {/* Occupancy bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    w.occupancy_pct > 85 ? "bg-rose-500" : w.occupancy_pct > 50 ? "bg-purple-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, w.occupancy_pct))}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span>Available: {w.available_beds} beds</span>
                <span className="font-semibold text-slate-700">₹{w.price_per_day}/day</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. BED TURNOVER INTERVAL DATA DISCLOSURE */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <div className="font-bold">Bed Turnover Interval (Cleaning to Occupancy)</div>
          <div className="mt-0.5 text-amber-800">
            {bed_turnover_interval?.reason || "Housekeeping sanitization and bed-ready timestamps are not currently recorded in the admissions workflow. To prevent metric distortion, this KPI is marked insufficient_data rather than displaying an estimated value."}
          </div>
        </div>
      </div>
    </div>
  );
}
