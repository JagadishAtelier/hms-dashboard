import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "/favicon.png";
import {
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  CircleChevronRight,
  CircleChevronLeft,
  ReceiptText,
  Command as CommandIcon,
  ShieldCheck,
  Bell,
  ShoppingCart,
  CalendarCheck,
  Bed,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommandPalette from "./CommandPalette";

export default function TopNavbar({ onMenuClick, isCollapsed, setIsCollapsed, isMobile, isTablet }) {
  const navigate = useNavigate();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  
  const role = (localStorage.getItem("role") || "").toLowerCase().replace(/\s+/g, "");
  const username = localStorage.getItem("username") || "User";
  const userInitial = username.charAt(0).toUpperCase() || "U";
  
  const showPOS = ["admin", "superadmin", "receptionist", "pharmacist"].includes(role);
  const showBillableItems = ["admin", "superadmin", "receptionist", "hr", "pharmacist", "accountant"].includes(role);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Sample recent activity notifications
  const recentNotifications = [
    { id: 1, title: "New Inpatient Admission", desc: "Ward A · Bed 102", time: "10m ago", icon: Bed, color: "text-blue-600 bg-blue-50" },
    { id: 2, title: "Doctor Appointment Booked", desc: "Dr. Smith · Room 4", time: "25m ago", icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50" },
    { id: 3, title: "Lab Results Ready", desc: "Blood Profile #LP-891", time: "1h ago", icon: CheckCircle2, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <>
      <header className="flex items-center justify-between bg-white px-3 sm:px-6 h-[54px] sm:h-[64px] border-b border-slate-200/80 transition-all select-none">
        {/* Left Section: Mobile Brand + Hamburger / Desktop Collapse Toggle + Search */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-100/80 text-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Brand Title */}
          <div className="flex md:hidden items-center gap-2">
            <img src={logo} alt="Atelier HMS" className="w-7 h-7 object-contain rounded-lg" />
            <span className="text-sm font-black text-slate-900 tracking-tight">Atelier HMS</span>
          </div>

          {/* Tablet / Desktop sidebar collapse toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex min-w-[36px] min-h-[36px] items-center justify-center border border-slate-200/90 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <CircleChevronRight size={18} className="text-slate-500 hover:text-indigo-600" />
            ) : (
              <CircleChevronLeft size={18} className="text-slate-500 hover:text-indigo-600" />
            )}
          </button>

          {/* Global Search / Command Bar (Google M3 Pill) */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 w-72 lg:w-96 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 rounded-xl text-left transition-all group active:scale-[0.99] cursor-pointer"
            title="Search patients, wards, appointments, bills, staff... (Ctrl+K)"
          >
            <Search size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
            <span className="flex-1 text-xs text-slate-500 font-medium truncate">Search patients, wards, appointments, bills, staff...</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              <CommandIcon size={10} />K
            </span>
          </button>
        </div>

        {/* Right Section: POS Pill + Billable Items + Notifications + User Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* POS Terminal Shortcut Pill (Matching general-pos) */}
          {showPOS && (
            <button
              type="button"
              onClick={() => navigate("/pos")}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold shadow-xs hover:shadow-md hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
              title="Open Hospital POS Terminal"
            >
              <ShoppingCart size={14} className="shrink-0" />
              <span>POS</span>
            </button>
          )}

          {/* Billable Items Quick Action */}
          {showBillableItems && (
            <button
              type="button"
              onClick={() => navigate("/billable-items")}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <ReceiptText size={14} className="text-indigo-600" />
              <span>Billable Items</span>
            </button>
          )}

          {/* Hospital Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-600 active:scale-95 transition-all cursor-pointer"
                aria-label="View notifications"
              >
                <Bell size={18} />
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  3
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 shadow-2xl border border-slate-200 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Hospital Activity</span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="py-1 space-y-1">
                {recentNotifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", n.color)}>
                      <n.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">{n.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{n.desc}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              <button 
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full text-center py-1.5 text-xs font-bold text-indigo-600 hover:underline"
              >
                View Hospital Dashboard
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button"
                className="flex items-center gap-2 p-1 pr-2 sm:pr-2.5 rounded-xl hover:bg-slate-100/70 border border-transparent hover:border-slate-200 transition-all outline-none cursor-pointer active:scale-95"
                aria-label="User account options"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {userInitial}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                    {username}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-600 capitalize leading-tight mt-1 truncate">
                    {role || "Staff"}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-2xl border border-slate-200 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
              <DropdownMenuLabel className="px-3 py-2.5">
                <div className="text-xs font-bold text-slate-800 truncate">{username}</div>
                <div className="text-[11px] text-slate-500 font-semibold capitalize flex items-center gap-1.5 mt-1">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  Role: <span className="text-indigo-600 font-bold">{role || "Staff"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              <DropdownMenuItem
                onClick={() => navigate("/my-hrms")}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer"
              >
                <User size={14} /> My Profile & HRMS
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsCommandOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer"
              >
                <CommandIcon size={14} /> Command Palette (Ctrl+K)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                <LogOut size={14} /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}

