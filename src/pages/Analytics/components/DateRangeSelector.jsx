import React, { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESET_PERIODS = [
  { id: "today", label: "Today" },
  { id: "last_7_days", label: "Last 7 Days" },
  { id: "this_month", label: "This Month" },
  { id: "year_to_date", label: "Year to Date" },
  { id: "custom", label: "Custom Range" },
];

export default function DateRangeSelector({
  period = "this_month",
  startDate = "",
  endDate = "",
  onChange,
  disabled = false,
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  const handlePeriodClick = (pId) => {
    if (pId === "custom") {
      setShowCustomModal(true);
    } else {
      setShowCustomModal(false);
      onChange?.({ period: pId, startDate: undefined, endDate: undefined });
    }
  };

  const applyCustomRange = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setShowCustomModal(false);
    onChange?.({
      period: "custom",
      startDate: customStart,
      endDate: customEnd,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      {/* Horizontal pill scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        {PRESET_PERIODS.map((p) => {
          const isActive = period === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => handlePeriodClick(p.id)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all select-none",
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Display / Popover */}
      {period === "custom" && startDate && endDate && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50/70 border border-indigo-200/60 rounded-full text-xs text-indigo-700 font-medium shrink-0">
          <Calendar size={13} className="text-indigo-600" />
          <span>
            {startDate} to {endDate}
          </span>
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="text-[11px] underline hover:text-indigo-900 ml-1 font-semibold"
          >
            Edit
          </button>
        </div>
      )}

      {/* Custom Date Modal Backdrop */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Select Custom Date Range
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify the start and end dates (maximum 366 days).
            </p>
            <form onSubmit={applyCustomRange} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomModal(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Apply Range
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
