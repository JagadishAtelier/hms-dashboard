import React from "react";
import {
  IndianRupee,
  CreditCard,
  Wallet,
  ArrowDownRight,
  TrendingUp,
  Percent,
  Users,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const PAYMENT_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#06B6D4", "#EC4899", "#8B5CF6"];

export default function FinancialsTab({ data }) {
  if (!data) return null;

  const { revenue, patient_economics, payment_methods, catalog_contribution_margins, period } = data;

  const paymentData = (payment_methods || []).map((pm) => ({
    name: pm.method.toUpperCase(),
    value: pm.amount,
    count: pm.count,
  }));

  return (
    <div className="space-y-6">
      {/* 1. FINANCIAL WATERFALL & CASH FLOW METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Gross Billed
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
            ₹{Number(revenue?.gross_billed || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {revenue?.billing_invoices_count || 0} Bills + {revenue?.pos_transactions_count || 0} POS
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Collected Cash
          </div>
          <div className="text-xl font-black text-emerald-600 mt-1 tabular-nums">
            ₹{Number(revenue?.total_collected || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Cash & Digital receipts
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Outstanding Due
          </div>
          <div className="text-xl font-black text-rose-600 mt-1 tabular-nums">
            ₹{Number(revenue?.outstanding_due || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            Unsettled balances
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Processed Refunds
          </div>
          <div className="text-xl font-black text-amber-600 mt-1 tabular-nums">
            ₹{Number(revenue?.refunds_processed || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Customer returns
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-md col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold uppercase text-indigo-200">
            Net Collected Cash
          </div>
          <div className="text-xl font-black text-white mt-1 tabular-nums">
            ₹{Number(revenue?.net_collected || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-indigo-100 font-medium mt-1">
            Collected - Refunds
          </div>
        </div>
      </div>

      {/* 2. PAYMENT METHODS & PATIENT ECONOMICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Mix */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Payment Channels & Tender Mix
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Distribution of collected receipts by payment instrument for {period?.label}
          </p>

          <div className="h-60 w-full">
            {paymentData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No payment transactions recorded in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString("en-IN")}`, "Amount"]}
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-600">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Patient Economics (ARPU OPD vs IPD) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Patient Economics (ARPU)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Average revenue generated per distinct outpatient visit and inpatient admission.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* OPD Card */}
              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                    OPD Economics
                  </span>
                  <Users size={16} className="text-sky-600" />
                </div>
                <div className="text-2xl font-black text-sky-900 tabular-nums">
                  ₹{Number(patient_economics?.arpu_opd || 0).toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-sky-700 mt-1">
                  Avg revenue per Outpatient
                </div>
                <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-sky-200/60">
                  {patient_economics?.opd_unique_patients || 0} Unique OPD Patients
                </div>
              </div>

              {/* IPD Card */}
              <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                    IPD Economics
                  </span>
                  <IndianRupee size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl font-black text-purple-900 tabular-nums">
                  ₹{Number(patient_economics?.arpu_ipd || 0).toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-purple-700 mt-1">
                  Avg revenue per Admission
                </div>
                <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-purple-200/60">
                  {patient_economics?.ipd_unique_patients || 0} Inpatient Admissions
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-start gap-2 mt-4">
            <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
            <span>
              ARPU separates Outpatient consultations from Inpatient bed stays to prevent high-value surgical cases from skewing general clinic throughput metrics.
            </span>
          </div>
        </div>
      </div>

      {/* 3. CATALOG CONTRIBUTION MARGIN ANALYSIS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Catalog Contribution Margin Analysis
            </h3>
            <p className="text-xs text-slate-500">
              {catalog_contribution_margins?.methodology}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
            Unit Economics Only
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3">Catalogue Category</th>
                <th className="py-2.5 px-3 text-right">Items Tracked</th>
                <th className="py-2.5 px-3 text-right">Avg Selling Price</th>
                <th className="py-2.5 px-3 text-right">Avg Direct Cost</th>
                <th className="py-2.5 px-3 text-right">Unit Margin (₹)</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(catalog_contribution_margins?.breakdown || []).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {row.type}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {row.item_count}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900 tabular-nums">
                    ₹{row.avg_selling_price?.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                    ₹{row.avg_unit_cost?.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-indigo-600 tabular-nums">
                    ₹{row.avg_margin_amount?.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            row.margin_percentage >= 50
                              ? "bg-emerald-500"
                              : row.margin_percentage >= 30
                              ? "bg-indigo-500"
                              : "bg-amber-500"
                          )}
                          style={{ width: `${Math.min(100, Math.max(0, row.margin_percentage))}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800 tabular-nums">
                        {row.margin_percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
