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

      // ✅ Validation
      if (!identifier || !password) {
        setError("Please enter both email/phone and password");
        setLoading(false);
        return;
      }

      // ✅ API Call
      const res = await authService.login(identifier, password);
      console.log("Login response:", res);

      // ❌ If backend sends "error" field
      if (res?.error) {
        setError(res.error || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // ❌ If missing user/token
      if (!res?.user || !res?.token) {
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      // ✅ Extract user + role
      const { token, user } = res;
      const normalizedRole = (user.role || "Receptionist")
        .toLowerCase()
        .replace(/\s+/g, "");

      // ✅ Store user info
      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("username", user.username || "");

      // ✅ Redirect based on role
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

      // ✅ Handle all error types gracefully
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
    <div className="flex w-full h-screen items-center justify-center gap-20 bg-gray-50">
      {/* Left Image */}
      <div className="w-fit h-full flex items-center justify-center">
        <img
          src="/loginBanner.png"
          className="w-[100%] h-[90%] object-cover rounded-2xl"
          alt="Login Banner"
        />
      </div>

      {/* Right Form */}
      <div className="w-fit flex flex-col items-center justify-center gap-3">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">Login to manage patient records</p>
        </div>

        <div className="w-full space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email or Phone
            </label>
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

          {/* 🔴 Error Message */}
          {error && (
            <p className="text-red-600 text-sm text-center font-medium">
              Invalid credentials. Please try again.
            </p>
          )}

          <Button
            className="w-full h-13 bg-[#1D3557] hover:bg-[#1D3557]/90"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
