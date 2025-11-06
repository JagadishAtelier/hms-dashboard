"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

export function TooltipProvider({ children, ...props }) {
  return <TooltipPrimitive.Provider {...props}>{children}</TooltipPrimitive.Provider>
}

export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={`z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-md ${className}`}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName
