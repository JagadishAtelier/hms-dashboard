import React from "react";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PharmacyTab({ data }) {
  if (!data) return null;

  const { valuation, expiry_risk, reorder_alerts, fast_moving_products, period } = data;

  return (
    <div className="space-y-6">
      {/* 1. INVENTORY VALUATION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Valuation (Cost Basis)
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            ₹{Number(valuation?.total_valuation_at_cost || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total capital tied up in inventory
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Valuation (Retail Value)
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1 tabular-nums">
            ₹{Number(valuation?.total_valuation_at_retail || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            Expected gross dispensing realization
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Potential Gross Margin
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">
            ₹{Number(valuation?.potential_gross_margin || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Retail value minus inventory cost
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Total Units on Hand
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1 tabular-nums">
            {Number(valuation?.total_units_on_hand || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across all active pharmaceutical products
          </div>
        </div>
      </div>

      {/* 2. 90-DAY EXPIRY RISK RADAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Pharmaceutical Expiry Risk Radar
            </h3>
            <p className="text-xs text-slate-500">
              Unused stock grouped by expiration date to prioritize dispensing and vendor returns.
            </p>
          </div>
          <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 w-fit">
            Total 90d Risk: ₹{Number(expiry_risk?.total_value_at_risk_90d || 0).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Expired */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="flex items-center justify-between text-xs mb-1 font-bold text-rose-800">
              <span>Already Expired</span>
              <AlertCircle size={15} className="text-rose-600" />
            </div>
            <div className="text-xl font-black text-rose-700 tabular-nums">
              ₹{Number(expiry_risk?.already_expired?.value || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-rose-600 mt-1">
              {expiry_risk?.already_expired?.units || 0} units quarantine required
            </div>
          </div>

          {/* 1-30 Days */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between text-xs mb-1 font-bold text-amber-800">
              <span>Expiring in 1-30 Days</span>
              <Clock size={15} className="text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-700 tabular-nums">
              ₹{Number(expiry_risk?.expiring_within_30_days?.value || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-amber-600 mt-1">
              {expiry_risk?.expiring_within_30_days?.units || 0} units priority dispensing
            </div>
          </div>

          {/* 31-60 Days */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs mb-1 font-bold text-slate-700">
              <span>Expiring in 31-60 Days</span>
              <Clock size={15} className="text-slate-500" />
            </div>
            <div className="text-xl font-black text-slate-800 tabular-nums">
              ₹{Number(expiry_risk?.expiring_31_to_60_days?.value || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {expiry_risk?.expiring_31_to_60_days?.units || 0} units on radar
            </div>
          </div>

          {/* 61-90 Days */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs mb-1 font-bold text-slate-700">
              <span>Expiring in 61-90 Days</span>
              <Clock size={15} className="text-slate-500" />
            </div>
            <div className="text-xl font-black text-slate-800 tabular-nums">
              ₹{Number(expiry_risk?.expiring_61_to_90_days?.value || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {expiry_risk?.expiring_61_to_90_days?.units || 0} units on radar
            </div>
          </div>
        </div>
      </div>

      {/* 3. REORDER ALERTS & FAST-MOVING DRUGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reorder Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Stockout & Reorder Alerts
              </h3>
              <p className="text-xs text-slate-500">
                Products currently at or below minimum threshold ({reorder_alerts?.count || 0} items)
              </p>
            </div>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {(reorder_alerts?.items || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                All tracked inventory items are currently above reorder thresholds.
              </div>
            ) : (
              (reorder_alerts?.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {item.code}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 tabular-nums">
                      {item.current_stock} {item.unit || "units"} left
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Min: {item.min_reorder_level}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fast-Moving Dispensed Drugs */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Fast-Moving Pharmaceuticals
              </h3>
              <p className="text-xs text-slate-500">
                Highest dispensing volume in {period?.label}
              </p>
            </div>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {(fast_moving_products || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No pharmacy billing records in this period.
              </div>
            ) : (
              (fast_moving_products || []).map((prod, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{prod.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {prod.code}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-600 tabular-nums">
                      ₹{Number(prod.revenue || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {prod.units_dispensed} dispensed
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
