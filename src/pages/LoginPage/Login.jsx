// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import authService from "../../service/authService.js";
import dayjs from "dayjs";

/**
 * Notes:
 * - Place the large hero illustration at public/login_hms.svg
 *   OR import it from src/assets: `import hero from '../../assets/login_hms.svg'`
 * - You can replace the simple text-logo with an image: /logo-blue.png in public.
 * - Requires Tailwind CSS.
 */

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
      // normalize response checks
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

      // route by role (same mapping as before)
      switch (normalizedRole) {
        case "superadmin":
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 h-[90vh]">
      <div className="max-w-[1200px] w-full mx-auto flex items-stretch bg-transparent shadow-none h-[550px]">
        {/* Left illustration (approx 65% - large) */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-white/0 p-12">
          {/* Use public file /login_hms.svg or import above */}
          <img
            src="/login_hms.svg"
            alt="HMS Illustration"
            className="max-w-[820px] w-full h-[90%] object-contain"
          />
        </div>

        {/* Right card (approx 35% - fixed width) */}
        <div className="w-full max-w-md bg-white h-auto rounded-l-none rounded-r-2xl shadow-xl border-l border-gray-100">
          <div className="p-10">
            {/* small logo */}
            <div className="flex items-center justify-center gap-3 mb-6 ">
              {/* Replace text with logo image if available */}
              <img src="/Company_logo.png" alt="" srcset="" className="h-[60px]" />
            </div>

            {/* Email input with left icon */}
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

              {/* forgot + error */}
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

              {/* Login button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#0E1680] to-[#1D3557] text-white font-semibold rounded-md mt-2 hover:opacity-95 disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? "Logging in..." : "Login Now"}
              </button>

              {/* OR and signup */}
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

            {/* small footer text */}
            <div className="mt-6 text-center text-xs text-gray-400">
              © {dayjs().year()} Hospital Management
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive: show hero above or hide */}
      <style jsx>{`
        /* on smaller screens, we hide left illustration and center card */
        @media (max-width: 1024px) {
          .max-w-[1200px] > .hidden.lg\\:flex {
            display: none;
          }
          .w-full.max-w-md {
            border-radius: 12px;
            margin: 24px;
          }
        }
      `}</style>
    </div>
  );
}
