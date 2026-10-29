import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  CalendarCheck,
  Bed,
  ReceiptText,
  Boxes,
  FlaskConical,
  IdCardLanyard,
  Scissors,
  UtensilsCrossed,
  ArrowRight,
  X,
  Command,
} from "lucide-react";
import patientService from "../service/patientService";

const NAVIGATION_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: Command, roles: ["all"] },
  { label: "Patient Directory", to: "/patient-list", icon: Users, roles: ["all"] },
  { label: "Appointments Queue", to: "/appointment", icon: CalendarCheck, roles: ["all"] },
  { label: "Today's Appointments", to: "/today-appoinments", icon: CalendarCheck, roles: ["doctor", "admin", "superadmin"] },
  { label: "Inpatient Admissions", to: "/admissions", icon: Bed, roles: ["doctor", "nurse", "receptionist", "admin", "superadmin"] },
  { label: "Point of Sale (POS)", to: "/pos", icon: ReceiptText, roles: ["receptionist", "pharmacist", "admin", "superadmin"] },
  { label: "POS Sales Ledger", to: "/pos/sales", icon: ReceiptText, roles: ["receptionist", "pharmacist", "accountant", "admin", "superadmin"] },
  { label: "Stock & Inventory", to: "/stock", icon: Boxes, roles: ["pharmacist", "admin", "superadmin"] },
  { label: "Prescription List", to: "/prescription", icon: ReceiptText, roles: ["pharmacist", "receptionist", "admin", "superadmin"] },
  { label: "Lab Orders Queue", to: "/lab-tech-prescriptions", icon: FlaskConical, roles: ["labtechnician", "lab", "doctor", "admin", "superadmin"] },
  { label: "Surgeries & OT", to: "/surgeries", icon: Scissors, roles: ["doctor", "admin", "superadmin"] },
  { label: "Patient Meal Plans", to: "/food/meal-plans", icon: UtensilsCrossed, roles: ["foodmanager", "admin", "superadmin"] },
  { label: "My HRMS Self-Service", to: "/my-hrms", icon: IdCardLanyard, roles: ["all"] },
  { label: "Doctor Directory", to: "/doctors", icon: Users, roles: ["admin", "superadmin", "hr"] },
  { label: "Billable Items Master", to: "/billable-items", icon: ReceiptText, roles: ["admin", "superadmin", "receptionist", "accountant"] },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [patientResults, setPatientResults] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const role = (localStorage.getItem("role") || "").toLowerCase().replace(/\s+/g, "");

  // Filter navigation items by role and query
  const filteredNav = NAVIGATION_ITEMS.filter((item) => {
    const hasRole = item.roles.includes("all") || item.roles.includes(role);
    if (!hasRole) return false;
    if (!query.trim()) return true;
    return item.label.toLowerCase().includes(query.toLowerCase());
  });

  // Debounced patient search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setPatientResults([]);
      setSearchingPatients(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingPatients(true);
      try {
        const res = await patientService.getAllPatients({ search: query, limit: 4 });
        const list = res?.data?.data?.data || res?.data?.data || [];
        setPatientResults(Array.isArray(list) ? list : []);
      } catch {
        setPatientResults([]);
      } finally {
        setSearchingPatients(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const total = filteredNav.length + patientResults.length;
        if (total > 0) setSelectedIndex((prev) => (prev + 1) % total);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const total = filteredNav.length + patientResults.length;
        if (total > 0) setSelectedIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex < filteredNav.length) {
          const item = filteredNav[selectedIndex];
          if (item) {
            navigate(item.to);
            onClose();
          }
        } else {
          const pIdx = selectedIndex - filteredNav.length;
          const patient = patientResults[pIdx];
          if (patient) {
            navigate(`/overview/${patient.id}`);
            onClose();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredNav, patientResults, navigate, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, patients, or actions... (Esc to close)"
            className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X size={16} />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
          {/* Navigation Section */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNav.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        navigate(item.to);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        isSelected ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isSelected ? "text-indigo-600" : "text-slate-400"} />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight size={14} className={isSelected ? "opacity-100 text-indigo-500" : "opacity-0"} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Patients Search Results */}
          {searchingPatients && (
            <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              Searching patients...
            </div>
          )}

          {patientResults.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Patients Found
              </div>
              <div className="space-y-0.5 mt-1">
                {patientResults.map((p, pIdx) => {
                  const itemIndex = filteredNav.length + pIdx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        navigate(`/overview/${p.id}`);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                        isSelected ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {p.first_name?.[0]?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {p.first_name} {p.last_name || ""}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            UHID: {p.uhid || "N/A"} · Phone: {p.mobile_number || "N/A"}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 font-medium">View Profile →</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && patientResults.length === 0 && !searchingPatients && (
            <div className="py-8 text-center text-sm text-slate-500">
              No matching pages or records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="font-semibold text-slate-700">↑↓</kbd> Navigate</span>
            <span><kbd className="font-semibold text-slate-700">↵</kbd> Select</span>
            <span><kbd className="font-semibold text-slate-700">esc</kbd> Dismiss</span>
          </div>
          <span className="font-medium text-slate-400">Atelier HMS Navigation</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
