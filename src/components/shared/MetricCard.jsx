import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  description,
  className,
  loading = false,
}) {
  return (
    <Card className={cn("overflow-hidden border border-border shadow-xs hover:shadow-sm transition-all py-0", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon size={18} />
            </div>
          )}
        </div>

        <div className="mt-2.5">
          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
          ) : (
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {value}
            </div>
          )}

          {(trend || description) && (
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {trend && (
                <span
                  className={cn(
                    "font-semibold font-mono",
                    trendPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {trend}
                </span>
              )}
              {description && (
                <span className="text-muted-foreground truncate">{description}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
