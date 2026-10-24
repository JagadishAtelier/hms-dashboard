import React from "react";
import {
  FlaskConical,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LaboratoryTab({ data }) {
  if (!data) return null;

  const { volume, turnaround_time, delayed_tests, top_tests, period } = data;

  return (
    <div className="space-y-6">
      {/* 1. DIAGNOSTIC VOLUME & FULFILLMENT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Total Lab Orders
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {volume?.total_orders || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requisitions in {period?.label}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Completed Orders
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">
            {volume?.completed_orders || 0}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> {volume?.completion_rate_pct || 0}% Completion Rate
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Average Turnaround (TAT)
          </div>
          <div className="text-2xl font-black text-sky-600 mt-1 tabular-nums">
            {turnaround_time?.avg_tat_hours || 0} <span className="text-sm font-semibold text-slate-500">hrs</span>
          </div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">
            {turnaround_time?.avg_tat_minutes || 0} mins collection-to-result
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Delayed Diagnostic Tests
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1 tabular-nums">
            {delayed_tests?.delayed_count || 0}
          </div>
          <div className="text-[11px] text-rose-700 font-semibold mt-1">
            {delayed_tests?.delayed_rate_pct || 0}% exceeded {delayed_tests?.threshold_hours_applied || 24}h target
          </div>
        </div>
      </div>

      {/* 2. TAT ANALYSIS & DELAYED TEST METHODOLOGY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-sky-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Diagnostic Turnaround Time (TAT)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md">
              {turnaround_time?.avg_tat_minutes || 0} mins average
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {turnaround_time?.methodology || "Calculated strictly on test items possessing valid collection and result timestamps."}
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Min TAT</div>
              <div className="text-base font-bold text-slate-800 mt-1">{turnaround_time?.min_tat_minutes || 0}m</div>
            </div>
            <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100">
              <div className="text-[10px] uppercase font-bold text-sky-800">Average TAT</div>
              <div className="text-base font-black text-sky-900 mt-1">{turnaround_time?.avg_tat_hours || 0}h</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Max TAT</div>
              <div className="text-base font-bold text-slate-800 mt-1">{turnaround_time?.max_tat_minutes || 0}m</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Service Delivery Integrity (Delayed Tests)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Standard clinical threshold applied: <strong>{delayed_tests?.threshold_hours_applied || 24} hours</strong>. Tests exceeding this duration compromise physician treatment decisions and hospital discharge timelines.
            </p>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/70 flex items-center justify-between text-xs text-rose-900 font-semibold">
              <span>Delayed Test Outliers:</span>
              <span className="text-base font-bold text-rose-700">{delayed_tests?.delayed_count || 0} tests ({delayed_tests?.delayed_rate_pct || 0}%)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5 mt-3">
            <Info size={13} />
            <span>Excludes orders where sample has not yet been physically drawn.</span>
          </div>
        </div>
      </div>

      {/* 3. TOP 10 DIAGNOSTIC PANELS & TESTS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Top Diagnostic Requisitions
            </h3>
            <p className="text-xs text-slate-500">
              Highest-volume diagnostic tests ordered in the hospital during {period?.label}
            </p>
          </div>
          <FlaskConical size={18} className="text-indigo-600" />
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3">Test Name</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Diagnostic Category</th>
                <th className="py-2.5 px-3 text-right">Order Volume</th>
                <th className="py-2.5 px-3 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(top_tests || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No laboratory tests ordered in this period.
                  </td>
                </tr>
              ) : (
                (top_tests || []).map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {t.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {t.code}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {t.category || "General Lab"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800 tabular-nums">
                      {t.volume}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-600 tabular-nums">
                      ₹{Number(t.revenue || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
