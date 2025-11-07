import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import logo from "../assets/logo.png";
import LabResultModal from "./Context/LabResultModal";
import {
  Users,
  Settings,
  CalendarDays,
  LayoutDashboard,
  Bed,
  Building,
  IdCardLanyard,
  SquareUser,
  HousePlus,
  DoorOpen,
  TestTubeDiagonal,
  ToolCase,
  AlignEndVertical,
  ShoppingBasket,
  Tractor,
  ShoppingCart,
  FileInput,
  Package,
  ClipboardCheck,
  X,
} from "lucide-react";
import { useSidebar } from "./Context/SidebarContext";
import { useEffect, useState } from "react";
import AddPatientModal from "./Context/AddPatientModal";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openLabModal, setOpenLabModal] = useState(false);
  const { pathname } = useLocation();
  const { activeLink, setActiveLink } = useSidebar();

  const [role, setRole] = useState(localStorage.getItem("role") || "");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token || !storedRole) {
      if (pathname !== "/login") navigate("/login");
      return;
    }

    setRole(storedRole);
  }, [navigate, pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Sidebar links by role
  const defaultLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/appointment", label: "Appointments", icon: CalendarDays },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/admissions", label: "Admissions", icon: Bed },
  ];

  const doctorSidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/today-appoinments", label: "Today's Appointments", icon: CalendarDays },
    { to: "/admissions", label: "Admissions", icon: Bed },
  ];

  const labtechSidebarLinks = [
    { to: "/labtech-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/lab-tech-prescriptions", label: "Lab Order", icon: Users },
  ];

  const superadminSidebarLinks = [
    { to: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctors", label: "Doctors", icon: SquareUser },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/appointment", label: "Appointments", icon: CalendarDays },
    { to: "/admissions", label: "Admissions", icon: Bed },
    { to: "/department", label: "Departments", icon: Building },
    { to: "/designation", label: "Designations", icon: IdCardLanyard },
    { to: "/ward", label: "Ward", icon: DoorOpen },
    { to: "/room", label: "Room", icon: HousePlus },
    { to: "/bed", label: "Bed", icon: Bed },
    { to: "/labtest", label: "Lab Tests", icon: TestTubeDiagonal },
    { to: "/category", label: "Category", icon: ToolCase },
    { to: "/subcategory", label: "Subcategory", icon: AlignEndVertical },
    { to: "/product", label: "Product", icon: ShoppingBasket },
    { to: "/vendor", label: "Vendor", icon: Tractor },
    { to: "/order", label: "Order", icon: ShoppingCart },
    { to: "/inward", label: "Inward", icon: FileInput },
  ];

  const pharmacistSidebarLinks = [
    { to: "/pharma-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/category", label: "Category", icon: ToolCase },
    { to: "/subcategory", label: "Subcategory", icon: AlignEndVertical },
    { to: "/product", label: "Product", icon: ShoppingBasket },
    { to: "/vendor", label: "Vendor", icon: Tractor },
    { to: "/order", label: "Order", icon: ShoppingCart },
    { to: "/inward", label: "Inward", icon: FileInput },
    { to: "/stock", label: "Stock & Inventory", icon: Package },
    { to: "/prescription", label: "Prescriptions", icon: ClipboardCheck },
  ];

  const nursesSidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/appointment", label: "Appointments", icon: CalendarDays },
    { to: "/admissions", label: "Admissions", icon: Bed },
  ];

  const links =
    role === "doctor"
      ? doctorSidebarLinks
      : role === "pharmacist"
      ? pharmacistSidebarLinks
      : role === "labtechnician"
      ? labtechSidebarLinks
      : role === "superadmin"
      ? superadminSidebarLinks
      : role === "nurse"
      ? nursesSidebarLinks
      : defaultLinks;

  // ✅ Shared Sidebar Content
  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between gap-2 px-4 h-[60px] border-b bg-white">
        <div className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <h1 className="text-lg font-semibold">Atelier HMS</h1>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          <X size={18} />
        </button>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.to;
            return (
              <div
                key={link.to}
                className={cn(
                  "w-full justify-start rounded-md text-[14px] font-medium gap-3 p-2 hover:bg-[#DDE4FF] transition-colors duration-200",
                  isActive ? "bg-[#F2F5FF] text-[#3D5EE1]" : "text-[#667085]"
                )}
              >
                <Link
                  to={link.to}
                  className="flex items-center gap-3 text-[15px]"
                  onClick={(e) => {
                    if (link.label === "Lab Results") {
                      e.preventDefault();
                      setOpenLabModal(true);
                    } else if (link.label === "Add Patient") {
                      e.preventDefault();
                      setOpen(true);
                    } else {
                      setActiveLink(link.label.toLowerCase());
                      onClose?.();
                    }
                  }}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-sm",
                      isActive
                        ? "bg-white shadow-sm text-[#3D5EE1]"
                        : "text-[#667085]"
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  {link.label}
                </Link>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t bg-white text-[14px]">
        <div
          onClick={handleLogout}
          className="flex items-center justify-start gap-2 w-full font-medium p-2 rounded-md cursor-pointer hover:bg-gray-100 text-[#667085]"
        >
          <Settings size={16} />
          Logout
        </div>
      </div>

      <LabResultModal open={openLabModal} setOpen={setOpenLabModal} />
      <AddPatientModal open={open} setOpen={setOpen} />
    </>
  );

  return (
    <>
      {/* ✅ Desktop Sidebar (always visible) */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white shadow-lg sticky top-0">
        <SidebarContent />
      </aside>

      {/* ✅ Mobile Sidebar (slides in/out) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
