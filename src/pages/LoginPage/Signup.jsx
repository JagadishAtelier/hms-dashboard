import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
function Signup() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ email: "", password: "" });
 const handleLogin = () => {
  const { email } = formData;
  let userRole = "receptionist";
  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === "doctor@gmail.com") userRole = "doctor";
  else if (normalizedEmail === "pharmacist@gmail.com") userRole = "pharmacist";
  else if (normalizedEmail === "labtech@gmail.com") userRole = "labtech";
  

  localStorage.setItem("role", userRole);

  // Role-based navigation
if (userRole === "doctor") {
  navigate("/dashboard");
  window.location.reload();
} else if (userRole === "pharmacist") {
  navigate("/pharma-dashboard");
  window.location.reload();
} else if (userRole === "labtech") {
  navigate("/labtech-dashboard");
  window.location.reload();
} else {
  navigate("/dashboard");
  window.location.reload();
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
      <div className="w-1/4 flex flex-col items-center justify-center gap-3">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold">Sign to your account</h1>
          <p className="text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="w-full space-y-5">

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="text" placeholder="Enter Email" className="h-13 bg-white w-full"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input type="password" placeholder="Enter Password" className="h-13 bg-white w-full"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}/>
          </div>
          <Button className="w-full h-13 bg-[#1D3557] hover:bg-[#1D3557]" onClick={handleLogin}>Log in</Button>
          <div className="flex items-center gap-2">
            <div className="border w-full"></div>
            <p>OR</p>
            <div className="border w-full"></div>
          </div>
          <p className="text-center">Already have an account?<a href="/" className="underline text-[#0E1680]">Sign up</a></p>
        </div>
      </div>
    </div>
  )
}

export default Signup