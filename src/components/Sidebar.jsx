import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import logo from '../assets/logo.png'
import LabResultModal from "./Context/LabResultModal"
import {
  Users,
  Settings,
  CalendarDays,
  LogOut,
  LayoutDashboard,
  Bed,
  UserPlus,
  Building,
  IdCardLanyard,
  SquareUser,
  HousePlus,
  DoorOpen,
  TestTubeDiagonal
} from "lucide-react"
import { useSidebar } from "./Context/SidebarContext"
import { useEffect, useState } from "react"
import AddPatientModal from "./Context/AddPatientModal"

export default function Sidebar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [openLabModal, setOpenLabModal] = useState(false)
  const { pathname } = useLocation()
  const { activeLink, setActiveLink } = useSidebar()
  const location = useLocation()

  const [role, setRole] = useState(localStorage.getItem("role") || "receptionist")

  useEffect(() => {
    const storedRole = localStorage.getItem("role")
    if (storedRole) setRole(storedRole)
  }, [location.pathname])

  const defaultLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/appointment", label: "Appointments", icon: CalendarDays },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/admissions", label: "Admissions", icon: Bed },
    { to: "/add-patient", label: "Add Patient", icon: UserPlus },
  ]

  const doctorSidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/today-appoinments", label: "Today's Appointments", icon: CalendarDays },
    { to: "/admissions", label: "Admissions", icon: Bed },
    { to: "/Lab-Results", label: "Lab Results", icon: UserPlus },
  ]

  const pharmacistSidebarLinks = [
    { to: "/pharma-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/prescriptions", label: "Prescriptions", icon: Users },
    { to: "/stockinventory", label: "Stock & Inventory", icon: Bed },
  ]

  const labtechSidebarLinks = [
    { to: "/labtech-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/lab-tech-prescriptions", label: "Prescriptions", icon: Users },
  ]

  const superadminSidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctors", label: "Doctors", icon: SquareUser },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/appointment", label: "Appointments", icon: CalendarDays },
    { to: "/admissions", label: "Admissions", icon: Bed },
    { to: "/department", label: "Departments", icon: Building },
    { to: "/designation", label:"Designations", icon: IdCardLanyard},
    { to: "/ward", label: "Ward", icon: DoorOpen },
    { to: "/room", label: "Room", icon: HousePlus },
    { to: "/bed", label: "Bed", icon: Bed },
    { to: "/labtest", label: "Lab Tests", icon: TestTubeDiagonal },
  ]

  const links =
    role === "doctor"
      ? doctorSidebarLinks
      : role === "pharmacist"
      ? pharmacistSidebarLinks
      : role === "labtechnician"
      ? labtechSidebarLinks
      : role === "superadmin"
      ? superadminSidebarLinks
      : defaultLinks

  return (
    <aside className="sticky top-0 h-screen hidden md:hidden lg:flex flex-col w-64 bg-[#FCFCFD] shadow-lg">
      {/* Logo Header */}
      <div className="flex items-center gap-2 p-4 border-b bg-white">
        <img src={logo} alt="logo" className="w-8 h-8" />
        <h1 className="text-lg font-semibold">Atelier HMS</h1>
      </div>

      {/* ✅ Scrollable Navigation Section */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.to

            return (
              <div
                key={link.to}
                className={cn(
                  "w-full justify-start rounded-md text-sm font-medium gap-3 p-2 hover:bg-gray-100",
                  isActive
                    ? "bg-[#E5E7FB] text-[#011D4A] hover:bg-gray-200"
                    : "text-[#667085]"
                )}
              >
                <Link
                  to={link.to}
                  className="flex items-center gap-2 text-base"
                  onClick={(e) => {
                    if (link.label === "Lab Results") {
                      e.preventDefault()
                      setOpenLabModal(true)
                    } else if (link.label === "Add Patient") {
                      e.preventDefault()
                      setOpen(true)
                    } else {
                      setActiveLink(link.label.toLowerCase())
                    }
                  }}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* ✅ Footer stays fixed below scroll area */}
      <div className="p-4 border-t bg-white">
        {[{ icon: Settings, label: "Settings" }].map(
          (item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-start gap-2 w-full text-base font-medium p-2 rounded-md cursor-pointer transition-colors",
                  "hover:bg-gray-100 text-[#667085]"
                )}
              >
                <Icon size={20} />
                {item.label}
              </div>
            )
          }
        )}
      </div>

      {/* Modals */}
      <LabResultModal open={openLabModal} setOpen={setOpenLabModal} />
      <AddPatientModal open={open} setOpen={setOpen} />
    </aside>
  )
}
