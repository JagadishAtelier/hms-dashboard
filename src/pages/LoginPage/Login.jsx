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
        case "doctor":
          navigate("/admin-dashboard");
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
    <div className="h-screen w-full overflow-hidden flex bg-gray-50">
      {/* Left Side Illustration */}
      <div className="hidden pl-1 lg:flex lg:flex-1 items-center  bg-white/0 ">
        <img
          src="/login_hms.svg"
          alt="HMS Illustration"
          className="max-w-[820px] w-full h-[95%] object-contain"
        />
      </div>

      {/* Fixed Right Side Panel */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white rounded-l-2xl shadow-2xl border-l border-gray-100 flex flex-col justify-center z-50">
        <div className="p-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/Company_logo.png" alt="Company Logo" className="h-[60px]" />
          </div>

          <div className="space-y-4">
            <label className="text-xs text-gray-500">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-gray-400 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="alex@gmail.com"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1D3557]/20"
              />
            </div>

            <label className="text-xs text-gray-500">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400 w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1D3557]/20"
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-1">
              <a href="/forgot-password" className="text-[#1D3557] hover:underline">
                Forgot Password?
              </a>
              {error ? (
                <p className="text-red-600 text-xs font-medium">{error}</p>
              ) : (
                <div />
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#0E1680] to-[#1D3557] text-white font-semibold rounded-md mt-2 hover:opacity-95 disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? "Logging in..." : "Login Now"}
            </button>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-[1px] bg-gray-200" />
              <div className="text-xs text-gray-400">OR</div>
              <div className="flex-1 h-[1px] bg-gray-200" />
            </div>

            <button
              onClick={() => navigate("/signup")}
              className="w-full h-10 border border-[#DDE6FF] rounded-md mt-3 text-sm text-[#0E1680] hover:bg-[#F6F9FF]"
            >
              Signup Now
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            © {dayjs().year()} Hospital Management
          </div>
        </div>
      </div>
    </div>
  );
}
