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
import labDashboardService from "../../service/labdashboardService"; // ✅ adjust path

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
        console.error("Error fetching dashboard data:", err);
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

  const tableHead =
    role === "doctor" || role === "pharmacist" || role === "labtech"
      ? [...baseTableHead, "Action"]
      : baseTableHead;

  return (
    <div className="p-4 my-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <a href="/lab-tech-prescriptions" className="text-blue-700 underline">
          View All
        </a>
      </div>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="overflow-x-auto max-sm:w-[570px]">
        {loading ? (
          <div className="flex justify-center items-center h-[30vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0E1680] border-t-transparent"></div>
          </div>
        ) : (
          <Table className="min-w-[570px] rounded-2xl overflow-hidden border border-gray-200">
            <TableHeader>
              <TableRow className="bg-[#E5E7FB] rounded-2xl hover:bg-[#E5E7FB]">
                {tableHead.map((column, index) => (
                  <TableHead
                    key={index}
                    className="py-4 px-2 text-[#475467] whitespace-nowrap"
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {recentData.length > 0 ? (
                recentData.map((order, index) => (
                  <TableRow key={index} className="text-[#475467] bg-white">
                    <TableCell className="font-medium py-4 px-2 text-[#475467] whitespace-nowrap">
                      {order.patient?.first_name} {order.patient?.last_name}
                    </TableCell>
                    <TableCell className="px-2">
                      {order.items?.[0]?.test?.name || "—"}
                    </TableCell>
                    <TableCell className="px-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-2">
                      {order.order_no || "—"}
                    </TableCell>

                    {(role === "doctor" ||
                      role === "pharmacist" ||
                      role === "labtech") && (
                      <TableCell className="px-2">
                        <Button
                          className="bg-[#0E1680] text-white h-8 hover:bg-[#0a115c]"
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
                    colSpan={tableHead.length}
                    className="text-center py-10 text-gray-500"
                  >
                    No recent lab test orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default LabTechRecentTable;
