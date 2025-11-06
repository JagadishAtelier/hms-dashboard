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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/Context/SidebarContext";
import patientService from "../service/patientService.js";
import { toast } from "sonner";

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

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchPatients(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    fetchPatients(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, filterGender, filterBloodGroup, isActiveFilter, sortBy, sortOrder]);

  const robustParsePatientsResponse = (res) => {
    // Try common shapes used in your project
    // 1) { status: 'success', data: { data: rows, total } }
    // 2) { data: { data: rows, total } }
    // 3) { data: rows, total }
    // 4) array
    // 5) { total, data }
    if (!res) return { rows: [], total: 0 };

    // prefer res.data
    const top = res?.data ?? res;

    // case: res.data.data (paginated)
    if (top?.data && Array.isArray(top.data)) {
      const rows = top.data;
      const totalVal = top.total ?? top.count ?? top.totalItems ?? top.totalRecords ?? rows.length;
      return { rows, total: totalVal };
    }

    // case: res.data = { data: { data: [], total } } (double-nested)
    if (top?.data?.data && Array.isArray(top.data.data)) {
      const rows = top.data.data;
      const totalVal = top.data.total ?? top.total ?? rows.length;
      return { rows, total: totalVal };
    }

    // case: res.data is array
    if (Array.isArray(top)) {
      return { rows: top, total: top.length };
    }

    // case: res.data.rows or res.rows
    if (top?.rows && Array.isArray(top.rows)) {
      return { rows: top.rows, total: top.total ?? top.count ?? top.totalRecords ?? top.rows.length };
    }

    // case: res.data is object representing single patient (rare)
    if (top?.id && top?.first_name) {
      return { rows: [top], total: 1 };
    }

    // fallback: if top.data is object with keys
    if (top?.data && !Array.isArray(top.data) && typeof top.data === "object") {
      // try to extract nested arrays
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
          isActiveFilter === "active" ? true : isActiveFilter === "inactive" ? false : undefined,
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
    // try to open overview on right context if sidebar available
    try {
      if (setMode) setMode("view");
      if (setSelectedPatientId) setSelectedPatientId(id);
      if (setActiveLink) setActiveLink("patient overview");
    } catch (err) {
      // ignore
    }
    navigate(`/patients/view/${id}`);
  };

  const handleDeletePatient = async (id) => {
    if (!confirm("Are you sure you want to delete this patient? This will soft-delete the patient.")) return;
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
  };

  const handleRestorePatient = async (id) => {
    if (!confirm("Restore this patient?")) return;
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
  };

  // Pagination math
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);

  // derived friendly list
  const displayPatients = useMemo(() => patients || [], [patients]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
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

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm bg-[#fff] border border-gray-300 rounded-lg shadow-[0_0_8px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">🧾 Patients</h2>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
          </div>


          <Button
            className="bg-[#506EE4] text-white h-[36px] flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddPatient}
            aria-label="Add Patient"
          >
            <Plus size={14} /> Add Patient
          </Button>

        </div>
      </div>

      {/* Table desktop */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[800px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("patient_code")}
                    >
                      Code {sortBy === "patient_code" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("last_name")}
                    >
                      Patient {sortBy === "last_name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Gender</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
                        Loading patients...
                      </td>
                    </tr>
                  ) : displayPatients.length > 0 ? (
                    displayPatients.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800 text-xs">{p.patient_code || "—"}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">
                          {p.first_name} {p.last_name || ""}
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{p.phone || "—"}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{p.email || "—"}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{p.gender || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {p.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">

                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleEditPatient(p.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {p.is_active ? (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleDeletePatient(p.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleRestorePatient(p.id)}
                                title="Restore"
                              >
                                <RotateCw size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
                        No patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3 mt-3">
          {loading ? (
            <p className="text-center text-gray-500 text-xs">Loading patients...</p>
          ) : displayPatients.length > 0 ? (
            displayPatients.map((p) => (
              <article key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div>
                    <p className="font-semibold text-[#0E1680] text-sm">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-600 mt-1">{p.patient_code || "—"}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 text-[11px] rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[11px] text-gray-500">{p.phone || "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div>
                    <div className="text-[11px] text-gray-500">Email</div>
                    <div className="text-sm">{p.email || "—"}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">Blood</div>
                    <div className="text-sm">{p.blood_group || "—"}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-[11px] text-gray-500">Address</div>
                    <div className="text-xs text-gray-700">{p.address || "—"}</div>
                  </div>

                  <div className="col-span-2 flex gap-2 mt-2">
                    <Button className="bg-[#0E1680] text-white w-1/3 text-sm" onClick={() => handleViewPatient(p.id)}>View</Button>
                    <Button className="w-1/3" variant="outline" onClick={() => handleEditPatient(p.id)}><Edit2 size={14} /></Button>
                    {p.is_active ? (
                      <Button className="w-1/3" variant="ghost" onClick={() => handleDeletePatient(p.id)}><Trash2 size={14} /></Button>
                    ) : (
                      <Button className="w-1/3" variant="ghost" onClick={() => handleRestorePatient(p.id)}><RotateCw size={14} /></Button>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500 text-xs">No patients found.</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} patients
        </p>

        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 text-xs border rounded px-2 bg-white"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="text-xs"><ChevronLeft /></Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className={`text-xs ${currentPage === i + 1 ? "bg-[#506EE4] text-white" : ""}`}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="text-xs"><ChevronRight /></Button>
        </div>
      </div>
    </div>
  );
}

export default PatientsList;
