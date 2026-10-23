import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true, state: { from: location } });
    } else {
      setIsAuthChecking(false);
    }
  }, [navigate, location]);

  // Prevent rendering protected content before session check completes
  if (isAuthChecking && !localStorage.getItem("token")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app-gradient">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-app-gradient font-sans transition-colors duration-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-colors">
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)} 
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
        <main className="flex-1 px-4 sm:px-6 py-4 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
