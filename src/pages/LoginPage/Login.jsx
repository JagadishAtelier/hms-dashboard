import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldCheck,
  Zap,
  HeartPulse,
  CircleHelp,
  AlertCircle,
  X,
  KeyRound,
  Plus,
} from "lucide-react";
import authService from "../../service/authService.js";
import socialAuthService from "../../service/socialAuthService.js";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [selectedSSOProvider, setSelectedSSOProvider] = useState("Google");
  const [sandboxEmail, setSandboxEmail] = useState("");
  const [oauthConfig, setOAuthConfig] = useState({
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || null,
    microsoftClientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || null,
  });

  // Fetch server-configured OAuth parameters on mount
  useEffect(() => {
    (async () => {
      try {
        const cfg = await socialAuthService.getConfig();
        setOAuthConfig((prev) => ({
          googleClientId: prev.googleClientId || cfg.googleClientId || null,
          microsoftClientId: prev.microsoftClientId || cfg.microsoftClientId || null,
        }));
      } catch {
        // non-blocking
      }
    })();
  }, []);

  // Hydrate staff profile and navigate based on assigned hospital role
  const handleAuthSuccess = async (token, user, providerName = "Credentials") => {
    const normalizedRole = (user.role || "Receptionist").toLowerCase().replace(/\s+/g, "");

    localStorage.setItem("token", token);
    localStorage.setItem("role", normalizedRole);
    localStorage.setItem("username", user.username || "");
    localStorage.setItem("userid", user._id || user.id || "");
    localStorage.setItem("user", JSON.stringify(user));

    const staffRoles = [
      "doctor",
      "nurse",
      "receptionist",
      "pharmacist",
      "labtechnician",
      "accountant",
      "foodmanager",
      "hr",
    ];
    if (staffRoles.includes(normalizedRole)) {
      try {
        const BASE_API = (await import("../../api/baseurl.js")).default;
        const profileRes = await fetch(`${BASE_API}/hms/staff/staffprofile/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        const staffProfile = profileData?.data;
        if (staffProfile?.id) {
          localStorage.setItem("staffProfileId", staffProfile.id);
          localStorage.setItem("staffProfile", JSON.stringify(staffProfile));
        }
      } catch {
        // non-critical
      }
    }

    toast.success(`Welcome back, ${user.username || "User"}! Signed in via ${providerName}.`);

    switch (normalizedRole) {
      case "superadmin":
      case "admin":
      case "doctor":
      case "receptionist":
      case "pharmacist":
      case "labtechnician":
      case "hr":
        navigate("/dashboard");
        break;
      case "nurse":
        navigate("/nurse-dashboard");
        break;
      case "patient":
        navigate("/patient-dashboard");
        break;
      case "foodmanager":
        navigate("/food-dashboard");
        break;
      case "accountant":
        navigate("/accountant-dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  // Standard username/password login
  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { identifier, password } = formData;
      if (!identifier || !password) {
        setError("Please enter both email/username and password.");
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

      await handleAuthSuccess(res.token, res.user, "Password");
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

  // Trigger Google Sign-In
  const handleGoogleSignIn = () => {
    setError("");
    const clientId = oauthConfig.googleClientId;

    if (!clientId) {
      setSelectedSSOProvider("Google");
      setShowSSOModal(true);
      return;
    }

    setLoading(true);
    socialAuthService.initiateGooglePopup(
      clientId,
      async (tokens) => {
        try {
          const res = await socialAuthService.verifyGoogle(tokens);
          if (res?.token && res?.user) {
            await handleAuthSuccess(res.token, res.user, "Google");
          } else {
            setError(res?.error || "Google authentication failed.");
          }
        } catch (err) {
          setError(err?.response?.data?.error || err?.message || "Google authentication failed.");
        } finally {
          setLoading(false);
        }
      },
      (errMsg) => {
        setLoading(false);
        toast.error(errMsg);
      }
    );
  };

  // Trigger Microsoft Azure AD Sign-In
  const handleMicrosoftSignIn = () => {
    setError("");
    const clientId = oauthConfig.microsoftClientId;

    if (!clientId) {
      setSelectedSSOProvider("Microsoft");
      setShowSSOModal(true);
      return;
    }

    setLoading(true);
    socialAuthService.initiateMicrosoftPopup(
      clientId,
      async (tokens) => {
        try {
          const res = await socialAuthService.verifyMicrosoft(tokens);
          if (res?.token && res?.user) {
            await handleAuthSuccess(res.token, res.user, "Microsoft");
          } else {
            setError(res?.error || "Microsoft authentication failed.");
          }
        } catch (err) {
          setError(err?.response?.data?.error || err?.message || "Microsoft authentication failed.");
        } finally {
          setLoading(false);
        }
      },
      (errMsg) => {
        setLoading(false);
        toast.error(errMsg);
      }
    );
  };

  // Sandbox simulation: Allows testing Strict Staff Match policy using an authorized email
  const handleSimulateSocialLogin = async (e) => {
    e?.preventDefault();
    if (!sandboxEmail.trim()) {
      toast.error("Please enter a hospital staff email.");
      return;
    }

    setShowSSOModal(false);
    setLoading(true);
    setError("");

    try {
      const BASE_API = (await import("../../api/baseurl.js")).default;
      const res = await fetch(`${BASE_API}/auth/social/${selectedSSOProvider.toLowerCase()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: null,
          accessToken: null,
          idToken: null,
          simulateEmail: sandboxEmail.trim().toLowerCase(),
        }),
      });
      const data = await res.json();

      if (data?.token && data?.user) {
        await handleAuthSuccess(data.token, data.user, `${selectedSSOProvider} (SSO)`);
      } else {
        setError(data?.error || `Access Denied: ${sandboxEmail} is not authorized for staff access.`);
      }
    } catch (err) {
      setError(err?.message || "Social login verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Reusable Social Login Buttons Component
  const SocialButtons = ({ isMobile = false }) => (
    <div className={`grid ${oauthConfig.microsoftClientId ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full ${isMobile ? "h-9 py-1 px-2.5 text-xs" : "h-10 py-2 px-3 text-sm"
          } flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/90 active:scale-[0.98] rounded-lg font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer disabled:opacity-60`}
      >
        <svg className={`${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0`} viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
        <span className="truncate">Continue with Google</span>
      </button>

      {oauthConfig.microsoftClientId && (
        <button
          type="button"
          onClick={handleMicrosoftSignIn}
          disabled={loading}
          className={`w-full ${isMobile ? "h-9 py-1 px-2.5 text-xs" : "h-10 py-2 px-3 text-sm"
            } flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/90 active:scale-[0.98] rounded-lg font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer disabled:opacity-60`}
        >
          <svg className={`${isMobile ? "w-3 h-3" : "w-3.5 h-3.5"} shrink-0`} viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          <span className="truncate">Continue with Microsoft</span>
        </button>
      )}
    </div>
  );

  // Reusable Credentials Form Component
  const LoginForm = ({ isMobile = false }) => (
    <form onSubmit={handleLogin} className={isMobile ? "space-y-2.5" : "space-y-3.5"}>
      {/* Email / Username Field */}
      <div>
        <label className={`block ${isMobile ? "text-[10px] uppercase font-bold text-slate-600 mb-0.5" : "text-xs font-semibold text-slate-700 mb-1"}`}>
          Email / Username
        </label>
        <div className="relative group">
          <div className={`absolute ${isMobile ? "left-2.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none`}>
            <Mail className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </div>
          <input
            id={isMobile ? "m-login-identifier" : "login-identifier"}
            name="identifier"
            type="text"
            required
            placeholder="Enter your email or username"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            className={`w-full ${isMobile ? "h-9 pl-8 pr-3 text-xs rounded-lg" : "h-11 pl-10 pr-4 text-sm rounded-xl"
              } bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-slate-800 placeholder:text-slate-400 outline-none transition-all`}
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className={`block ${isMobile ? "text-[10px] uppercase font-bold text-slate-600 mb-0.5" : "text-xs font-semibold text-slate-700 mb-1"}`}>
          Password
        </label>
        <div className="relative group">
          <div className={`absolute ${isMobile ? "left-2.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none`}>
            <Lock className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </div>
          <input
            id={isMobile ? "m-login-password" : "login-password"}
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full ${isMobile ? "h-9 pl-8 pr-8 text-xs rounded-lg" : "h-11 pl-10 pr-10 text-sm rounded-xl"
              } bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-slate-800 placeholder:text-slate-400 outline-none transition-all`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute ${isMobile ? "right-2.5" : "right-3.5"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5`}
          >
            {showPassword ? (
              <EyeOff className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
            ) : (
              <Eye className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
            )}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-1.5 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={`${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer`}
          />
          <span className={`${isMobile ? "text-[11px]" : "text-xs"} text-slate-600 font-medium group-hover:text-slate-800 transition-colors`}>
            Remember me
          </span>
        </label>

        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className={`${isMobile ? "text-[11px]" : "text-xs"} font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer`}
        >
          Forgot Password?
        </button>
      </div>

      {/* Sign In Primary Action Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full ${isMobile ? "h-9 text-xs rounded-lg mt-1" : "h-11 sm:h-12 text-sm rounded-xl"
          } bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Sign In</span>
            <ChevronRight className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </>
        )}
      </button>
    </form>
  );

  // Bottom Healthcare Features Row
  const FeatureBadges = ({ isMobile = false }) => (
    <div className={`grid grid-cols-3 gap-1.5 ${isMobile ? "pt-1.5 border-t border-slate-100" : "pt-3 border-t border-slate-100"} shrink-0`}>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <div className={`${isMobile ? "w-5 h-5" : "w-6 h-6 sm:w-7 sm:h-7"} rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0`}>
          <ShieldCheck className={`${isMobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-blue-600`} />
        </div>
        <span className={`${isMobile ? "text-[9px]" : "text-[10px] sm:text-[11px]"} font-semibold text-slate-800 leading-tight truncate`}>
          Secure Access
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <div className={`${isMobile ? "w-5 h-5" : "w-6 h-6 sm:w-7 sm:h-7"} rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0`}>
          <Zap className={`${isMobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-blue-600`} />
        </div>
        <span className={`${isMobile ? "text-[9px]" : "text-[10px] sm:text-[11px]"} font-semibold text-slate-800 leading-tight truncate`}>
          Fast & Easy
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <div className={`${isMobile ? "w-5 h-5" : "w-6 h-6 sm:w-7 sm:h-7"} rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0`}>
          <HeartPulse className={`${isMobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-blue-600`} />
        </div>
        <span className={`${isMobile ? "text-[9px]" : "text-[10px] sm:text-[11px]"} font-semibold text-slate-800 leading-tight truncate`}>
          Better Care
        </span>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 font-sans select-none">

      {/* ========================================================================= */}
      {/* ================= MOBILE VIEW (< 1024px, ZERO SCROLL, 100dvh) =========== */}
      {/* ========================================================================= */}
      <div className="lg:hidden h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-slate-900">

        {/* HERO TOP SECTION: Image Background with Integrated Header & Welcome Content */}
        <div className="relative h-[40vh] min-h-[145px] max-h-[200px] w-full shrink-0 overflow-hidden">
          {/* Background Hospital Image */}
          <img
            src="/Modern-Hospital-Under-a-Blue-Sky.png"
            alt="Hospital Medical Center"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/loginBanner.png";
            }}
          />
          {/* Dark / Brand Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-slate-950/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 via-transparent to-transparent" />

          {/* Top Medical Cross Decorative Cue */}
          <div className="absolute top-2.5 right-3 text-white/20 pointer-events-none">
            <Plus className="w-6 h-6 stroke-[1.5]" />
          </div>

          {/* Integrated Header Bar Inside Background Image */}
          <div className="relative z-10 px-4 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/95 shadow-xs flex items-center justify-center p-1 shrink-0">
                <img src="./favicon.png" alt="logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-tight leading-none drop-shadow">
                  HMS
                </h1>
                <p className="text-[8px] text-blue-200 font-medium tracking-wide leading-none mt-0.5">
                  Hospital Management System
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-[10px] font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md active:scale-95 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer border border-white/30 shadow-xs"
            >
              <span>Need Help?</span>
              <CircleHelp className="w-3 h-3 text-blue-200" />
            </button>
          </div>

          {/* Welcome Typography Content Overlaid on Background */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-medium text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Atelier Medical Center · Online</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              Welcome Back
            </h2>
            <p className="text-[10px] text-slate-200 line-clamp-1 font-normal drop-shadow">
              Access your hospital services with ease and security
            </p>
          </div>
        </div>

        {/* FLOATING WHITE CARD: Holds the Form Perfectly Within Remaining Height */}
        <div className="relative flex-1 -mt-3.5 bg-white rounded-t-[22px] shadow-2xl z-20 px-6 sm:px-12 pt-8 pb-5 flex flex-col justify-between overflow-hidden">

          {/* Card Header */}
          <div className="text-center shrink-0">
            <h3 className="text-lg font-extrabold text-[#0B1E48] tracking-tight leading-none">
              Sign In
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Enter your credentials to continue
            </p>
          </div>

          {/* Social Logins */}
          <div className="shrink-0 my-1.5">
            <SocialButtons isMobile={true} />

            {/* Compact Divider */}
            <div className="relative my-1.5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative bg-white px-2.5 text-[9px] font-medium text-slate-400">
                or continue with email
              </span>
            </div>
          </div>

          {/* Compact Error Message Banner */}
          {error && (
            <div className="mb-1.5 p-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] rounded-lg flex items-center gap-1.5 shrink-0 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="font-medium truncate flex-1">{error}</span>
            </div>
          )}

          {/* Form Fields & Submit Button */}
          <div className="flex-1 flex flex-col justify-center">
            <LoginForm isMobile={true} />
          </div>

          {/* Footer Items in Card: Support, Badges & Copyright */}
          <div className="shrink-0 pt-1 border-t border-slate-100 mt-1">
            <p className="text-[10px] text-slate-500 text-center mb-1">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Contact Support
              </button>
            </p>

            <FeatureBadges isMobile={true} />

            <p className="text-center text-[8px] text-slate-400 pt-1">
              © 2025 HMS. All rights reserved.
            </p>
          </div>

        </div>

      </div>


      {/* ========================================================================= */}
      {/* ================= DESKTOP SPLIT LAYOUT (>= 1024px) ====================== */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid lg:grid-cols-2 h-screen w-screen overflow-hidden bg-white">

        {/* LEFT COLUMN: Branding & Hospital Architecture Overview */}
        <div className="flex flex-col justify-between bg-gradient-to-b from-blue-50/90 via-sky-50/40 to-blue-100/50 p-8 xl:p-10 2xl:p-12 border-r border-slate-200/80 h-full overflow-hidden">

          {/* Brand & Titles */}
          <div className="shrink-0">
            <div className="flex items-center gap-3 mb-4 xl:mb-5">
              <div className="relative w-11 h-11 rounded-xl flex items-center justify-center bg-white shadow-sm border border-blue-100/80 p-1.5 shrink-0">
                <img src="./favicon.png" alt="logo" className="w-full h-full object-contain" />
              </div>

              <div>
                <h1 className="text-xl xl:text-2xl font-black text-[#0B1E48] tracking-tight leading-none">
                  HMS
                </h1>
                <p className="text-[10px] xl:text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
                  Hospital Management System
                </p>
              </div>
            </div>

            <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-extrabold text-[#0B1E48] tracking-tight leading-tight">
              Welcome Back
            </h2>
            <p className="text-slate-600 text-xs xl:text-sm mt-1 font-normal leading-relaxed">
              Access your hospital services with ease and security
            </p>
          </div>

          {/* Hospital Architecture Visual Card */}
          <div className="flex-1 min-h-[160px] max-h-[380px] my-3 xl:my-4 rounded-2xl overflow-hidden shadow-md shadow-blue-900/10 border border-slate-200/90 bg-slate-100 relative group">
            <img
              src="/Modern-Hospital-Under-a-Blue-Sky.png"
              alt="Hospital Medical Center"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.src = "/loginBanner.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent pointer-events-none" />

            <div className="absolute bottom-3 left-3 text-white text-[11px] xl:text-xs font-semibold flex items-center gap-1.5 drop-shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40 animate-pulse" />
              <span>Atelier Hospital Management System · Main Campus</span>
            </div>
          </div>

          {/* Desktop Feature Badges */}
          <FeatureBadges isMobile={false} />
        </div>

        {/* RIGHT COLUMN: Sign In Form */}
        <div className="flex flex-col justify-between bg-white p-6 sm:p-8 xl:p-10 2xl:p-12 h-full overflow-y-auto">

          {/* Top Header Row with Need Help? */}
          <div className="flex items-center justify-end shrink-0 mb-2">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-[11px] xl:text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 active:scale-95 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Need Help?</span>
              <CircleHelp className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Center Sign In Form Container */}
          <div className="max-w-[400px] w-full mx-auto my-auto py-2">

            <div className="text-center mb-4 xl:mb-5">
              <h3 className="text-2xl xl:text-3xl font-extrabold text-[#0B1E48] tracking-tight">
                Sign In
              </h3>
              <p className="text-xs xl:text-sm text-slate-500 mt-1 font-normal">
                Enter your credentials to continue
              </p>
            </div>

            {/* Social Logins */}
            <SocialButtons isMobile={false} />

            {/* Divider */}
            <div className="relative my-3 xl:my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] xl:text-xs font-medium text-slate-400">
                or continue with email
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-medium block leading-snug">{error}</span>
                  {error.includes("not registered") && (
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-blue-700 font-bold underline text-[11px] mt-1 inline-block"
                    >
                      Contact IT Helpdesk to request staff access →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Main Form Fields */}
            <LoginForm isMobile={false} />
          </div>

          {/* Bottom Footer: Don't have an account? Contact Support */}
          <div className="text-center shrink-0 pt-3 border-t border-slate-100 mt-2">
            <p className="text-xs text-slate-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Contact Support
              </button>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              © 2025 HMS. All rights reserved.
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ================= MODALS & DIALOGS (SHARED) ============================= */}
      {/* ========================================================================= */}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CircleHelp className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-base">Hospital IT & Support</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <p>
                To obtain new staff login credentials, link your Google/Microsoft account, or request role permissions, please contact your administrator:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">IT Helpdesk:</span>
                  <span className="font-mono font-bold text-slate-900">Ext. 1044 / Room 201</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Support Email:</span>
                  <span className="font-mono font-bold text-blue-600">it-support@hospital.org</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Emergency Helpline:</span>
                  <span className="font-mono font-bold text-slate-900">+1 (800) 555-0199</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SSO Setup & Sandbox Testing Modal (Appears if OAuth client ID is not yet configured) */}
      {showSSOModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-base">
                  {selectedSSOProvider} Single Sign-On Setup
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSSOModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <p className="font-semibold mb-1">To enable live production {selectedSSOProvider} OAuth:</p>
                <p>
                  Add your {selectedSSOProvider} OAuth 2.0 Client ID to <code className="bg-white px-1.5 py-0.5 rounded font-mono border border-blue-200">frontend/.env</code>:
                </p>
                <pre className="mt-2 p-2 bg-white rounded font-mono text-[11px] text-slate-800 border border-blue-200 overflow-x-auto">
                  {selectedSSOProvider === "Google"
                    ? "VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com"
                    : "VITE_MICROSOFT_CLIENT_ID=your_azure_ad_client_id"}
                </pre>
              </div>

              {/* Sandbox verification form */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  Sandbox Testing (Strict Staff Match Verification):
                </p>
                <p className="text-[11px] text-slate-500">
                  Test the staff authentication policy right now using an existing registered hospital email:
                </p>
                <form onSubmit={handleSimulateSocialLogin} className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="e.g. atelierhub.official@gmail.com"
                    value={sandboxEmail}
                    onChange={(e) => setSandboxEmail(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSSOModal(false)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Verify & Sign In
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
