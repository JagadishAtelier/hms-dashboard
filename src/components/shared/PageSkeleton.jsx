import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PageSkeleton() {
  return (
    <div className="p-6 space-y-6 w-full animate-fade-in">
      {/* Top Header Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/80">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-border rounded-xl p-5 bg-card space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Main Content / Table Skeleton */}
      <div className="border border-border rounded-xl p-5 bg-card space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
