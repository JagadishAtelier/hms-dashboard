// src/pages/patients/PatientsList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Edit2,
  X,
  Plus,
  Trash2,
  Eye,
  RotateCw,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/Context/SidebarContext";
import patientService from "../service/patientService.js";
import { toast } from "sonner";
import Loading from "./Loading.jsx";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const DEFAULT_LIMIT = 10;

function PatientsList() {
  const navigate = useNavigate();
  const { setMode, setSelectedPatientId, setActiveLink } = useSidebar?.() ?? {};

  // Data + UI state
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState(""); // "", "active", "inactive"

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Animation control: key increments when loading finishes so animations replay after loader
  const [animateKey, setAnimateKey] = useState(0);
  useEffect(() => {
    if (!loading) {
      setAnimateKey((k) => k + 1);
    }
  }, [loading]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchPatients(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    fetchPatients(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    limit,
    filterGender,
    filterBloodGroup,
    isActiveFilter,
    sortBy,
    sortOrder,
  ]);

  const robustParsePatientsResponse = (res) => {
    if (!res) return { rows: [], total: 0 };
    const top = res?.data ?? res;

    if (top?.data && Array.isArray(top.data)) {
      const rows = top.data;
      const totalVal =
        top.total ??
        top.count ??
        top.totalItems ??
        top.totalRecords ??
        rows.length;
      return { rows, total: totalVal };
    }

    if (top?.data?.data && Array.isArray(top.data.data)) {
      const rows = top.data.data;
      const totalVal = top.data.total ?? top.total ?? rows.length;
      return { rows, total: totalVal };
    }

    if (Array.isArray(top)) {
      return { rows: top, total: top.length };
    }

    if (top?.rows && Array.isArray(top.rows)) {
      return {
        rows: top.rows,
        total: top.total ?? top.count ?? top.totalRecords ?? top.rows.length,
      };
    }

    if (top?.id && top?.first_name) {
      return { rows: [top], total: 1 };
    }

    if (top?.data && !Array.isArray(top.data) && typeof top.data === "object") {
      const possible = top.data.data || top.data.rows || top.data.patients;
      if (Array.isArray(possible)) {
        return { rows: possible, total: top.data.total ?? possible.length };
      }
    }

    return { rows: [], total: 0 };
  };

  const fetchPatients = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        gender: filterGender || undefined,
        blood_group: filterBloodGroup || undefined,
        is_active:
          isActiveFilter === "active"
            ? true
            : isActiveFilter === "inactive"
              ? false
              : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const res = await patientService.getAllPatients(params);
      const { rows, total: totalVal } = robustParsePatientsResponse(res);

      setPatients(rows || []);
      setTotal(Number(totalVal || 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching patients:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch patients");
      setPatients([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleAddPatient = () => {
    navigate("/patients/create");
  };

  const handleEditPatient = (id) => {
    navigate(`/patients/edit/${id}`);
  };

  const handleViewPatient = (id) => {
    try {
      if (setMode) setMode("view");
      if (setSelectedPatientId) setSelectedPatientId(id);
      if (setActiveLink) setActiveLink("patient overview");
    } catch (err) {
      // ignore
    }
    navigate(`/patients/view/${id}`);
  };

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "destructive",
    onConfirm: null,
  });

  const handleDeletePatient = (id) => {
    setConfirmDialog({
      open: true,
      title: "Delete Patient",
      description: "Are you sure you want to soft-delete this patient record? You can restore it later if needed.",
      confirmText: "Delete Patient",
      variant: "destructive",
      onConfirm: async () => {
        try {
          setLoading(true);
          await patientService.deletePatient(id);
          toast.success("Patient deleted");
          fetchPatients(currentPage);
        } catch (err) {
          console.error(err);
          toast.error(err?.response?.data?.message || "Failed to delete patient");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleRestorePatient = (id) => {
    setConfirmDialog({
      open: true,
      title: "Restore Patient",
      description: "Are you sure you want to restore this patient record?",
      confirmText: "Restore Patient",
      variant: "default",
      onConfirm: async () => {
        try {
          setLoading(true);
          await patientService.restorePatient(id);
          toast.success("Patient restored");
          fetchPatients(currentPage);
        } catch (err) {
          console.error(err);
          toast.error(err?.response?.data?.message || "Failed to restore patient");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Pagination math
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);

  // derived friendly list
  const displayPatients = useMemo(() => patients || [], [patients]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  // Animation variants
  const pageVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const tableTbodyVariant = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };

  const rowVariant = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const mobileListVariant = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const mobileCardVariant = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  // -------------------------
  // Full-screen loader so animations only run after loading finishes
  // -------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gray-50">
        <Loading />
      </div>
    );
  }

  // Main animated UI mounts after loader finishes
  return (
    <motion.div
      key={animateKey}
      initial="hidden"
      animate="visible"
      variants={pageVariant}
      className="w-full h-full flex flex-col overflow-hidden text-sm rounded-lg"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center md:mb-6 mb-4 gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="bg-white shadow-sm rounded-sm p-1.5 border border-gray-200">
            <Users size={20} className="inline-block text-gray-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Patients List</h2>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search Name, Email, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white text-sm"
            />
          </div>

          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 flex items-center gap-2 w-fit ms-auto md:ms-0 sm:w-auto text-sm shadow-xs transition-colors"
            onClick={handleAddPatient}
            aria-label="Add Patient"
          >
            <Plus size={14} /> Add Patient
          </Button>
        </motion.div>
      </motion.div>

      {/* Table desktop */}
      <motion.div variants={pageVariant} initial="hidden" animate="visible" className="flex-1 md:overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
            <div className="min-w-[800px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none"
                      onClick={() => toggleSort("patient_code")}
                    >
                      Code{" "}
                      {sortBy === "patient_code" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none"
                      onClick={() => toggleSort("last_name")}
                    >
                      Patient{" "}
                      {sortBy === "last_name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none"
                      onClick={() => toggleSort("gender")}
                    >
                      Gender{" "}
                      {sortBy === "gender" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>

                <motion.tbody variants={tableTbodyVariant} initial="hidden" animate="visible">
                  {displayPatients.length > 0 ? (
                    displayPatients.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        variants={rowVariant}
                        className="hover:bg-slate-50/70 transition-colors duration-150 border-t border-slate-100"
                      >
                        <td className="px-4 py-3 font-mono text-slate-700 text-xs font-medium">{p.patient_code || "—"}</td>
                        <td className="px-4 py-3 text-slate-900 text-xs font-semibold">
                          <button
                            onClick={() => handleViewPatient(p.id)}
                            className="hover:text-indigo-600 hover:underline text-left cursor-pointer transition-colors"
                            title="View patient profile"
                          >
                            {p.first_name} {p.last_name || ""}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs font-mono">{p.phone || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{p.email || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{p.gender || "—"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.is_active ? "active" : "inactive"} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 items-center">
                            <Button variant="outline" size="icon" className="h-7 w-7 text-xs rounded-md text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => handleViewPatient(p.id)} title="View Profile">
                              <Eye size={13} />
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7 text-xs rounded-md border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => handleEditPatient(p.id)} title="Edit">
                              <Edit2 size={13} />
                            </Button>

                            {p.is_active ? (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-xs rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeletePatient(p.id)} title="Delete">
                                <Trash2 size={13} />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-xs rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => handleRestorePatient(p.id)} title="Restore">
                                <RotateCw size={13} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-[12px]">No patients found.</td>
                    </motion.tr>
                  )}
                </motion.tbody>
              </table>
            </div>
            {/* <div className="hidden md:block lg:hidden overflow-x-auto bg-white border rounded mt-3">
              <table className="w-full">
                <thead className="bg-[#F6F7FF]">
                  <tr>
                    {["Patient", "Phone", "Status"].map((h, i) => (
                      <th key={i} className="px-3 py-2 text-xs font-semibold text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {displayPatients.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2 text-xs">{p.first_name}</td>
                      <td className="px-3 py-2 text-xs">{p.phone}</td>
                      <td className="px-3 py-2 text-xs">
                        {p.is_active ? "Active" : "Inactive"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}
          </div>
        </div>

        {/* Mobile card view */}
        <motion.div className="md:hidden space-y-3 mt-3" variants={mobileListVariant} initial="hidden" animate="visible">
          {displayPatients.length > 0 ? (
            displayPatients.map((p) => (
              <motion.article key={p.id} variants={mobileCardVariant} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div>
                    <button
                      onClick={() => handleViewPatient(p.id)}
                      className="font-semibold text-slate-900 text-sm hover:text-indigo-600 text-left"
                    >
                      {p.first_name} {p.last_name}
                    </button>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{p.patient_code || "—"}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={p.is_active ? "active" : "inactive"} />
                    <span className="text-[11px] text-slate-500 font-mono">{p.phone || "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div>
                    <div className="text-[11px] text-slate-500">Email</div>
                    <div className="text-sm truncate">{p.email || "—"}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500">Blood</div>
                    <div className="text-sm">{p.blood_group || "—"}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-[11px] text-slate-500">Address</div>
                    <div className="text-xs text-slate-600">{p.address || "—"}</div>
                  </div>

                  <div className="col-span-2 flex gap-2 mt-2">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-1/3 text-xs" onClick={() => handleViewPatient(p.id)}>View</Button>
                    <Button className="w-1/3 text-xs" variant="outline" onClick={() => handleEditPatient(p.id)}><Edit2 size={13} /> Edit</Button>
                    {p.is_active ? (
                      <Button className="w-1/3 text-xs text-rose-600 hover:bg-rose-50" variant="ghost" onClick={() => handleDeletePatient(p.id)}><Trash2 size={13} /> Delete</Button>
                    ) : (
                      <Button className="w-1/3 text-xs text-emerald-600 hover:bg-emerald-50" variant="ghost" onClick={() => handleRestorePatient(p.id)}><RotateCw size={13} /> Restore</Button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <p className="text-center text-slate-400 text-xs py-4">No patients found.</p>
          )}
        </motion.div>
      </motion.div>

      {/* Pagination */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-slate-500">Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} patients</p>

        <div className="flex items-center gap-2">
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }} className="h-8 text-xs border border-slate-200 rounded px-2 bg-white">
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="text-xs">
            <ChevronLeft size={14} />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} size="sm" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)} className={`text-xs ${currentPage === i + 1 ? "bg-indigo-600 text-white" : ""}`}>
                {i + 1}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="text-xs">
            <ChevronRight size={14} />
          </Button>
        </div>
      </motion.div>

      {/* Accessible Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        loading={loading}
      />
    </motion.div>
  );
}

export default PatientsList;
