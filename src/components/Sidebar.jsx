import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import logo from '../assets/logo.png'
import LabResultModal from "./Context/LabResultModal"
import {
  Home,
  PanelsTopLeft,
  Users,
  Settings,
  CalendarDays,
  LogOut,
  LayoutDashboard,
  Bed,
  UserPlus,
  Notebook,
} from "lucide-react"
import { useSidebar } from "./Context/SidebarContext"
import { useEffect, useState } from "react"
import AddPatientModal from "./Context/AddPatientModal"

export default function Sidebar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [openLabModal, setOpenLabModal] = useState(false)
  const { pathname } = useLocation()
  const { activeLink, setActiveLink, selectedPatientId } = useSidebar()
  const location = useLocation()

  const [role, setRole] = useState(localStorage.getItem("role") || "receptionist")

  useEffect(() => {
    const storedRole = localStorage.getItem("role")
    console.log("Sidebar role check:", storedRole)
    if (storedRole) setRole(storedRole)
  }, [location.pathname])

  // ✅ Receptionist / Admin / Default links
  const defaultLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/appointment", label: "Appointments", icon: CalendarDays },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/room-allocation", label: "Room Allocation", icon: Bed },
    { to: "/add-patient", label: "Add Patient", icon: UserPlus },
  ]

  // ✅ Doctor links
  const doctorSidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/patient-list", label: "Patient List", icon: Users },
    { to: "/today-appoinments", label: "Today's Appointments", icon: CalendarDays },
    { to: "/room-allocation", label: "Room Allocation", icon: Bed },
    { to: "/Lab-Results", label: "Lab Results", icon: UserPlus },
  ]

  // ✅ Pharmacist links
  const pharmacistSidebarLinks = [
    { to: "/pharma-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/prescriptions", label: "Prescriptions", icon: Users },
    { to: "/stockinventory", label: "Stock & Inventory", icon: Bed },
  ]

  // ✅ Lab Technician links
  const labtechSidebarLinks = [
    { to: "/labtech-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/lab-tech-prescriptions", label: "Prescriptions", icon: Users },
  ]

  // ✅ Role-based link assignment
  const links =
    role === "doctor"
      ? doctorSidebarLinks
      : role === "pharmacist"
      ? pharmacistSidebarLinks
      : role === "labtechnician"
      ? labtechSidebarLinks
      : defaultLinks

  return (
    <aside className="sticky top-0 h-[100vh] hidden md:hidden lg:flex flex-col w-64 bg-transparent shadow-lg">
      {/* Header */}
      {/* <div className="p-3.5 bg-[#02053D]">
        <div className="border border-[#3B44B2] bg-[#21234E] pl-5 py-[0.7rem] rounded-md">
          <h1 className="text-sm font-medium text-white m-0">Atelier HMS</h1>
        </div>
      </div> */}

      {/* Navigation */}
      <ScrollArea className="flex-1 bg-[#FCFCFD] mt-5 ml-3 rounded-md shadow-lg relative">
        <div className="p-4 flex gap-2 items-center justify-center border-b">
          <img src={logo} alt="logo" />
          <p className="text-lg font-bold">Atelier HMS</p>
        </div>

        <nav className="p-4 space-y-4">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.to

            return (
              <div
                key={link.to}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-md text-sm font-medium gap-3 p-2 hover:bg-gray-100",
                  isActive
                    ? "bg-[#E5E7FB] text-[#011D4A] hover:bg-gray-200 hover:text-gray-900"
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

        {/* Modals */}
        <LabResultModal open={openLabModal} setOpen={setOpenLabModal} />
        <AddPatientModal open={open} setOpen={setOpen} />

        {/* Footer */}
        <div className="p-5 flex flex-col gap-2 absolute bottom-0 left-0 border-t w-full bg-white">
          {[{ icon: Settings, label: "Settings" }, { icon: LogOut, label: "Logout" }].map(
            (item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-start gap-2 w-full text-base font-medium p-2 rounded-md cursor-pointer transition-colors",
                    "hover:bg-gray-100 hover:text-gray-900 text-[#667085]"
                  )}
                >
                  <Icon size={20} />
                  {item.label}
                </div>
              )
            }
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
