import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Activity, Calendar, FileText, User, Heart, ChevronRight } from "lucide-react";
import authService from "../../service/authService.js";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

// --- Mock UI Components for Background ---

const BackgroundCard = ({ className, index = 1 }) => {
  const isEven = index % 2 === 0;
  const types = ["appointment", "vitals", "lab", "ward"];
  const type = types[index % types.length];

  const renderContent = () => {
    switch (type) {
      case "appointment":
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-sm">Appt #{1000 + index}</div>
                  <div className="text-[10px] text-gray-400">Cardiology Dept</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">10:30 AM</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
              <div className="text-[11px] text-gray-600 font-medium">Patient: John Doe</div>
            </div>
          </>
        );
      case "vitals":
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-sm">Vital Signs</div>
                  <div className="text-[10px] text-gray-400">Regular Checkup</div>
                </div>
              </div>
              <Heart size={14} className="text-red-400 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-gray-50 p-1.5 rounded text-center">
                <div className="text-[9px] text-gray-400 uppercase">BP</div>
                <div className="text-[11px] font-bold text-gray-700">120/80</div>
              </div>
              <div className="bg-gray-50 p-1.5 rounded text-center">
                <div className="text-[9px] text-gray-400 uppercase">HR</div>
                <div className="text-[11px] font-bold text-gray-700">72 bpm</div>
              </div>
            </div>
          </>
        );
      case "lab":
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-sm">Lab Report</div>
                  <div className="text-[10px] text-gray-400">Blood Analysis</div>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="mt-2 text-[11px] text-gray-600">
              <div className="flex justify-between border-b border-gray-100 pb-1 mb-1">
                <span>Glucose</span>
                <span className="font-bold text-gray-700">Normal</span>
              </div>
              <div className="flex justify-between">
                <span>WBC Count</span>
                <span className="font-bold text-gray-700">7.2 x10Â³/ÂµL</span>
              </div>
            </div>
          </>
        );
      case "ward":
      default:
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-700 text-sm">Room 204-B</div>
                  <div className="text-[10px] text-gray-400">General Ward</div>
                </div>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold">Occupied</span>
            </div>
            <div className="mt-3 overflow-hidden rounded-full bg-gray-100 h-1.5 w-full relative">
              <div className="absolute left-0 top-0 bottom-0 bg-amber-400 w-3/4" />
            </div>
            <div className="mt-1.5 text-[10px] text-gray-500 flex justify-between">
              <span>Recovery Progress</span>
              <span className="font-medium">75%</span>
            </div>
          </>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.4, scale: 1 }}
      transition={{ delay: (index % 5) * 0.1, duration: 0.8 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-100/80 p-5 ${className} flex flex-col justify-between backdrop-blur-sm`}
    >
      {renderContent()}
    </motion.div>
  );
};

const FloatingColumn = ({ speed = 20, children, className }) => (
  <motion.div
    animate={{ y: [0, "-50%"] }}
    transition={{
      duration: speed,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    }}
    style={{ willChange: "transform" }}
    className={className}
  >
    {children}
    {children}
  </motion.div>
);

// --- Main Login Component ---

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { identifier, password } = formData;
      if (!identifier || !password) {
        setError("Please enter both email/phone and password");
        setLoading(false);
        return;
      }

      const res = await authService.login(identifier, password);
      if (res?.error) {
        setError(res.error || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }
      if (!res?.user || !res?.token) {
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      const { token, user } = res;
      const normalizedRole = (user.role || "Receptionist").toLowerCase().replace(/\s+/g, "");
      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("username", user.username || "");
      localStorage.setItem("userid", user._id || user.id || "");
      localStorage.setItem("user", JSON.stringify(user));

      switch (normalizedRole) {
        case "superadmin":
          navigate("/admin-dashboard");
          break;
        case "doctor":
          navigate("/dashboard");
          break;
        case "pharmacist":
          navigate("/pharma-dashboard");
          break;
        case "labtechnician":
          navigate("/labtech-dashboard");
          break;
        case "patient":
          navigate("/patient-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      let message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Invalid credentials. Please try again.";
      if (message.toLowerCase().includes("invalid")) {
        message = "Invalid credentials. Please check your email or password.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Background Animated Elements */}
      <div className="absolute inset-0 flex gap-8 justify-center opacity-30 select-none pointer-events-none -skew-y-12 scale-110">
        <FloatingColumn speed={45} className="flex flex-col gap-8 w-72">
          {[1, 2, 3, 4, 5].map((i) => <BackgroundCard key={`col1-${i}`} index={i} className="h-44" />)}
        </FloatingColumn>
        <FloatingColumn speed={60} className="flex flex-col gap-8 w-72 pt-32">
          {[1, 2, 3, 4, 5].map((i) => <BackgroundCard key={`col2-${i}`} index={i + 10} className="h-44" />)}
        </FloatingColumn>
        <FloatingColumn speed={50} className="flex flex-col gap-8 w-72">
          {[1, 2, 3, 4, 5].map((i) => <BackgroundCard key={`col3-${i}`} index={i + 20} className="h-44" />)}
        </FloatingColumn>
        <FloatingColumn speed={70} className="flex flex-col gap-8 w-72 pt-48 hidden lg:flex">
          {[1, 2, 3, 4, 5].map((i) => <BackgroundCard key={`col4-${i}`} index={i + 30} className="h-44" />)}
        </FloatingColumn>
      </div>

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/80 to-transparent pointer-events-none" />

      {/* Glassmorphism Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md max-h-[85vh] w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 border border-white/50 relative z-10 overflow-y-auto custom-scrollbar flex flex-col justify-center"
      >
        {/* Logo Section */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 p-2 border border-gray-50"> {/* shadow-xl shadow-blue-900/5 */}
            <img src={logo} alt="HMS Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Care and Efficiency at Your Fingertips</p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email / Username</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0E1680] transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="text"
                placeholder="doctor@hospital.com"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className="w-full h-12 pl-12 pr-4 bg-gray-50/50 border border-transparent rounded-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0E1680]/10 focus:border-[#0E1680] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0E1680] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-12 pl-12 pr-12 bg-gray-50/50 border border-transparent rounded-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0E1680]/10 focus:border-[#0E1680] focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0E1680] transition-all"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between  pb-4 px-1">
            <label className="flex items-center cursor-pointer gap-2 group">
              <input type="checkbox" className="w-4 h-4 rounded-md border-gray-300 text-[#0E1680] focus:ring-[#0E1680]" />
              <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-xs font-bold cursor-help text-[#0E1680] opacity-80 hover:opacity-100 transition-all duration-200">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 cursor-pointer bg-gradient-to-r from-[#0E1680] to-[#1D3557] text-white font-bold rounded-sm shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign in
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-4  border-t border-gray-100 text-center">
          <p className="text-[12px] text-gray-400 font-medium ">
            Hospital Information Management System
          </p>
          <span className="block mt-1 text-[10px] text-gray-600 tracking-wide">Developed by <a href="https://ateliertechnologysolutions.com/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">Atelier Technology</a></span>
        </div>
      </motion.div>

      {/* External Footer Text */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 font-medium tracking-[0.2em] whitespace-nowrap z-0">
        © {dayjs().year()} All Rights Reserved to Atelier Creations
      </div>
    </div>
  );
}
