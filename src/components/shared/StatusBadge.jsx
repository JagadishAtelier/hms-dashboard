import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusVariantMap = {
  // Positive / Completed / Active
  active: "success",
  completed: "success",
  confirmed: "success",
  discharged: "success",
  available: "success",
  paid: "success",
  present: "success",
  approved: "success",

  // Pending / Warning / In Progress
  pending: "warning",
  scheduled: "warning",
  occupied: "warning",
  maintenance: "warning",
  leave: "warning",
  partial: "warning",
  half_day: "warning",

  // Info / Scheduled
  in_progress: "info",
  teleconsult: "info",
  opd: "info",
  on_duty: "info",

  // Danger / Cancelled / Inactive
  inactive: "destructive",
  cancelled: "destructive",
  rejected: "destructive",
  absent: "destructive",
  due: "destructive",
  expired: "destructive",
};

export default function StatusBadge({ status, label, className }) {
  if (!status) return null;
  const normalized = String(status).toLowerCase().trim().replace(/\s+/g, "_");
  const variant = statusVariantMap[normalized] || "outline";
  const displayLabel = label || String(status).replace(/_/g, " ");

  return (
    <Badge
      variant={variant}
      className={cn("capitalize font-semibold text-[11px] px-2.5 py-0.5", className)}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-current opacity-80" />
      {displayLabel}
    </Badge>
  );
}
