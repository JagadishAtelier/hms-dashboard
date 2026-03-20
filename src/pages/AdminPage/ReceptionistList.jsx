import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,UserCog, 
  Trash2,
  RotateCw,
  RefreshCw,Clock,
  BriefcaseMedical,
} from "lucide-react";

import { toast } from "sonner";
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

//  Create service like doctorsService 
//import receptionistService from "../../service/receptionistService.js";
import receptionistsService from "../../service/receptionistsService.js";
const DEFAULT_LIMIT = 10;

function ReceptionistList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Fetch Receptionists
//   const fetchData = async (page = 1) => {
//     setLoading(true);
//     try {
//       const res = await receptionistService.getAll({
//         page,
//         limit,
//         search: searchQuery || undefined,
//       });

//       setData(res?.data || []);
//       setTotal(res?.total || 0);
//       setCurrentPage(page);
//     } catch (err) {
//       toast.error("Failed to fetch receptionist data");
//     } finally {
//       setLoading(false);
//     }
//   };


const fetchData = async () => {
  setLoading(true);
  try {
    const res = await receptionistsService.getAllReceptionists();
   setData(res?.data?.data || []);
setTotal(res?.data?.total || 0);
    setTotal(res?.total || 0);
  } catch (err) {
    toast.error("Failed to fetch receptionists");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
  fetchData();
}, []);

  const handleAdd = () => navigate("/receptionist/create");
  const handleEdit = (id) => navigate(`/receptionist/edit/${id}`);

 const handleDelete = async (id) => {
  if (!confirm("Delete receptionist?")) return;

  try {
    await receptionistsService.deleteReceptionist(id);
    toast.success("Deleted successfully");
    fetchData();
  } catch {
    toast.error("Delete failed");
  }
};
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const displayData = useMemo(() => data || [], [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gray-50">
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
          <motion.div
                     initial={{ rotate: -45, opacity: 0 }}
                     animate={{ rotate: 0, opacity: 1 }}
                     transition={{ duration: 0.8 }}
                     className="bg-white shadow-sm rounded-sm p-1.5 border border-gray-200"
                   >
                     <UserCog size={20} className="inline-block text-gray-600" />
                   </motion.div>
          <h2 className="text-xl font-bold">Receptionists</h2>
        </div>

        <div className="flex gap-2">
           <Button
                      className="bg-[#506EE4] hover:bg-[#3f56c2] hover:text-white text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
                      onClick={handleAdd}>
            <Plus size={14} /> Add Receptionist
          </Button>
          <Button variant="outline" onClick={() => fetchData(currentPage)}>
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
    {["Name", "Email", "Phone", "Role", "Status", "Actions"].map(
      (header, idx) => (
        <th
          key={idx}
          className="px-4 py-3 text-left text-[12px] font-semibold text-[#475467]"
        >
          {header}
        </th>
      )
    )}
  </tr>
</thead>
          <tbody>
            <AnimatePresence>
              {displayData.length > 0 ? (
                displayData.map((item, i) => (
                  <motion.tr
  key={item.id}
  className="border-t border-gray-100 hover:bg-[#FBFBFF] transition-colors duration-150"
>
                    <td className="px-4 py-3 text-[12px] font-medium text-gray-800">
{item.receptionist_name}
</td>

<td className="px-4 py-3 text-[12px] text-gray-700">
  {item.receptionist_email}
</td>

<td className="px-4 py-3 text-[12px] text-gray-700">
  {item.receptionist_phone}
</td>

<td className="px-4 py-3 text-[12px] text-gray-700">
  Receptionist
</td>

<td className="px-4 py-3 text-[12px] text-gray-700">
  {item.is_active ? "Active" : "Inactive"}
</td>
                    <td className="px-4 py-3">
  <div className="flex gap-2">
    
    {/* EDIT */}
    <Button
      size="icon"
      variant="outline"
      className="border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
      onClick={() => handleEdit(item.id)}
    >
      <Edit2 size={14} />
    </Button>

    {/* CLOCK / VIEW 
    <Button
      size="icon"
      variant="outline"
      className="border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
    >
      <Clock size={14} />
    </Button>

    {/* DELETE */}
    <Button
      size="icon"
      variant="ghost"
      className="hover:bg-red-50 hover:text-red-600"
      onClick={() => handleDelete(item.id)}
    >
      <Trash2 size={14} />
    </Button>

  </div>
</td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
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
     {/* Pagination */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3"
>
  <p className="text-xs text-gray-500">
    Showing {total === 0 ? 0 : (currentPage - 1) * limit + 1}-
    {Math.min(total, currentPage * limit)} of {total} receptionists
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
</motion.div>
    </motion.div>
  );
}

export default ReceptionistList;