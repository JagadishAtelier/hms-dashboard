import { useState } from "react";
import {
  Search,
  Calendar,
  Menu,
  Bell,
  MessageSquare,
  Sun,
  Command,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TopNavbar({ onMenuClick }) {
  const [academicYear, setAcademicYear] = useState("2024/2025");

  return (
    <header className="flex items-center justify-between bg-white px-4 h-[60px] shadow-sm border-b border-gray-200">
      {/* Left - Search + Hamburger */}
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50"
        >
          <Menu size={18} />
        </button>

        {/* Search */}
        <div className="relative w-56 sm:w-64 hidden sm:block">
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 shadow-sm p-1 rounded-sm border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer">
            <Command size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Year Dropdown */}
        <Select value={academicYear} onValueChange={setAcademicYear}>
          <SelectTrigger className="hidden sm:flex w-[200px] h-[40px] text-[14px] font-medium text-gray-700 border border-gray-200 bg-white rounded shadow-sm hover:bg-gray-50">
            <Calendar size={16} className="mr-2 text-gray-500" />
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024/2025">Financial Year : 2024 / 2025</SelectItem>
            <SelectItem value="2023/2024">Financial Year : 2023 / 2024</SelectItem>
          </SelectContent>
        </Select>

        {/* Theme Toggle */}
        <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
          <Sun size={16} />
        </Button>

        {/* Notification */}
        <div className="relative">
          <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
            <Bell size={16} />
          </Button>
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Chat */}
        <div className="relative">
          <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
            <MessageSquare size={16} />
          </Button>
          <span className="absolute top-1 right-1 h-2 w-2 bg-sky-400 rounded-full"></span>
        </div>

        {/* Avatar */}
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/049/174/246/small/a-smiling-young-indian-man-with-formal-shirts-outdoors-photo.jpg"
          alt="user"
          className="h-9 w-9 rounded-full border border-gray-200 object-cover"
        />
      </div>
    </header>
  );
}
