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
//import accountantsService from "../../service/accountantsService.js";
import Loading from "../Loading.jsx";
import accountantsService from "../../service/accountantsService.js";
const DEFAULT_LIMIT = 10;

function AccountantList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Fetch
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
     const res = await accountantsService.getAllAccountants({
  page,
  limit,
});

      const rows = res?.data?.data?.data || [];
      const totalVal = res?.data?.data?.total || 0;

      setData(rows);
      setTotal(totalVal);
      setCurrentPage(page);
    } catch (err) {
      toast.error("Failed to fetch accountants");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, limit]);

  const handleDelete = async (id) => {
    if (!confirm("Delete accountant?")) return;
    try {
      await accountantsService.deleteAccountant(id);
      toast.success("Deleted");
      fetchData(currentPage);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleRestore = async (id) => {
    try {
      await accountantsService.restoreAccountant(id);
      toast.success("Restored");
      fetchData(currentPage);
    } catch {
      toast.error("Restore failed");
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
      className="p-3 sm:p-4 w-full max-w-full mx-auto flex flex-col text-sm"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-white shadow-sm p-1.5 border">
            <BriefcaseMedical size={20} />
          </div>
          <h2 className="text-xl font-bold">Accountants</h2>
        </div>

       <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            className="bg-[#506EE4] text-white"
            onClick={() => navigate("/accountant/create")}
          >
            <Plus size={14} /> Add Accountant
          </Button>

          <Button variant="outline" onClick={() => fetchData(currentPage)}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* TABLE */}
      {/* DESKTOP TABLE */}
<div className="hidden md:block overflow-auto border rounded-md bg-white">
  <table className="w-full">
    <thead className="bg-[#F6F7FF] sticky top-0 z-10">
      <tr>
        {[
          "Accountant Name",
          "Email",
          "Phone",
          "Department",
          "Designation",
          "Ledger Code",
          "Status",
          "Actions",
        ].map((h, i) => (
          <th
            key={i}
            className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {displayData.map((a) => (
        <tr key={a.id} className="border-t hover:bg-gray-50">
          <td className="px-4 py-3">{a.accountant_name}</td>
          <td className="px-4 py-3">{a.accountant_email}</td>
          <td className="px-4 py-3">{a.accountant_phone}</td>
          <td className="px-4 py-3">
            {a.staff_profiles?.department?.name}
          </td>
          <td className="px-4 py-3">
            {a.staff_profiles?.designation?.title}
          </td>
          <td className="px-4 py-3">{a.ledger_code || "-"}</td>
          <td className="px-4 py-3">
            {a.is_active ? "Active" : "Inactive"}
          </td>

          <td className="px-4 py-3 flex gap-2">
            <Button
  size="icon"
  variant="outline"
  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
>
  <Edit2 size={14} />
</Button>

            {a.is_active ? (
              <Button
  size="icon"
  variant="outline"
  className="bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 border-gray-200"
>
  <Trash2 size={14} />
</Button>
            ) : (
              <Button size="icon" onClick={() => handleRestore(a.id)}>
                <RotateCw size={14} />
              </Button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
{/* MOBILE / TABLET VIEW */}
<div className="md:hidden space-y-3">
  {displayData.length > 0 ? (
    displayData.map((a) => (
      <div
        key={a.id}
        className="w-full border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800 text-sm">
            {a.accountant_name}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded ${
              a.is_active
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {a.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="text-xs text-gray-600">
          📧 {a.accountant_email}
        </p>
        <p className="text-xs text-gray-600">
          📞 {a.accountant_phone}
        </p>
        <p className="text-xs text-gray-600">
          🏥 {a.staff_profiles?.department?.name}
        </p>
        <p className="text-xs text-gray-600">
          💼 {a.staff_profiles?.designation?.title}
        </p>
        <p className="text-xs text-gray-600">
          🧾 {a.ledger_code || "-"}
        </p>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-3 justify-start">
         <Button
  size="icon"
  variant="outline"
  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
>
  <Edit2 size={14} />
</Button>
          {a.is_active ? (
           <Button
  size="icon"
  variant="outline"
  className="bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 border-gray-200"
>
  <Trash2 size={14} />
</Button>
          ) : (
            <Button size="icon" onClick={() => handleRestore(a.id)}>
              <RotateCw size={14} />
            </Button>
          )}
        </div>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500 text-sm">
      No accountants found
    </p>
  )}
</div>
      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.max(p - 1, 1))
            }
          >
            <ChevronLeft />
          </Button>

          <Button
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default AccountantList;