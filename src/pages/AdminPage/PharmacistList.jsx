import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, RotateCw, RefreshCw, Pill } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import pharmacistsService from "../../service/pharmacistsService.js";
import Loading from "../Loading.jsx";

const DEFAULT_LIMIT = 10;

export default function PharmacistList() {
  const navigate = useNavigate();
  const [pharmacists, setPharmacists] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => { fetchPharmacists(currentPage); }, [currentPage, limit]);

  const fetchPharmacists = async (page = 1) => {
    setLoading(true);
    try {
      const res = await pharmacistsService.getAllPharmacists({ page, limit });
      const payload = res?.data?.data ?? res?.data ?? res;
      if (payload?.data && Array.isArray(payload.data)) {
        setPharmacists(payload.data);
        setTotal(payload.total || 0);
      } else if (Array.isArray(payload)) {
        setPharmacists(payload);
        setTotal(payload.length);
      } else {
        setPharmacists([]);
        setTotal(0);
      }
      setCurrentPage(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch pharmacists");
      setPharmacists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this pharmacist?")) return;
    try {
      await pharmacistsService.deletePharmacist(id);
      toast.success("Pharmacist deleted");
      fetchPharmacists(currentPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleRestore = async (id) => {
    if (!confirm("Restore this pharmacist?")) return;
    try {
      await pharmacistsService.restorePharmacist(id);
      toast.success("Pharmacist restored");
      fetchPharmacists(currentPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Restore failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const display = useMemo(() => pharmacists || [], [pharmacists]);

  if (loading) return <div className="flex justify-center items-center h-[80vh] bg-gray-50"><Loading /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="p-0 sm:p-2 w-full h-full flex flex-col overflow-hidden text-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-white shadow-sm rounded-sm p-1.5 border border-gray-200">
            <Pill size={20} className="text-gray-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Pharmacists</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm" onClick={() => navigate("/pharmacists/create")}>
            <Plus size={14} /> Add Pharmacist
          </Button>
          <Button variant="outline" className="h-9 flex items-center gap-2 text-sm" onClick={() => fetchPharmacists(currentPage)}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {/* DESKTOP VIEW */}
<div className="hidden md:block">
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[900px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    {["Name", "Email", "Phone", "Department", "Designation", "License No", "Store Location", "Status", "Actions"].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {display.length > 0 ? display.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-[#FBFBFF] transition-colors border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-[12px] font-medium text-gray-800">{p.pharmacist_name || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{p.pharmacist_email || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{p.pharmacist_phone || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{p.staff_profiles?.department?.name || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{p.staff_profiles?.designation?.title || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{p.license_no || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{p.store_location || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${p.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {p.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="border-gray-200 hover:bg-indigo-50 hover:text-indigo-600" onClick={() => navigate(`/pharmacists/edit/${p.id}`)}>
                              <Edit2 size={14} />
                            </Button>
                            {p.is_active ? (
                              <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(p.id)}>
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="hover:bg-green-50 hover:text-green-600" onClick={() => handleRestore(p.id)}>
                                <RotateCw size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr><td colSpan={9} className="py-4 text-center text-gray-500 text-xs">No pharmacists found.</td></tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
             {/* TABLET VIEW */}
{/* <div className="hidden md:block lg:hidden">
  <div className="overflow-x-auto rounded-md border bg-white">
    <table className="w-full">
      <thead className="bg-[#F6F7FF]">
        <tr>
          {["Name", "Email", "Phone", "Department", "Status"].map((h, i) => (
            <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-[#475467]">
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {display.map((p) => (
          <tr key={p.id} className="border-t">
            <td className="px-3 py-2 text-xs">{p.pharmacist_name}</td>
            <td className="px-3 py-2 text-xs">{p.pharmacist_email}</td>
            <td className="px-3 py-2 text-xs">{p.pharmacist_phone}</td>
            <td className="px-3 py-2 text-xs">
              {p.staff_profiles?.department?.name}
            </td>
            <td className="px-3 py-2 text-xs">
              {p.is_active ? "Active" : "Inactive"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div> */}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3 mt-3">
          {display.length > 0 ? display.map((p) => (
            <article key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-[#0E1680] text-sm">{p.pharmacist_name || "—"}</p>
                  <p className="text-xs text-gray-500">{p.pharmacist_email || "—"}</p>
                </div>
                <span className={`px-2 py-0.5 text-[11px] rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {p.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mb-3">
                <div><div className="text-[11px] text-gray-500">Phone</div>{p.pharmacist_phone || "—"}</div>
                <div><div className="text-[11px] text-gray-500">License</div>{p.license_no || "—"}</div>
                <div><div className="text-[11px] text-gray-500">Store</div>{p.store_location || "—"}</div>
                <div><div className="text-[11px] text-gray-500">Department</div>{p.staff_profiles?.department?.name || "—"}</div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 h-8 text-xs bg-[#506EE4] text-white" onClick={() => navigate(`/pharmacists/edit/${p.id}`)}>Edit</Button>
                {p.is_active
                  ? <Button variant="outline" className="flex-1 h-8 text-xs text-red-600 border-red-200" onClick={() => handleDelete(p.id)}>Delete</Button>
                  : <Button variant="outline" className="flex-1 h-8 text-xs text-green-600 border-green-200" onClick={() => handleRestore(p.id)}>Restore</Button>
                }
              </div>
            </article>
          )) : <p className="text-center text-gray-500 text-xs">No pharmacists found.</p>}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} pharmacists</p>
        <div className="flex items-center gap-2">
          <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-[110px] text-xs bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft /></Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} size="sm" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)} className={`text-xs ${currentPage === i + 1 ? "bg-[#0E1680] text-white" : ""}`}>{i + 1}</Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight /></Button>
        </div>
      </div>
    </motion.div>
  );
}
