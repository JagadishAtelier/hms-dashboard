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
  setOpenAddPatientModal 
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
    }, 300);
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
              className="select-none rounded-md bg-gray-900 px-[15px] py-[10px] text-[13px] leading-none text-white shadow-xl animate-in fade-in zoom-in duration-200 z-[101]"
              side="right"
              sideOffset={10}
            >
              {link.label}
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  if (link.children) {
    const flyoutContent = (
      <div 
        className="flex flex-col gap-1 p-2 min-w-[200px] bg-white rounded-xl shadow-2xl border border-gray-100 z-[101]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="px-3 py-2 mb-1 border-b border-gray-50">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{link.label}</span>
        </div>
        {link.children.map((child) => (
          <Link
            key={child.to}
            to={child.to}
            onClick={() => setIsFlyoutOpen(false)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-200 group",
              pathname === child.to
                ? "text-[#3D5EE1] font-semibold bg-[#F2F5FF]"
                : "text-gray-500 hover:text-[#3D5EE1] hover:bg-gray-50"
            )}
          >
            <child.icon size={18} className={cn("transition-transform", pathname === child.to ? "scale-110" : "group-hover:scale-110")} />
            <span>{child.label}</span>
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
              className="relative"
            >
              <button
                className={cn(
                  "flex items-center justify-center w-full aspect-square rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-[#3D5EE1] text-white shadow-lg shadow-[#3D5EE1]/20" 
                    : "text-gray-600 hover:bg-[#F2F5FF] hover:text-[#3D5EE1]"
                )}
              >
                <Icon size={22} className={cn("transition-transform group-hover:scale-110")} />
              </button>
              <Popover.Portal>
                <Popover.Content
                  side="right"
                  sideOffset={15}
                  align="start"
                  className="z-[101] animate-in slide-in-from-left-2 duration-200"
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
            onClick={() => toggleMenu(link.label)}
            className={cn(
              "flex items-center w-full rounded-xl transition-all duration-300 p-3 group cursor-pointer",
              isCollapsed ? "justify-center" : "justify-between",
              isActive 
                ? "bg-[#506EE1] hover:bg-[#3f56c2] text-white shadow-lg shadow-[#3D5EE1]/20" 
                : "text-gray-600 hover:bg-[#F2F5FF] hover:text-[#3D5EE1]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} className={cn("transition-transform", !isActive && "group-hover:scale-110")} />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.label}</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight 
                size={16} 
                className={cn("transition-transform duration-300", openMenus[link.label] && "rotate-90")} 
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
              className="overflow-hidden ml-4 space-y-1 border-l-2 border-[#3D5EE1]/10 pl-2"
            >
              {link.children.map((child) => (
                <Link
                  key={child.to}
                  to={child.to}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200",
                    pathname === child.to
                      ? "text-[#3D5EE1] font-semibold bg-[#F2F5FF]"
                      : "text-gray-500 font-medium hover:text-[#3D5EE1] hover:bg-gray-50"
                  )}
                >
                  <child.icon size={16} />
                  <span>{child.label}</span>
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
      <Link
        to={link.to}
        className={cn(
          "flex items-center w-full rounded-xl p-3 transition-all duration-300 group",
          isCollapsed ? "justify-center" : "gap-3",
          isSubActive 
            ? "bg-[#3D5EE1] text-white shadow-lg shadow-[#3D5EE1]/20" 
            : "text-gray-600 hover:bg-[#F2F5FF] hover:text-[#3D5EE1]"
        )}
        onClick={(e) => {
          if (link.label === "Lab Results") {
            e.preventDefault();
            setOpenLabModal(true);
          } else if (link.label === "Add Patient") {
            e.preventDefault();
            setOpenAddPatientModal(true);
          } else {
            onClose?.();
          }
        }}
      >
        <Icon size={20} className={cn("transition-transform", !isSubActive && "group-hover:scale-110")} />
        {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.label}</span>}
      </Link>
    </ItemWithTooltip>
  );
};

export default function Sidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const [openAddPatientModal, setOpenAddPatientModal] = useState(false);
  const [openLabModal, setOpenLabModal] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole && storedRole !== role) setRole(storedRole);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const links = useMemo(() => {
    const rolesMapping = {
      patient: [
        { to: "/patient-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/patient/appointment/list", label: "Appointments", icon: CalendarCheck },
      ],
      doctor: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/patient-list", label: "Patient List", icon: Users },
        { to: "/today-appoinments", label: "Today's Appointments", icon: CalendarCheck },
        { to: "/admissions", label: "Admissions", icon: Bed },
        { to: "/records", label: "Medical Records", icon: ClipboardList },
      ],
      labtechnician: [
        { to: "/labtech-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/labtechnician", label: "Lab Technicians", icon: FlaskConical },
        { to: "/lab-tech-prescriptions", label: "Lab Order", icon: FileText },
      ],
      superadmin: [
        { to: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
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
      pharmacist: [
        { to: "/pharma-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/product", label: "Product", icon: Tag },
        { to: "/stock", label: "Stock & Inventory", icon: Package },
        { to: "/prescription", label: "Prescriptions", icon: ClipboardCheck },
      ],
      nurse: [
        { to: "/nurse-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/appointment", label: "Appointments", icon: CalendarDays },
        { to: "/admissions", label: "Admissions", icon: Bed },
      ]
    };

    return rolesMapping[role] || [
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

  const renderContent = () => (
    <div className="flex flex-col h-full bg-white relative">
      <div className={cn(
          "flex items-center px-4 h-15 border-b border-gray-200 shadow-sm transition-all duration-300",
          isCollapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
            {!isCollapsed && (
              <h1 className="text-lg font-bold text-gray-900 truncate">
                Atelier HMS
              </h1>
            )}
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 px-4 py-2 custom-scrollbar overflow-y-auto">
        <nav className="space-y-1.5">
          {links.map((link, i) => (
            <SidebarItem 
              key={link.label || i} 
              link={link} 
              pathname={pathname}
              isCollapsed={isCollapsed}
              onClose={onClose}
              toggleMenu={toggleMenu}
              openMenus={openMenus}
              setOpenLabModal={setOpenLabModal}
              setOpenAddPatientModal={setOpenAddPatientModal}
            />
          ))}
        </nav>
      </div>

      <div className="p-4 border-t">
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center w-full p-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-200",
                  isCollapsed ? "justify-center" : "gap-3"
                )}
              >
                <LogOut size={20} />
                {!isCollapsed && <span className="font-semibold">Logout</span>}
              </button>
            </Tooltip.Trigger>
            {isCollapsed && (
              <Tooltip.Portal>
                <Tooltip.Content
                  className="rounded-md bg-rose-600 px-[15px] py-[10px] text-[13px] text-white shadow-xl animate-in fade-in zoom-in duration-200"
                  side="right"
                  sideOffset={10}
                >
                  Logout
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

  return (
    <>
      <div className="hidden lg:block h-screen sticky top-0 bg-[#FBFBFD]">
        <motion.aside
          animate={{ width: isCollapsed ? 80 : 280 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full border-r shadow-sm overflow-hidden"
        >
          {renderContent()}
        </motion.aside>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-[100] lg:hidden"
            >
              {renderContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
