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
  Clock,
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
import doctorsService from "../../service/doctorsService.js";
import DoctorScheduleModal from "./DoctorScheduleModal.jsx";
import Loading from "../Loading.jsx";

const DEFAULT_LIMIT = 10;

function DoctorList() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchDoctors(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch on pagination / limit / sort changes
  useEffect(() => {
    fetchDoctors(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, sortBy, sortOrder]);

  // Robust response parser
  const robustParseDoctorsResponse = (res) => {
    if (!res) return { rows: [], total: 0 };

    const top = res.data?.data ?? res;
    if (top?.data?.data && Array.isArray(top.data.data)) {
      return { rows: top.data.data, total: top.data.total ?? 0 };
    }

    if (top?.data && Array.isArray(top.data)) {
      return { rows: top.data, total: top.total ?? top.data.length ?? 0 };
    }

    if (Array.isArray(top)) {
      return { rows: top, total: top.length };
    }

    return { rows: [], total: 0 };
  };

  // Fetch doctors
  const fetchDoctors = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await doctorsService.getAllDoctors(params);
      const { rows, total: totalVal } = robustParseDoctorsResponse(res);

      setDoctors(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch doctors");
      setDoctors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleAddDoctor = () => navigate("/doctors/create");
  const handleEditDoctor = (id) => navigate(`/doctors/edit/${id}`);

  // Delete & restore
  const handleDeleteDoctor = async (id) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    try {
      setLoading(true);
      await doctorsService.deleteDoctor(id);
      toast.success("Doctor deleted");
      fetchDoctors(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDoctor = async (id) => {
    if (!confirm("Restore this doctor?")) return;
    try {
      setLoading(true);
      await doctorsService.restoreDoctor(id);
      toast.success("Doctor restored");
      fetchDoctors(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to restore doctor");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayDoctors = useMemo(() => doctors || [], [doctors]);

  // Animation variants
  const tableVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const rowVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.4 },
    }),
  };

  // -------------------------
  // IMPORTANT: show full-screen Loading while loading is true,
  // so animations only run after loading becomes false.
  // -------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gray-50">
        <Loading />
      </div>
    );
  }

  // Main animated UI mounts only after loading === false
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="p-2 sm:p-2 w-full h-full flex flex-col overflow-hidden text-sm relative"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
      >
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white shadow-sm rounded-sm p-1.5 border border-gray-200"
          >
            <BriefcaseMedical size={20} className="inline-block text-gray-600" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Doctors</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-3 items-center w-full sm:w-auto"
        >
          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] hover:text-white text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddDoctor}
          >
            <Plus size={14} /> Add Doctor
          </Button>

          <Button
            variant="outline"
            className="h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchDoctors(currentPage)}
          >
            <RefreshCw size={14} /> Refresh
          </Button>
        </motion.div>
      </motion.div>

      {/* Table */}
      <motion.div variants={tableVariant} initial="hidden" animate="visible" className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[900px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    {[
                      "Doctor Name",
                      "Email",
                      "Phone",
                      "Department",
                      "Designation",
                      "Specialties",
                      "Fee",
                      "Actions",
                    ].map((header, idx) => (
                      <th key={idx} className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>
                    {displayDoctors.length > 0 ? (
                      displayDoctors.map((d, i) => (
                        <motion.tr
                          key={d.id}
                          custom={i}
                          variants={rowVariant}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: 20 }}
                          className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                        >
                          <td className="px-4 py-3 text-[12px] font-medium text-gray-800">{d.doctor_name || "—"}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-700">{d.doctor_email || "—"}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-700">{d.doctor_phone || "—"}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-700">{d.staff_profiles?.department?.name || "—"}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-700">{d.staff_profiles?.designation?.title || "—"}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-700">
                            {Array.isArray(d.specialties) ? d.specialties.join(", ") : "—"}
                          </td>
                          <td className="px-4 py-3 text-[12px] text-gray-700">₹{d.consultation_fee || 0}</td>

                          <td className="px-4 py-3">
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-[12px] px-2 rounded border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                                onClick={() => handleEditDoctor(d.id)}
                              >
                                <Edit2 size={14} />
                              </Button>

                              <Button
                                variant="outline"
                                size="icon"
                                className="text-xs px-2 rounded border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                                onClick={() => {
                                  setSelectedDoctor(d);
                                  setShowScheduleModal(true);
                                }}
                                title="Manage Schedule"
                              >
                                <Clock size={14} />
                              </Button>

                              {d.is_active ? (
                                <Button variant="ghost" size="icon" className="text-xs px-2 rounded" onClick={() => handleDeleteDoctor(d.id)} title="Delete">
                                  <Trash2 size={14} />
                                </Button>
                              ) : (
                                <Button variant="ghost" className="text-xs px-2 rounded" onClick={() => handleRestoreDoctor(d.id)} title="Restore">
                                  <RotateCw size={14} />
                                </Button>
                              )}
                            </motion.div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
                          No doctors found.
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pagination */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} doctors</p>

        <div className="flex items-center gap-2">
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

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="text-xs">
            <ChevronLeft />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} size="sm" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)} className={`text-xs ${currentPage === i + 1 ? "bg-[#0E1680] text-white" : ""}`}>
                {i + 1}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="text-xs">
            <ChevronRight />
          </Button>
        </div>
      </motion.div>

      {/* Animated Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && selectedDoctor && (
          <motion.div
            key="doctor-modal"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
          >
            <DoctorScheduleModal
              doctor={selectedDoctor}
              onClose={(updated) => {
                setShowScheduleModal(false);
                setSelectedDoctor(null);
                if (updated) fetchDoctors(currentPage);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DoctorList;
