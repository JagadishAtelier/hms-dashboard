import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Plus,
  LogOut,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import admissionsService from "../../service/addmissionsService.js";
import DischargedPatients from "./DischargedPatients.jsx"; // ✅ Import discharge form

const DEFAULT_LIMIT = 10;

function AdmissionsList() {
  const navigate = useNavigate();

  const [admissions, setAdmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [sortBy, setSortBy] = useState("admission_date");
  const [sortOrder, setSortOrder] = useState("DESC");

  // ✅ New modal states
  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => fetchAdmissions(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchAdmissions(currentPage);
  }, [currentPage, limit, filterStatus, sortBy, sortOrder]);

  const fetchAdmissions = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        status: filterStatus || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const res = await admissionsService.getAllAdmissions(params);

      if (res?.status === "success" && res?.data?.data) {
        const payload = res.data;
        setAdmissions(payload.data || []);
        setTotal(payload.total || 0);
      } else {
        setAdmissions([]);
        setTotal(0);
      }

      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching admissions:", err);
      toast.error(err.response?.data?.message || "Failed to fetch admissions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmission = () => {
    navigate("/admission/create");
  };

  // ✅ Updated discharge handler — opens modal
  const handleDischarge = (admissionId) => {
    setSelectedAdmissionId(admissionId);
    setShowDischargeForm(true);
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);

  const displayAdmissions = useMemo(() => admissions || [], [admissions]);

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
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
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
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            🏥 Admissions
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <Input
              type="search"
              placeholder="Search patient or ward"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          <select
            className="h-9 border px-3 rounded-md bg-white w-full sm:w-auto text-sm"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="admitted">Admitted</option>
            <option value="transferred">Transferred</option>
            <option value="discharged">Discharged</option>
          </select>

          <Button
            className="bg-[#506EE4] text-white h-9 flex justify-center items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddAdmission}
          >
            <Plus size={14} /> Add Admission
          </Button>

          <Button
            className="bg-[#506EE4] text-white h-9 flex justify-center items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchAdmissions(1)}
          >
            <RefreshCw size={14} /> 
          </Button>
        </div>
      </div>

      {/* Table View */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 bg-[#F6F7FF] z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                    Code
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer"
                    onClick={() => toggleSort("admission_date")}
                  >
                    Admission Date{" "}
                    {sortBy === "admission_date"
                      ? sortOrder === "ASC"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                    Ward
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                    Room / Bed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                    Admitted By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                    Status
                  </th>
                  {/* ✅ Action Column */}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 text-center text-gray-500 text-xs"
                    >
                      Loading admissions...
                    </td>
                  </tr>
                ) : displayAdmissions.length > 0 ? (
                  displayAdmissions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100 hover:bg-[#FBFBFF]"
                    >
                      <td className="px-4 py-3 text-xs text-gray-800 font-medium">
                        {item.patient
                          ? `${item.patient.first_name} ${item.patient.last_name}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {item.patient?.patient_code || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {formatDate(item.admission_date)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {item.ward?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {item.room?.room_no || "—"} / {item.bed?.bed_no || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {item.admittedBy?.username || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            item.status === "admitted"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "transferred"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.status === "discharged"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* ✅ Action Button */}
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {item.status !== "discharged" ? (
                          <button
                            onClick={() => handleDischarge(item.id)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            title="Discharge Patient"
                          >
                            <LogOut size={14} /> Discharge
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 text-center text-gray-500 text-xs"
                    >
                      No admissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3 mt-3">
          {loading ? (
            <p className="text-center text-gray-500 text-xs">
              Loading admissions...
            </p>
          ) : displayAdmissions.length > 0 ? (
            displayAdmissions.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-[#0E1680] text-sm">
                      {item.patient
                        ? `${item.patient.first_name} ${item.patient.last_name}`
                        : "—"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.patient?.patient_code || "—"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[11px] rounded-full ${
                      item.status === "admitted"
                        ? "bg-blue-100 text-blue-700"
                        : item.status === "transferred"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.status === "discharged"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div>
                    <div className="text-[11px] text-gray-500">Ward</div>
                    <div>{item.ward?.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">Room / Bed</div>
                    <div>
                      {item.room?.room_no || "—"} / {item.bed?.bed_no || "—"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[11px] text-gray-500">Reason</div>
                    <div>{item.reason || "—"}</div>
                  </div>
                </div>

                {/* ✅ Mobile Discharge Button */}
                {item.status !== "discharged" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() => handleDischarge(item.id)}
                  >
                    <LogOut size={12} className="mr-1" /> Discharge
                  </Button>
                )}
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500 text-xs">
              No admissions found.
            </p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} admissions
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
                  currentPage === i + 1 ? "bg-[#506EE4] text-white" : ""
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

      {/* ✅ Modal for Discharge Form */}
      {showDischargeForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative p-4">
            <button
              onClick={() => setShowDischargeForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
            <DischargedPatients
              admissionId={selectedAdmissionId}
              onSuccess={() => {
                setShowDischargeForm(false);
                fetchAdmissions(currentPage);
              }}
              onCancel={() => setShowDischargeForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdmissionsList;
