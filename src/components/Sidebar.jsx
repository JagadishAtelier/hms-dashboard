import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import logo from "/favicon.png";
import LabResultModal from "./Context/LabResultModal";
import {
  Users,
  LayoutDashboard,
  Bed,
  Building,
  IdCardLanyard,
  ChevronRight,
  LogOut,
  X,
  Stethoscope,
  Contact,
  FlaskConical,
  Thermometer,
  Pill,
  Network,
  Briefcase,
  DoorOpen,
  HousePlus,
  BedDouble,
  TestTubeDiagonal,
  Boxes,
  Package,
  Layers,
  GitBranch,
  Tag,
  Truck,
  ShoppingCart,
  FileUp,
  CalendarDays,
  CalendarCheck,
  FileText,
  ClipboardList,
  ClipboardCheck,
  Scissors,
  UtensilsCrossed,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import AddPatientModal from "./Context/AddPatientModal";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Popover from "@radix-ui/react-popover";

// SidebarItem defined outside to ensure it doesn't unmount on parent re-render
const SidebarItem = ({ 
  link, 
  pathname, 
  isCollapsed, 
  onClose, 
  toggleMenu, 
  openMenus, 
  setOpenLabModal, 
  setOpenAddPatientModal,
  onNavigate
}) => {
  const Icon = link.icon;
  const isActive = pathname === link.to || (link.children && link.children.some(c => pathname === c.to));
  const isSubActive = pathname === link.to;
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsFlyoutOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsFlyoutOpen(false);
    }, 250);
  };

  const handleItemClick = () => {
    onClose?.();
    onNavigate?.();
  };

  const ItemWithTooltip = ({ children }) => (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        {isCollapsed && !link.children && (
          <Tooltip.Portal>
            <Tooltip.Content
              className="select-none rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold leading-none text-white shadow-xl animate-in fade-in zoom-in-95 duration-150 z-[101]"
              side="right"
              sideOffset={12}
            >
              {link.label}
              <Tooltip.Arrow className="fill-slate-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  if (link.children) {
    const flyoutContent = (
      <div 
        className="flex flex-col gap-1 p-2 min-w-[210px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[101]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="px-3 py-2 mb-1 border-b border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{link.label}</span>
        </div>
        {link.children.map((child) => (
          <Link
            key={child.to}
            to={child.to}
            onClick={() => {
              setIsFlyoutOpen(false);
              handleItemClick();
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group",
              pathname === child.to
                ? "text-indigo-600 bg-indigo-50 font-bold"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            )}
          >
            <child.icon size={16} className={cn("transition-transform shrink-0", pathname === child.to ? "scale-110" : "group-hover:scale-110")} />
            <span className="truncate">{child.label}</span>
          </Link>
        ))}
      </div>
    );

    if (isCollapsed) {
      return (
        <Popover.Root open={isFlyoutOpen}>
          <Popover.Trigger asChild>
            <div 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative flex justify-center py-0.5"
            >
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 group cursor-pointer active:scale-95",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                aria-label={link.label}
              >
                <Icon size={20} className="transition-transform group-hover:scale-110" />
              </button>
              <Popover.Portal>
                <Popover.Content
                  side="right"
                  sideOffset={14}
                  align="start"
                  className="z-[101] animate-in slide-in-from-left-2 duration-150"
                >
                  {flyoutContent}
                </Popover.Content>
              </Popover.Portal>
            </div>
          </Popover.Trigger>
        </Popover.Root>
      );
    }

    return (
      <div className="space-y-1">
        <ItemWithTooltip>
          <button
            type="button"
            onClick={() => toggleMenu(link.label)}
            className={cn(
              "flex items-center w-full rounded-xl transition-all duration-200 p-2.5 min-h-[44px] group cursor-pointer text-sm font-semibold select-none",
              isCollapsed ? "justify-center" : "justify-between",
              isActive 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon size={19} className={cn("transition-transform shrink-0", !isActive && "group-hover:scale-110")} />
              {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight 
                size={16} 
                className={cn("transition-transform duration-200 shrink-0", openMenus[link.label] && "rotate-90")} 
              />
            )}
          </button>
        </ItemWithTooltip>

        <AnimatePresence initial={false}>
          {openMenus[link.label] && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden ml-3.5 space-y-0.5 border-l-2 border-slate-200 pl-2.5"
            >
              {link.children.map((child) => (
                <Link
                  key={child.to}
                  to={child.to}
                  onClick={handleItemClick}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-lg text-xs transition-all duration-200 min-h-[38px]",
                    pathname === child.to
                      ? "text-indigo-600 font-bold bg-indigo-50"
                      : "text-slate-600 font-medium hover:text-indigo-600 hover:bg-slate-50"
                  )}
                >
                  <child.icon size={15} className="shrink-0" />
                  <span className="truncate">{child.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <ItemWithTooltip>
      {isCollapsed ? (
        <div className="flex justify-center py-0.5">
          <Link
            to={link.to}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 group active:scale-95",
              isSubActive 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
            onClick={(e) => {
              if (link.label === "Lab Results") {
                e.preventDefault();
                setOpenLabModal(true);
              } else if (link.label === "Add Patient") {
                e.preventDefault();
                setOpenAddPatientModal(true);
              } else {
                handleItemClick();
              }
            }}
            aria-label={link.label}
          >
            <Icon size={20} className="transition-transform group-hover:scale-110" />
          </Link>
        </div>
      ) : (
        <Link
          to={link.to}
          className={cn(
            "flex items-center w-full rounded-xl p-2.5 min-h-[44px] transition-all duration-200 group text-sm font-semibold select-none gap-3",
            isSubActive 
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          )}
          onClick={(e) => {
            if (link.label === "Lab Results") {
              e.preventDefault();
              setOpenLabModal(true);
            } else if (link.label === "Add Patient") {
              e.preventDefault();
              setOpenAddPatientModal(true);
            } else {
              handleItemClick();
            }
          }}
        >
          <Icon size={19} className={cn("transition-transform shrink-0", !isSubActive && "group-hover:scale-110")} />
          <span className="whitespace-nowrap truncate">{link.label}</span>
        </Link>
      )}
    </ItemWithTooltip>
  );
};

export default function Sidebar({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  setIsCollapsed,
  isMobile = false,
  isTablet = false,
  isDesktop = true,
  onNavigate
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const [openAddPatientModal, setOpenAddPatientModal] = useState(false);
  const [openLabModal, setOpenLabModal] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole !== role) setRole(storedRole || "");
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    onClose?.();
    navigate("/login");
  };

  const [openMenus, setOpenMenus] = useState({});

  const links = useMemo(() => {
    const currentRole = role || localStorage.getItem("role") || "";
    const rolesMapping = {
      patient: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/patient/appointment/list", label: "Appointments", icon: CalendarCheck },
      ],
      doctor: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/patient-list", label: "Patient List", icon: Users },
        { to: "/today-appoinments", label: "Today's Appointments", icon: CalendarCheck },
        { to: "/admissions", label: "Admissions", icon: Bed },
        { to: "/records", label: "Medical Records", icon: ClipboardList },
        { to: "/session-plans", label: "Session Plans", icon: CalendarDays },
        { to: "/my-hrms", label: "My HRMS", icon: IdCardLanyard },
      ],
      labtechnician: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/labtechnician", label: "Lab Technicians", icon: FlaskConical },
        { to: "/lab-tech-prescriptions", label: "Lab Orders", icon: FileText },
        { to: "/my-hrms", label: "My HRMS", icon: IdCardLanyard },
      ],
      receptionist: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/appointment", label: "Appointments", icon: CalendarDays },
        { to: "/admissions", label: "Admissions", icon: Bed },
        { to: "/patient-list", label: "Patients", icon: Users },
        { to: "/prescription", label: "Prescriptions", icon: ClipboardCheck },
        { to: "/pos", label: "New Sale (POS)", icon: ReceiptText },
        { to: "/pos/sales", label: "POS Sales", icon: ClipboardList },
        { to: "/billable-items", label: "Billable Items", icon: ReceiptText },
        { to: "/session-plans", label: "Session Plans", icon: CalendarCheck },
        { to: "/session-plans/due-tomorrow", label: "Due Tomorrow", icon: CalendarDays },
        { to: "/my-hrms", label: "My HRMS", icon: IdCardLanyard },
      ],
      superadmin: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/analytics", label: "Analytics Hub", icon: TrendingUp },
        { 
            label: "Staff Management", 
            icon: IdCardLanyard,
            children: [
                { to: "/doctors", label: "Doctors", icon: Stethoscope },
                { to: "/receptionist", label: "Receptionist", icon: Contact },
                { to: "/labtechnician", label: "Lab Technician", icon: FlaskConical },
                { to: "/nurses", label: "Nurses", icon: Thermometer },
                { to: "/pharmacists", label: "Pharmacists", icon: Pill },
                { to: "/accountant", label: "Accountant", icon: Users },
                { to: "/food-managers", label: "Food Managers", icon: UtensilsCrossed },
                { to: "/hr", label: "HR", icon: IdCardLanyard },
            ]
        },
        { to: "/patient-list", label: "Patient List", icon: Users },
        { to: "/appointment", label: "Appointments", icon: CalendarDays },
        { to: "/admissions", label: "Admissions", icon: Bed },
        { to: "/department", label: "Departments", icon: Network },
        { to: "/designation", label: "Designations", icon: Briefcase },
        { to: "/ward", label: "Ward", icon: DoorOpen },
        { to: "/room", label: "Room", icon: HousePlus },
        { to: "/bed", label: "Bed", icon: BedDouble },
        { to: "/labtest", label: "Lab Tests", icon: TestTubeDiagonal },
        { to: "/billable-items", label: "Billable Items", icon: ReceiptText },
        { to: "/pos", label: "New Sale (POS)", icon: ReceiptText },
        { to: "/pos/sales", label: "POS Sales", icon: ClipboardList },
        {
          label: "Food Management",
          icon: UtensilsCrossed,
          children: [
            { to: "/food/diet-types", label: "Diet Types", icon: UtensilsCrossed },
            { to: "/food/meal-plans", label: "Meal Plans", icon: ClipboardList },
            { to: "/food-dashboard", label: "Food Dashboard", icon: LayoutDashboard },
          ],
        },
        {
          label: "Surgeries",
          icon: Scissors,
          children: [
            { to: "/surgeries", label: "Surgeries", icon: Scissors },
            { to: "/procedures", label: "Procedures", icon: ClipboardList },
          ],
        },
        {
          label: "Inventory / Store",
          icon: Boxes,
          children: [
            { to: "/stock", label: "Stock & Inventory", icon: Package },
            { to: "/category", label: "Category", icon: Layers },
            { to: "/subcategory", label: "Subcategory", icon: GitBranch },
            { to: "/product", label: "Product", icon: Tag },
            { to: "/vendor", label: "Vendor", icon: Truck },
            { to: "/order", label: "Order", icon: ShoppingCart },
            { to: "/inward", label: "Inward", icon: FileUp },
          ],
        },
      ],
      admin: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/analytics", label: "Analytics Hub", icon: TrendingUp },
        { 
            label: "Staff Management", 
            icon: IdCardLanyard,
            children: [
                { to: "/doctors", label: "Doctors", icon: Stethoscope },
                { to: "/receptionist", label: "Receptionist", icon: Contact },
                { to: "/labtechnician", label: "Lab Technician", icon: FlaskConical },
                { to: "/nurses", label: "Nurses", icon: Thermometer },
                { to: "/pharmacists", label: "Pharmacists", icon: Pill },
                { to: "/food-managers", label: "Food Managers", icon: UtensilsCrossed },
            ]
        },
        { to: "/patient-list", label: "Patient List", icon: Users },
        { to: "/appointment", label: "Appointments", icon: CalendarDays },
        { to: "/admissions", label: "Admissions", icon: Bed },
        { to: "/billable-items", label: "Billable Items", icon: ReceiptText },
        { to: "/pos", label: "New Sale (POS)", icon: ReceiptText },
        { to: "/pos/sales", label: "POS Sales", icon: ClipboardList },
        {
          label: "Food Management",
          icon: UtensilsCrossed,
          children: [
            { to: "/food/diet-types", label: "Diet Types", icon: UtensilsCrossed },
            { to: "/food/meal-plans", label: "Meal Plans", icon: ClipboardList },
            { to: "/food-dashboard", label: "Food Dashboard", icon: LayoutDashboard },
          ],
        },
      ],
      pharmacist: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/product", label: "Product", icon: Tag },
        { to: "/stock", label: "Stock & Inventory", icon: Package },
        { to: "/prescription", label: "Prescriptions", icon: ClipboardCheck },
        { to: "/pos", label: "New Sale (POS)", icon: ReceiptText },
        { to: "/pos/sales", label: "POS Sales", icon: ClipboardList },
        { to: "/my-hrms", label: "My HRMS", icon: IdCardLanyard },
      ],
      nurse: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/appointment", label: "Appointments", icon: CalendarDays },
        { to: "/admissions", label: "Admissions", icon: Bed },
        { to: "/my-hrms", label: "My HRMS", icon: IdCardLanyard },
      ],
      foodmanager: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/food/meal-plans", label: "Meal Plans", icon: UtensilsCrossed },
        { to: "/food/diet-types", label: "Diet Types", icon: ClipboardList },
        { to: "/my-hrms", label: "My HRMS", icon: IdCardLanyard },
      ],
      accountant: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/analytics", label: "Analytics Hub", icon: TrendingUp },
        { to: "/billing", label: "Billing", icon: ReceiptText },
        { to: "/admissions", label: "Admissions", icon: Bed },
        { to: "/appointment", label: "Appointments", icon: CalendarDays },
        { to: "/patient-list", label: "Patients", icon: Users },
        { to: "/my-hrms", label: "My HRMS", icon: IdCardLanyard },
      ],
      hr: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        {
          label: "Staff Management",
          icon: IdCardLanyard,
          children: [
            { to: "/doctors", label: "Doctors", icon: Stethoscope },
            { to: "/receptionist", label: "Receptionist", icon: Contact },
            { to: "/labtechnician", label: "Lab Technician", icon: FlaskConical },
            { to: "/nurses", label: "Nurses", icon: Thermometer },
            { to: "/pharmacists", label: "Pharmacists", icon: Pill },
            { to: "/accountant", label: "Accountants", icon: Users },
            { to: "/food-managers", label: "Food Managers", icon: UtensilsCrossed },
          ],
        },
        { to: "/department", label: "Departments", icon: Network },
        { to: "/designation", label: "Designations", icon: Briefcase },
        { to: "/hrms/attendance", label: "Attendance", icon: CalendarCheck },
        { to: "/hrms/leave", label: "Leave Applications", icon: ClipboardList },
        { to: "/hrms/leave-config", label: "Leave Config", icon: ClipboardCheck },
        { to: "/hrms/salary-config", label: "Salary Config", icon: ReceiptText },
        { to: "/hrms/salary-slips", label: "Salary Slips", icon: FileText },
        { to: "/hrms/documents", label: "Staff Documents", icon: ClipboardList },
      ],
    };

    return rolesMapping[currentRole] || rolesMapping[currentRole?.toLowerCase().replace(/\s+/g, '')] || [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/appointment", label: "Appointments", icon: CalendarDays },
      { to: "/patient-list", label: "Patient List", icon: Users },
      { to: "/admissions", label: "Admissions", icon: Bed },
    ];
  }, [role]);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderContent = (forceExpanded = false) => {
    const effectiveCollapsed = forceExpanded ? false : isCollapsed;

    return (
      <div className="flex flex-col h-full bg-white relative select-none">
        {/* Sidebar Brand Header */}
        <div className={cn(
          "flex items-center px-4 h-[60px] border-b border-slate-200/80 transition-all duration-300 shrink-0",
          effectiveCollapsed ? "justify-center" : "justify-between"
        )}>
          <Link 
            to="/dashboard" 
            onClick={() => { onClose?.(); onNavigate?.(); }}
            className="flex items-center gap-2.5 active:scale-95 transition-transform"
          >
            <img src={logo} alt="Atelier HMS" className="w-8 h-8 object-contain rounded-xl shadow-2xs" />
            {!effectiveCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                  Atelier HMS
                </h1>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {role ? role.toUpperCase() : "HOSPITAL"}
                </span>
              </div>
            )}
          </Link>

          {!effectiveCollapsed && (
            <button 
              onClick={onClose} 
              aria-label="Close navigation"
              className="md:hidden min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 px-2.5 py-3 custom-scrollbar overflow-y-auto">
          <nav className="space-y-1">
            {links.map((link, i) => (
              <SidebarItem 
                key={link.label || i} 
                link={link} 
                pathname={pathname}
                isCollapsed={effectiveCollapsed}
                onClose={onClose}
                onNavigate={onNavigate}
                toggleMenu={toggleMenu}
                openMenus={openMenus}
                setOpenLabModal={setOpenLabModal}
                setOpenAddPatientModal={setOpenAddPatientModal}
              />
            ))}
          </nav>
        </div>

        {/* Sign Out Action at Bottom */}
        <div className="p-2.5 border-t border-slate-200/80 shrink-0 pb-safe">
          <Tooltip.Provider delayDuration={0}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center w-full p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-all duration-200 text-xs min-h-[44px] active:scale-95 cursor-pointer",
                    effectiveCollapsed ? "justify-center" : "gap-2.5"
                  )}
                  aria-label="Sign Out"
                >
                  <LogOut size={18} className="shrink-0" />
                  {!effectiveCollapsed && <span>Sign Out</span>}
                </button>
              </Tooltip.Trigger>
              {effectiveCollapsed && (
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl z-[101]"
                    side="right"
                    sideOffset={12}
                  >
                    Sign Out
                  </Tooltip.Content>
                </Tooltip.Portal>
              )}
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        <LabResultModal open={openLabModal} setOpen={setOpenLabModal} />
        <AddPatientModal open={openAddPatientModal} setOpen={setOpenAddPatientModal} />
      </div>
    );
  };

  const desktopWidth = isTablet ? 68 : isCollapsed ? 80 : 260;

  return (
    <>
      {/* Desktop (≥1024px) & Tablet (768px-1024px) Sticky Navigation Rail */}
      <div className="hidden md:block h-screen sticky top-0 bg-white shrink-0 z-30">
        <motion.aside
          animate={{ width: desktopWidth }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="h-full border-r border-slate-200/80 shadow-2xs overflow-hidden"
        >
          {renderContent(false)}
        </motion.aside>
      </div>

      {/* Mobile (<768px) Smooth Slide-Over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[90] md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-[100] md:hidden rounded-r-2xl overflow-hidden"
            >
              {renderContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

