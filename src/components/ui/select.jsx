// src/components/ui/select.jsx
import * as React from "react";

export function Select({ children, value, onValueChange }) {
  return (
    <select
      className="border rounded-md p-2 w-full"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

export function SelectValue({ placeholder }) {
  return <option value="">{placeholder}</option>;
}
