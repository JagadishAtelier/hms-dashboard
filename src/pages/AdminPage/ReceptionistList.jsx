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
      className="p-3 sm:p-4 w-full max-w-full mx-auto h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
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

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           <Button className="bg-[#506EE4] text-white w-full sm:w-auto hover:bg-[#3f56c2] hover:text-white text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
                      onClick={handleAdd}>
            <Plus size={14} /> Add Receptionist
          </Button>
          <Button variant="outline" onClick={() => fetchData(currentPage)}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      {/* DESKTOP VIEW */}
<div className="hidden lg:block overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
  <div className="min-w-[900px]">
    <table className="w-full table-auto border-collapse">
      <thead className="bg-[#F6F7FF]">
        <tr>
          {["Name", "Email", "Phone", "Role", "Status", "Actions"].map((header, idx) => (
            <th key={idx} className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {displayData.map((item) => (
          <tr key={item.id} className="border-t hover:bg-[#FBFBFF]">
            <td className="px-4 py-3 text-[12px] font-medium">{item.receptionist_name}</td>
            <td className="px-4 py-3 text-[12px]">{item.receptionist_email}</td>
            <td className="px-4 py-3 text-[12px]">{item.receptionist_phone}</td>
            <td className="px-4 py-3 text-[12px]">Receptionist</td>
            <td className="px-4 py-3 text-[12px]">
              {item.is_active ? "Active" : "Inactive"}
            </td>
           <td className="px-4 py-3">
  <div className="flex gap-2">

    {/* EDIT */}
    <Button
      variant="outline"
      size="icon"
      className="bg-[#F1F5F9] border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
      onClick={() => handleEdit(item.id)}
    >
      <Edit2 size={14} />
    </Button>

    {/* CLOCK  
    <Button
      variant="outline"
      size="icon"
      className="bg-[#F1F5F9] border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
    >
      <Clock size={14} />
    </Button>*/}

    {/* DELETE */}
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-500 hover:bg-red-50 hover:text-red-600"
      onClick={() => handleDelete(item.id)}
    >
      <Trash2 size={14} />
    </Button>

  </div>
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
{/* TABLET VIEW */}
<div className="hidden md:block lg:hidden overflow-x-auto border rounded-md bg-white mt-3">
  <table className="w-full">
    <thead className="bg-[#F6F7FF]">
      <tr>
        {["Name", "Email", "Phone", "Status"].map((h, i) => (
          <th key={i} className="px-3 py-2 text-xs font-semibold text-left">
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {displayData.map((item) => (
        <tr key={item.id} className="border-t">
          <td className="px-3 py-2 text-xs">{item.receptionist_name}</td>
          <td className="px-3 py-2 text-xs">{item.receptionist_email}</td>
          <td className="px-3 py-2 text-xs">{item.receptionist_phone}</td>
          <td className="px-3 py-2 text-xs">
            {item.is_active ? "Active" : "Inactive"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
{/* MOBILE VIEW */}
<div className="md:hidden space-y-3 mt-3">
  {displayData.map((item) => (
    <div key={item.id} className="w-full bg-white border border-gray-200 rounded-lg p-3 shadow-sm">

      <div className="flex justify-between mb-2">
        <div>
          <p className="font-semibold text-sm text-[#0E1680]">
            {item.receptionist_name}
          </p>
          <p className="text-xs text-gray-500">
            {item.receptionist_email}
          </p>
        </div>

        <span className={`text-xs px-2 py-1 rounded ${
          item.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}>
          {item.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <p className="text-xs text-gray-600">📞 {item.receptionist_phone}</p>

      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 bg-gray-100" onClick={() => handleEdit(item.id)}>
          Edit
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDelete(item.id)}>
          Delete
        </Button>
      </div>
    </div>
  ))}
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