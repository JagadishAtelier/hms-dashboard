import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
        <div className="flex min-h-screen bg-[var(--dashboard-secondary)] font-sans transition-colors duration-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white border-b dark:bg-gray-900 dark:border-gray-700">
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)} 
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
                <main className="flex-1 px-4 sm:px-5 py-3 overflow-x-hidden">
            {children}
        </main>
      </div>
    </div>
  );
}
