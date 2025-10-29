import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../service/authService.js";

function Login() {
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
      console.log("Login response:", res);

      // 🔹 Normalize role (lowercase + remove spaces)
      const rawRole = res?.user?.role || "Receptionist";
      const normalizedRole = rawRole.toLowerCase().replace(/\s+/g, ""); // e.g. "Lab Technician" → "labtechnician"

      localStorage.setItem("role", normalizedRole);

      // 🔹 Role-based navigation
      if (normalizedRole === "doctor") navigate("/dashboard");
      else if (normalizedRole === "pharmacist") navigate("/pharma-dashboard");
      else if (normalizedRole === "labtechnician") navigate("/labtech-dashboard");
      else navigate("/dashboard");

      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen items-center justify-center gap-20">
      {/* Left side - Image */}
      <div className="w-fit h-full flex items-center justify-center">
        <img
          src="/loginBanner.png"
          className="w-[100%] h-[90%] object-cover rounded-2xl"
          alt="Login Banner"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-fit flex flex-col items-center justify-center gap-3">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">Login to manage patient records</p>
        </div>

        <div className="w-full space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email or Phone</label>
            <Input
              type="text"
              placeholder="Enter Email or Phone"
              className="h-13 bg-white w-full"
              value={formData.identifier}
              onChange={(e) =>
                setFormData({ ...formData, identifier: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              placeholder="Enter Password"
              className="h-13 bg-white w-full"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <p className="text-gray-500 text-xs">Must be at least 8 characters.</p>

          <Button
            className="w-full h-13 bg-[#1D3557] hover:bg-[#1D3557]"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="flex items-center gap-2">
            <div className="border w-full"></div>
            <p>OR</p>
            <div className="border w-full"></div>
          </div>

          <p className="text-center">
            Don’t have an account?{" "}
            <a href="/register" className="underline text-[#0E1680]">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
