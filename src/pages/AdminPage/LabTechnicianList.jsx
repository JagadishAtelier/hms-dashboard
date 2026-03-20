import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  RotateCw,
  RefreshCw,
  TestTubeDiagonal,
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "../Loading.jsx";
// 👉 create this service like doctorsService
//import labTechniciansService from "../../service/labTechniciansService.js";
import labTechniciansService from "../../service/labTechniciansService.js";
const DEFAULT_LIMIT = 10;

function LabTechnicianList() {
  const navigate = useNavigate();
  const { id } = useParams();
const isEdit = Boolean(id);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // ✅ Fetch Data
  const fetchData = async () => {
  setLoading(true);
  try {
    const res = await labTechniciansService.getAllLabTechnicians({
      page: currentPage,
      limit,
    });

    const result = res?.data?.data || {};

    setData(result.data || []);
    setTotal(result.total || 0);
  } catch (err) {
    toast.error("Failed to fetch lab technicians");
    setData([]);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchData();
}, [currentPage, limit]);

const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
const endIndex = Math.min(total, currentPage * limit);
  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => navigate("/labtechnician/create");
  const handleEdit = (id) => navigate(`/labtechnician/edit/${id}`);

  const handleDelete = async (id) => {
    if (!confirm("Delete this lab technician?")) return;
    try {
      await labTechniciansService.deleteLabTechnician(id);
      toast.success("Deleted successfully");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleRestore = async (id) => {
    try {
      await labTechniciansService.restoreLabTechnician(id);
      toast.success("Restored");
      fetchData();
    } catch {
      toast.error("Restore failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const displayData = useMemo(() => data || [], [data]);

 if (loading) {
  return (
    <div className="flex justify-center items-center h-[80vh] w-full bg-gray-50">
      <Loading />
    </div>
  );
}
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-white shadow-sm rounded-sm p-1.5 border border-gray-200">
            <TestTubeDiagonal size={20} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-bold">Lab Technicians</h2>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-[#506EE4] text-white"
            onClick={handleAdd}
          >
            <Plus size={14} /> Add Lab Technician
          </Button>

          <Button variant="outline" onClick={fetchData}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
        <div className="min-w-[900px]">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-[#F6F7FF]">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "Staff ID",
                  "Certifications",
                  "Status",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-[12px] font-semibold text-[#475467]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {displayData.length > 0 ? (
                  displayData.map((item) => (
                    <motion.tr
                      key={item.id}
                      className="border-t hover:bg-[#FBFBFF]"
                    >
                      <td className="px-4 py-3 text-[12px] font-medium">
                        {item.labtech_name}
                      </td>

                      <td className="px-4 py-3 text-[12px]">
                        {item.labtech_email}
                      </td>

                      <td className="px-4 py-3 text-[12px]">
                        {item.labtech_phone || "-"}
                      </td>

                      <td className="px-4 py-3 text-[12px]">
                         {item.staff_profiles?.employee_code || "-"}
                      </td>

                      <td className="px-4 py-3 text-[12px]">
                        {Array.isArray(item.certifications)
                          ? item.certifications.join(", ")
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-[12px]">
                        {item.is_active ? "Active" : "Inactive"}
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(item.id)}
                        >
                          <Edit2 size={14} />
                        </Button>

                        {item.is_active ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRestore(item.id)}
                          >
                            <RotateCw size={14} />
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4">
                      No data
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
  <p className="text-xs text-gray-500">
    Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} lab technicians
  </p>

  <div className="flex items-center gap-2">
    {/* LIMIT SELECT */}
    <Select
      value={String(limit)}
      onValueChange={(value) => {
        setLimit(Number(value));
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="h-8 w-[110px] text-xs bg-white">
        <SelectValue placeholder="Items per page" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5">5 / page</SelectItem>
        <SelectItem value="10">10 / page</SelectItem>
        <SelectItem value="20">20 / page</SelectItem>
      </SelectContent>
    </Select>

    {/* PREVIOUS */}
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="text-xs"
    >
      <ChevronLeft />
    </Button>

    {/* PAGE NUMBERS */}
    <div className="flex items-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i}
          size="sm"
          variant={currentPage === i + 1 ? "default" : "outline"}
          onClick={() => setCurrentPage(i + 1)}
          className={`text-xs ${
            currentPage === i + 1 ? "bg-[#0E1680] text-white" : ""
          }`}
        >
          {i + 1}
        </Button>
      ))}
    </div>

    {/* NEXT */}
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        setCurrentPage((p) => Math.min(p + 1, totalPages))
      }
      disabled={currentPage === totalPages}
      className="text-xs"
    >
      <ChevronRight />
    </Button>
  </div>
</div>
    </motion.div>
  );
}

export default LabTechnicianList;