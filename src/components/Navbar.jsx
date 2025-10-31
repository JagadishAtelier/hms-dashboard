import { useEffect, useState } from "react";
import { Bell, Menu, LogOut } from "lucide-react";
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
import { UserRound } from 'lucide-react';

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
    <header className="flex items-center justify-between px-6 py-4 text-black bg-white shadow-sm">
      {/* Left section - logo / menu */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:block lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-4 space-y-2">
              <Button variant="ghost" className="justify-start">
                Dashboard
              </Button>
              <Button variant="ghost" className="justify-start">
                Users
              </Button>
              <Button variant="ghost" className="justify-start">
                Settings
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right section - notifications & user */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <Bell />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full" />
        </div>

        <Separator orientation="vertical" className="h-6 hidden md:block" />

        {/* ✅ User Info */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <UserRound className="h-10 w-10 object-cover rounded-full border"/>
          <div className="flex flex-col gap-0.5 text-start">
            <span className="hidden md:inline text-sm font-semibold text-gray-800">
              {user?.role || "Loading..."}
            </span>
            <span className="hidden md:inline text-xs text-gray-500">
              {user?.username || ""}
            </span>
          </div>

          {/* ✅ Logout button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 opacity-0 group-hover:opacity-100 transition"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} className="text-red-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
