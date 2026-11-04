import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "/favicon.png";
import {
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  ReceiptText,
  Command as CommandIcon,
  ShieldCheck,
  Bell,
  ShoppingCart,
  CalendarCheck,
  Bed,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FlaskConical,
  Pill,
  CheckCheck,
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
import PanicAlertBanner from "./shared/PanicAlertBanner";
import notificationService from "../service/notificationService";
import websocketService from "../service/websocketService";

function formatRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

function getCategoryIconConfig(category, severity) {
  if (severity === "CRITICAL" || category === "PANIC_ALERT") {
    return { icon: AlertTriangle, color: "text-rose-600 bg-rose-50 border border-rose-200" };
  }
  switch (category) {
    case "ADMISSION":
      return { icon: Bed, color: "text-blue-600 bg-blue-50 border border-blue-100" };
    case "APPOINTMENT":
      return { icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50 border border-emerald-100" };
    case "LAB_RESULT":
      return { icon: FlaskConical, color: "text-indigo-600 bg-indigo-50 border border-indigo-100" };
    case "PHARMACY":
      return { icon: Pill, color: "text-amber-600 bg-amber-50 border border-amber-100" };
    case "BED_READY":
      return { icon: CheckCircle2, color: "text-teal-600 bg-teal-50 border border-teal-100" };
    default:
      return { icon: Bell, color: "text-slate-600 bg-slate-50 border border-slate-200" };
  }
}

export default function TopNavbar({ onMenuClick, isCollapsed, setIsCollapsed, isMobile, isTablet }) {
  const navigate = useNavigate();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
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

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const res = await notificationService.getNotifications({ role, limit: 15 });
      if (res && res.data && Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount(typeof res.unread_count === "number" ? res.unread_count : 0);
      }
    } catch (err) {
      console.warn("Failed to fetch hospital notifications");
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [role]);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to live real-time notifications via WebSocket
    const unsubscribe = websocketService.subscribe((event) => {
      if (event.type === "HOSPITAL_NOTIFICATION_RECEIVED" && event.data) {
        const newNotif = event.data;
        setNotifications((prev) => {
          const exists = prev.some((n) => n.id === newNotif.id);
          if (exists) return prev;
          return [newNotif, ...prev.slice(0, 19)];
        });
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchNotifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notif.link_url) {
      navigate(notif.link_url);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead({ role });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Failed to mark all notifications read");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <PanicAlertBanner />
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
          {/* POS Terminal Shortcut Pill */}
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

          {/* Real-Time Hospital Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-600 active:scale-95 transition-all cursor-pointer"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-84 sm:w-96 p-2 shadow-2xl border border-slate-200 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Hospital Activity</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.2 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {notifications.some((n) => !n.is_read) && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="py-1 max-h-[360px] overflow-y-auto space-y-1">
                {isLoadingNotifications && notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading activity feed...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <CheckCircle2 size={24} className="mx-auto mb-1.5 text-slate-300" />
                    All caught up. No recent activity.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const { icon: CategoryIcon, color: iconStyle } = getCategoryIconConfig(n.category, n.severity);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer relative",
                          !n.is_read ? "bg-indigo-50/40 hover:bg-indigo-50/70" : "hover:bg-slate-50"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", iconStyle)}>
                          <CategoryIcon size={15} />
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-xs font-semibold text-slate-900 leading-snug">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              <button 
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full text-center py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
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
