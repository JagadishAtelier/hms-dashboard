import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import authService from "../../service/authService.js";
import dayjs from "dayjs";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
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
    <div className="h-screen w-full flex bg-gray-50 overflow-hidden">
      {/* Left Side Illustration - Hidden on smaller screens, visible on large desktops */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 relative p-10">
        <img
          src="/login_hms.svg"
          alt="HMS Illustration"
          className="w-full max-w-[800px] h-auto max-h-[100vh] object-contain drop-shadow-lg"
        />
      </div>

      {/* Right Side Panel - Login Form */}
      <div className="w-full lg:w-[400px] xl:w-[450px] h-full bg-white lg:rounded-l-[20px] max-h-[100vh] shadow-2xl flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-12 py-8 overflow-y-auto z-10 transition-all duration-300">
        <div className="w-full max-w-sm mx-auto lg:mx-0 lg:max-w-full">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
            <img src="/Company_logo.png" alt="Company Logo" className="h-[60px] object-contain" />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 text-sm mt-1">Please enter your details to sign in</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400 w-4 h-4 group-focus-within:text-[#1D3557] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="alex@gmail.com"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    className="w-full h-12 pl-10 pr-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D3557]/20 focus:border-[#1D3557] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400 w-4 h-4 group-focus-within:text-[#1D3557] transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-12 pl-10 pr-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D3557]/20 focus:border-[#1D3557] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="rounded border-gray-300 text-[#1D3557] focus:ring-[#1D3557]" />
                <label htmlFor="remember" className="ml-2 text-gray-500 cursor-pointer">Remember me</label>
              </div>
              <a href="/forgot-password" className="text-[#1D3557] font-semibold hover:underline">
                Forgot Password?
              </a>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center animate-pulse">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#0E1680] to-[#1D3557] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Login Now"
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/signup")}
              className="w-full h-11 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-[#0E1680] transition-all flex items-center justify-center gap-2"
            >
              Do not have an account? <span className="text-[#0E1680] font-bold">Sign Up</span>
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            © {dayjs().year()} Hospital Management System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
