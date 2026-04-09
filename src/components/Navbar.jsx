import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Search, Calendar, Menu, Bell, MessageSquare, Sun, Command,
  User, Settings, LogOut, CircleChevronRight, CircleChevronLeft, ReceiptText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopNavbar({ onMenuClick, isCollapsed, setIsCollapsed }) {
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const navigate = useNavigate();
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const showBillableItems = ["admin", "superadmin", "receptionist", "hr"].includes(role);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between bg-white px-4 h-[60px] shadow-sm border-b border-gray-200">
      {/* Left - Search + Hamburger */}
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50"
        >
          <Menu size={18} />
        </button>

        {/* Collapse toggle for desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center p-1.5 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 transition-all"
          title={isCollapsed ? "Open Side Menu" : "Close Side Menu"}
        >
           {isCollapsed ? (
          <CircleChevronRight size={24} className="text-gray-400 hover:opacity-50 hover:text-[#3F56C1] cursor-pointer" />
        ) : (
          <CircleChevronLeft size={24} className="text-gray-400 hover:opacity-50 hover:text-[#3F56C1] cursor-pointer" />
        )}
        </button>

        {/* Search */}
         <div className="relative hidden md:block">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-text-light)]" />
                    <input
                        type="text"
                        placeholder="Search patients, appointments..."
                        className="pl-10 pr-4 py-2 w-64 bg-[var(--dashboard-secondary)] border-none rounded-full text-[var(--dashboard-text)] focus:ring-2 focus:ring-[var(--dashboard-primary)]/20 focus:bg-[var(--card-bg)] transition-all outline-none"
                    />
                </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Billable Items button — Receptionist & Admin only */}
        {showBillableItems && (
          <button
            onClick={() => navigate("/billable-items")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-[#506EE4] text-[#506EE4] rounded-lg hover:bg-[#506EE4] hover:text-white transition-colors"
          >
            <ReceiptText size={15} /> Billable Items
          </button>
        )}

        

        

        {/* Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <img
              src="https://static.vecteezy.com/system/resources/thumbnails/049/174/246/small/a-smiling-young-indian-man-with-formal-shirts-outdoors-photo.jpg"
              alt="user"
              className="h-9 w-9 rounded-full border border-gray-200 object-cover cursor-pointer hover:ring-2 hover:ring-indigo-100"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2 text-gray-500" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2 text-red-500" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
