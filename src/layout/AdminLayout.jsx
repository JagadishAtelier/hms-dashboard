import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/layout/MobileBottomNav";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true, state: { from: location } });
    } else {
      setIsAuthChecking(false);
    }
  }, [navigate, location]);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Prevent rendering protected content before session check completes
  if (isAuthChecking && !localStorage.getItem("token")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800">
      {/* Sidebar (Desktop 260px/80px, Tablet 68px compact rail, Mobile slide-over drawer) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isTablet ? true : isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        onNavigate={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
        {/* Sticky Glassmorphic Top Navbar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-colors shadow-2xs">
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)} 
            isCollapsed={isTablet ? true : isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </div>

        {/* Content Container with Safe Area clearance for Mobile Bottom Dock */}
        <main className="flex-1 px-3 sm:px-6 py-4 pb-24 md:pb-8 overflow-x-hidden transition-all duration-200">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Material Design 3 Bottom Navigation Dock */}
      {isMobile && (
        <MobileBottomNav onOpenMenu={() => setIsSidebarOpen(true)} />
      )}
    </div>
  );
}

