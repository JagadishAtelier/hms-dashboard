import React from "react";
import { cn } from "@/lib/utils";

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-4 border-b border-border/80 mb-6",
        className
      )}
    >
      <div className="space-y-1">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {bc.href ? (
                  <a
                    href={bc.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {bc.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-2 pt-2 md:pt-0">{action}</div>}
    </div>
  );
}
