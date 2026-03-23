import React, { useEffect, useState } from "react";
import { TestTube2 } from "lucide-react";
import LabTechRecentTable from "./LabTechRecentTable";
import labDashboardService from "../../service/labdashboardService.js"; // ✅ adjust import path if needed

function LabTechDashboard() {
  const [summary, setSummary] = useState({ pending: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await labDashboardService.getDashboard();

        if (res?.status === "success") {
          setSummary(res.data.summary || { pending: 0, completed: 0 });
          setRecentOrders(res.data.recent_orders || []);
          setErrorMsg("");
        } else {
          setErrorMsg("⚠️ Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching lab dashboard:", err);
        setErrorMsg("❌ Error fetching dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Overview (Quick Stats)
      </h1>
      {/* ✅ Desktop Tabs */}
{/* ✅ Tabs (Mobile + Desktop) */}
<div className="flex overflow-x-auto gap-4 md:gap-6 border-b mb-6">
  <button
    onClick={() => setActiveTab("overview")}
    className={`pb-2 text-sm font-medium whitespace-nowrap ${
      activeTab === "overview"
        ? "border-b-2 border-[#011D4A] text-[#011D4A]"
        : "text-gray-500"
    }`}
  >
    Overview
  </button>

  <button
    onClick={() => setActiveTab("recent")}
    className={`pb-2 text-sm font-medium whitespace-nowrap ${
      activeTab === "recent"
        ? "border-b-2 border-[#011D4A] text-[#011D4A]"
        : "text-gray-500"
    }`}
  >
    Recent Orders
  </button>
</div>
      {loading ? (
        <div className="flex justify-center items-center h-[30vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#011D4A] border-solid"></div>
        </div>
      ) : errorMsg ? (
        <div className="text-center text-red-600 font-semibold py-10">
          {errorMsg}
        </div>
      ) : (
        <>

          <>
  {/* ✅ Overview Tab */}
  {activeTab === "overview" && (
    <div className="flex flex-wrap gap-5 mb-10">
      {/* Pending Tests */}
      <div className="flex flex-col gap-2 justify-center items-center flex-1 min-w-[250px] h-[30vh] text-center border border-[#CCD0F8] bg-[#F2F3FD] shadow rounded-md">
        <div className="bg-[#011D4A] text-white p-5 rounded-full">
          <TestTube2 size={30} />
        </div>
        <h1 className="text-[#011D4A] font-semibold text-3xl">
          {summary.pending}
        </h1>
        <p className="text-lg font-semibold text-[#475467]">
          Pending Lab Tests
        </p>
      </div>

      {/* Completed Tests */}
      <div className="flex flex-col gap-2 justify-center items-center flex-1 min-w-[250px] h-[30vh] text-center border border-[#CCD0F8] bg-[#F2F3FD] shadow rounded-md">
        <div className="bg-[#FFA500] text-white p-5 rounded-full">
          <TestTube2 size={30} />
        </div>
        <h1 className="text-[#011D4A] font-semibold text-3xl">
          {summary.completed}
        </h1>
        <p className="text-lg font-semibold text-[#475467]">
          Completed Lab Tests
        </p>
      </div>
    </div>
  )}

  {/* ✅ Recent Orders Tab */}
  {activeTab === "recent" && (
    <LabTechRecentTable data={recentOrders} />
  )}
</>
        </>
        
      )}
    </div>
  );
}

export default LabTechDashboard;
