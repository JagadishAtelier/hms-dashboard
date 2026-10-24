import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ShoppingCart,
  Menu,
  Stethoscope,
  BedDouble,
  Pill,
  ClipboardList,
  Sparkles,
  ReceiptText,
} from "lucide-react";

/**
 * MobileBottomNav - Google Material Design 3 Bottom Navigation Dock
 * Provides instant 1-thumb touch navigation between primary operational tasks on mobile devices (<768px).
 * Exactly modeled after the Atelier General POS mobile navigation dock.
 */
export default function MobileBottomNav({ onOpenMenu }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve active role
  const role = useMemo(() => {
    return (localStorage.getItem("role") || "").toLowerCase().replace(/\s+/g, "");
  }, []);

  // Role-tailored navigation items
  const navItems = useMemo(() => {
    // 1️⃣ DOCTOR DOCK
    if (role === "doctor") {
      return [
        {
          key: "dashboard",
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          key: "today-opd",
          label: "Today OPD",
          path: "/today-appoinments",
          icon: Stethoscope,
          isPrimaryAction: false,
        },
        {
          key: "patients",
          label: "Patients",
          path: "/patient-list",
          icon: Users,
        },
        {
          key: "rx",
          label: "Prescriptions",
          path: "/prescription-list",
          icon: Pill,
        },
        {
          key: "more",
          label: "More",
          action: onOpenMenu,
          icon: Menu,
        },
      ];
    }

    // 2️⃣ RECEPTIONIST DOCK
    if (role === "receptionist") {
      return [
        {
          key: "dashboard",
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          key: "appointments",
          label: "Appointments",
          path: "/appointment",
          icon: CalendarDays,
        },
        {
          key: "admissions",
          label: "Admissions",
          path: "/admissions",
          icon: BedDouble,
        },
        {
          key: "pos",
          label: "POS Bill",
          path: "/pos",
          icon: ShoppingCart,
          isPrimaryAction: false,
        },
        {
          key: "more",
          label: "More",
          action: onOpenMenu,
          icon: Menu,
        },
      ];
    }

    // 3️⃣ NURSE DOCK
    if (role === "nurse") {
      return [
        {
          key: "dashboard",
          label: "Dashboard",
          path: "/nurse-dashboard",
          icon: LayoutDashboard,
        },
        {
          key: "beds",
          label: "Wards & Beds",
          path: "/room-allocation",
          icon: BedDouble,
          isPrimaryAction: false,
        },
        {
          key: "patients",
          label: "Patients",
          path: "/patient-list",
          icon: Users,
        },
        {
          key: "sessions",
          label: "Sessions",
          path: "/session-plans",
          icon: ClipboardList,
        },
        {
          key: "more",
          label: "More",
          action: onOpenMenu,
          icon: Menu,
        },
      ];
    }

    // 4️⃣ PHARMACIST DOCK
    if (role === "pharmacist") {
      return [
        {
          key: "dashboard",
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          key: "orders",
          label: "Rx Queue",
          path: "/pharma-prescriptions",
          icon: Pill,
          isPrimaryAction: false,
        },
        {
          key: "stock",
          label: "Medicines",
          path: "/stock",
          icon: ClipboardList,
        },
        {
          key: "pos",
          label: "POS Sale",
          path: "/pos",
          icon: ShoppingCart,
        },
        {
          key: "more",
          label: "More",
          action: onOpenMenu,
          icon: Menu,
        },
      ];
    }

    // 5️⃣ PATIENT DOCK
    if (role === "patient") {
      return [
        {
          key: "dashboard",
          label: "Home",
          path: "/patient-dashboard",
          icon: LayoutDashboard,
        },
        {
          key: "book",
          label: "Book Visit",
          path: "/patient/appointment/create",
          icon: CalendarDays,
          isPrimaryAction: false,
        },
        {
          key: "my-visits",
          label: "My Visits",
          path: "/patient/appointment/list",
          icon: ClipboardList,
        },
        {
          key: "more",
          label: "More",
          action: onOpenMenu,
          icon: Menu,
        },
      ];
    }

    // 6️⃣ DEFAULT / ADMIN / SUPER ADMIN / ACCOUNTANT / HR DOCK
    return [
      {
        key: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        key: "appointments",
        label: "Appts",
        path: "/appointment",
        icon: CalendarDays,
      },
      {
        key: "pos",
        label: "POS Billing",
        path: "/pos",
        icon: ShoppingCart,
        isPrimaryAction: false,
      },
      {
        key: "patients",
        label: "Patients",
        path: "/patient-list",
        icon: Users,
      },
      {
        key: "more",
        label: "More",
        action: onOpenMenu,
        icon: Menu,
      },
    ];
  }, [role, onOpenMenu]);

  const isCurrentActive = (item) => {
    if (item.path) {
      if (item.path === "/dashboard" || item.path === "/nurse-dashboard" || item.path === "/patient-dashboard") {
        return location.pathname === item.path;
      }
      return location.pathname.startsWith(item.path);
    }
    return false;
  };

  const gridColsClass =
    navItems.length === 4 ? "grid-cols-4" : navItems.length === 3 ? "grid-cols-3" : "grid-cols-5";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className={`grid ${gridColsClass} items-center w-full max-w-lg mx-auto`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrentActive(item);

          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              className="relative flex flex-col items-center justify-center py-1 px-0.5 w-full min-h-[48px] rounded-xl transition-all duration-200 active:scale-90 group cursor-pointer select-none"
            >
              {/* M3 Active Tonal Pill Behind Icon */}
              <div
                className={`flex items-center justify-center transition-all duration-200 ${
                  item.isPrimaryAction
                    ? active
                      ? "w-12 h-7.5 rounded-full bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                      : "w-11 h-7 rounded-full bg-indigo-100 text-indigo-700 shadow-xs group-hover:bg-indigo-200"
                    : active
                    ? "w-11 h-7 rounded-full bg-indigo-100/90 text-indigo-700 shadow-xs"
                    : "w-11 h-7 rounded-full bg-transparent text-slate-600 group-hover:bg-slate-100/60 group-hover:text-slate-900"
                }`}
              >
                <Icon
                  size={item.isPrimaryAction ? 18 : 19}
                  strokeWidth={active ? 2.5 : 2}
                  className={`transition-colors duration-200 ${
                    item.isPrimaryAction
                      ? active
                        ? "text-white"
                        : "text-indigo-700"
                      : active
                      ? "text-indigo-600"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-none transition-all duration-200 truncate max-w-full px-0.5 text-center ${
                  active
                    ? "font-black text-indigo-700"
                    : item.isPrimaryAction
                    ? "font-bold text-indigo-800"
                    : "font-semibold text-slate-500 group-hover:text-slate-800"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
