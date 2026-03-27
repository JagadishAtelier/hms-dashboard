import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/Context/SidebarContext";
import { useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";
import labDashboardService from "../../service/labdashboardService";

const baseTableHead = ["Patient Name", "Test", "Status", "Order No"];

function LabTechRecentTable() {
  const navigate = useNavigate();
  const { setMode, setActiveLink, setSelectedPatientId } = useSidebar();

  const [role, setRole] = useState("");
  const [recentData, setRecentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await labDashboardService.getDashboard();
        if (res?.status === "success") {
          setRecentData(res.data.recent_orders || []);
        } else {
          setErrorMsg("Unable to load recent lab test data");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to fetch lab dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleEdit = (id) => {
    setMode("edit");
    setSelectedPatientId(id);
    setActiveLink("edit overview");
    navigate(`/overview/${id}`);
  };

  const showAction =
    role === "doctor" || role === "pharmacist" || role === "labtech";

  return (
    <div className="md:p-4 my-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Activities</h2>
        <a href="/lab-tech-prescriptions" className="text-blue-700 underline">
          View All
        </a>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center h-[30vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0E1680] border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* ================= MOBILE VIEW (CARDS) ================= */}
          <div className="block sm:hidden space-y-4">
            {recentData.length > 0 ? (
              recentData.map((order, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border p-4 space-y-3"
                >
                  <div>
                    <p className="text-xs text-gray-500">Patient</p>
                    <p className="font-medium text-[#475467]">
                      {order.patient?.first_name}{" "}
                      {order.patient?.last_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Test</p>
                    <p className="text-[#475467]">
                      {order.items?.[0]?.test?.name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Order No</p>
                    <p className="text-[#475467]">
                      {order.order_no || "—"}
                    </p>
                  </div>

                  {showAction && (
                    <div className="pt-2">
                      <Button
                        className="w-full bg-[#0E1680] text-white h-9"
                        onClick={() => handleEdit(order.patient?.id)}
                      >
                        <Edit2 size={16} className="mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">
                No recent lab test orders found
              </p>
            )}
          </div>

          {/* ================= TABLET + DESKTOP VIEW ================= */}
          <div className="hidden sm:block overflow-x-auto md:overflow-hidden">
            <Table className="min-w-[600px] rounded-2xl overflow-hidden border border-gray-200">
              <TableHeader>
                <TableRow className="bg-[#E5E7FB]">
                  {[...baseTableHead, ...(showAction ? ["Action"] : [])].map(
                    (col, i) => (
                      <TableHead
                        key={i}
                        className="py-4 px-2 text-[#475467] whitespace-nowrap"
                      >
                        {col}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {recentData.length > 0 ? (
                  recentData.map((order, index) => (
                    <TableRow key={index} className="bg-white">
                      <TableCell className="py-4 px-2 whitespace-nowrap">
                        {order.patient?.first_name}{" "}
                        {order.patient?.last_name}
                      </TableCell>

                      <TableCell>
                        {order.items?.[0]?.test?.name || "—"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>

                      <TableCell>
                        {order.order_no || "—"}
                      </TableCell>

                      {showAction && (
                        <TableCell>
                          <Button
                            className="bg-[#0E1680] text-white h-8"
                            onClick={() => handleEdit(order.patient?.id)}
                          >
                            <Edit2 size={16} />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={showAction ? 5 : 4}
                      className="text-center py-10 text-gray-500"
                    >
                      No recent lab test orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

export default LabTechRecentTable;