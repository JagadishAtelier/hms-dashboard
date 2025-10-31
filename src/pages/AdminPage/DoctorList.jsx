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
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import doctorsService from "../../service/doctorsService.js";
import DoctorScheduleModal from "./DoctorScheduleModal.jsx";

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

  // Fetch on search
  useEffect(() => {
    const t = setTimeout(() => fetchDoctors(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch on pagination or sorting
  useEffect(() => {
    fetchDoctors(currentPage);
  }, [currentPage, limit, sortBy, sortOrder]);

  // ✅ Parse backend response safely
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

  // ✅ Fetch Doctors
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

  // ✅ Navigation handlers
  const handleAddDoctor = () => navigate("/doctors/create");
  const handleEditDoctor = (id) => navigate(`/doctors/edit/${id}`);

  // ✅ Delete & Restore
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

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">🩺 Doctors</h2>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <Button
            className="bg-green-600 text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
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
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[900px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("doctor_name")}
                    >
                      Doctor Name{" "}
                      {sortBy === "doctor_name" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Designation
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Specialties
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Fee
                    </th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Status
                    </th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
                        Loading doctors...
                      </td>
                    </tr>
                  ) : displayDoctors.length > 0 ? (
                    displayDoctors.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">
                          {d.doctor_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {d.doctor_email || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {d.doctor_phone || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {d.staff_profiles?.department?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {d.staff_profiles?.designation?.title || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {Array.isArray(d.specialties)
                            ? d.specialties.join(", ")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          ₹{d.consultation_fee || 0}
                        </td>
                        {/* <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              d.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {d.is_active ? "Active" : "Inactive"}
                          </span>
                        </td> */}
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {/* Edit */}
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => handleEditDoctor(d.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {/* Schedule */}
                            <Button
                              variant="outline"
                              className="text-xs h-7 px-2 rounded"
                              onClick={() => {
                                setSelectedDoctor(d);
                                setShowScheduleModal(true);
                              }}
                              title="Manage Schedule"
                            >
                              <Clock size={14} />
                            </Button>

                            {/* Delete / Restore */}
                            {d.is_active ? (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleDeleteDoctor(d.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                className="text-xs h-7 px-2 rounded"
                                onClick={() => handleRestoreDoctor(d.id)}
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
                        No doctors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} doctors
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
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="text-xs"
          >
            <ChevronLeft />
          </Button>

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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* ✅ Schedule Modal */}
      {showScheduleModal && selectedDoctor && (
        <DoctorScheduleModal
          doctor={selectedDoctor}
          onClose={(updated) => {
            setShowScheduleModal(false);
            setSelectedDoctor(null);
            if (updated) fetchDoctors(currentPage);
          }}
        />
      )}
    </div>
  );
}

export default DoctorList;
