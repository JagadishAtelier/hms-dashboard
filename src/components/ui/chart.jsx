"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ChartContainer({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-[300px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ChartTooltip({ content, ...props }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div {...props} />
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Dummy components for now (optional for styling)
export function ChartTooltipContent() {
  return <div className="text-xs text-gray-700">Tooltip</div>
}
export function ChartLegendContent() {
  return <div className="text-xs text-gray-500">Legend</div>
}
export function ChartLegend() {
  return null
}