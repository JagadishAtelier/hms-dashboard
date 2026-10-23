import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
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

export default function TopNavbar({ onMenuClick, isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  
  const role = (localStorage.getItem("role") || "").toLowerCase().replace(/\s+/g, "");
  const username = localStorage.getItem("username") || "User";
  const userInitial = username.charAt(0).toUpperCase() || "U";
  
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

  return (
    <>
      <header className="flex items-center justify-between bg-white px-4 h-[60px] border-b border-slate-200">
        {/* Left: Mobile hamburger + Collapse toggle + Global Search */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden flex items-center justify-center p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Desktop sidebar collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-all"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <CircleChevronRight size={20} className="text-slate-400 hover:text-indigo-600 cursor-pointer" />
            ) : (
              <CircleChevronLeft size={20} className="text-slate-400 hover:text-indigo-600 cursor-pointer" />
            )}
          </button>

          {/* Functional Global Search / Command Bar */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center gap-3 px-3.5 py-1.5 w-64 lg:w-80 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition-all group"
            title="Search patients, pages, or commands (Ctrl+K)"
          >
            <Search size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="flex-1 text-xs text-slate-500 font-medium">Search patients, appointments...</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              <CommandIcon size={10} />K
            </span>
          </button>
        </div>

        {/* Right Section: Actions & User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Billable Items Quick Action */}
          {showBillableItems && (
            <button
              onClick={() => navigate("/billable-items")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <ReceiptText size={14} /> Billable Items
            </button>
          )}

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-2.5 p-1 pr-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all outline-none"
                aria-label="User account options"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {userInitial}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                    {username}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 capitalize leading-tight mt-0.5">
                    {role || "Staff"}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border border-slate-200 rounded-xl">
              <DropdownMenuLabel className="px-2.5 py-2">
                <div className="text-xs font-bold text-slate-800 truncate">{username}</div>
                <div className="text-[10px] text-slate-400 font-medium capitalize flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Role: {role || "Staff"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              <DropdownMenuItem
                onClick={() => navigate("/my-hrms")}
                className="flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
              >
                <User size={14} /> My Profile & HRMS
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsCommandOpen(true)}
                className="flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
              >
                <CommandIcon size={14} /> Command Palette (Ctrl+K)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer font-medium"
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
