import { useEffect, useState } from "react";
import { Bell, Menu, LogOut, UserRound } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import authService from "@/service/authService.js";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Fetch logged-in user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile();
        setUser(res);
      } catch (err) {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load user profile");
      }
    };
    fetchProfile();
  }, []);

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="flex items-center justify-between px-5 py-3 text-[13px] text-black bg-white shadow-sm">
      {/* Left section - logo / menu */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:block lg:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SheetHeader className="p-3 border-b">
              <SheetTitle className="text-sm font-semibold">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-3 space-y-1.5 text-[13px]">
              <Button variant="ghost" className="justify-start text-[13px]">
                Dashboard
              </Button>
              <Button variant="ghost" className="justify-start text-[13px]">
                Users
              </Button>
              <Button variant="ghost" className="justify-start text-[13px]">
                Settings
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right section - notifications & user */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <Bell size={16} />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full" />
        </div>

        <Separator orientation="vertical" className="h-5 hidden md:block" />

        {/* ✅ User Info */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <UserRound className="h-8 w-8 object-cover rounded-full border" />
          <div className="flex flex-col gap-0.5 text-start">
            <span className="hidden md:inline text-[13px] font-semibold text-gray-800 leading-tight">
              {user?.role || "Loading..."}
            </span>
            <span className="hidden md:inline text-[12px] text-gray-500 leading-tight">
              {user?.username || ""}
            </span>
          </div>

          {/* ✅ Logout button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 opacity-0 group-hover:opacity-100 transition"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} className="text-red-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
