// src/pages/admissions/AdmissionsList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Plus,
  BedDouble,
  LogOut,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import admissionsService from "../../service/addmissionsService.js";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Loading from "../Loading.jsx";
import DischargedPatients from "./DischargedPatients.jsx";
import { motion } from "framer-motion";

const DEFAULT_LIMIT = 10;

export default function AdmissionsList() {
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

  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(null);

  const [animateKey, setAnimateKey] = useState(0);
  useEffect(() => {
    if (!loading) setAnimateKey((k) => k + 1);
  }, [loading]);

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

  const handleAddAdmission = () => navigate("/admission/create");

  const handleDischarge = (admissionId) => {
    setSelectedAdmissionId(admissionId);
    setShowDischargeForm(true);
  };

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

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);
  const displayAdmissions = useMemo(() => admissions || [], [admissions]);

  const pageVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <motion.div
      key={animateKey}
      initial="hidden"
      animate="visible"
      variants={pageVariant}
      className="p-2 sm:p-2 w-full h-full flex flex-col overflow-hidden text-sm rounded-lg"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <BedDouble className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Admissions
            </h2>
            <p className="text-xs text-gray-500">
              Manage patient admissions, transfers, and discharges
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
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

          <Select
            value={filterStatus || "all"}
            onValueChange={(value) => {
              setFilterStatus(value === "all" ? "" : value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-sm w-[150px] bg-white border border-gray-200 rounded-md shadow-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="admitted">Admitted</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddAdmission}
          >
            <Plus size={14} /> Add Admission
          </Button>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchAdmissions(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </motion.div>

      {/* Table (Desktop) */}
      <div className="hidden md:block flex-1 overflow-y-auto">
        <div className="overflow-x-auto rounded-md border border-gray-200 shadow-md bg-white">
          <table className="w-full table-auto border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">Patient</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">Code</th>
                <th
                  className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467] cursor-pointer flex items-center gap-1"
                  onClick={() => toggleSort("admission_date")}
                >
                  Admission Date{" "}
                  {sortBy === "admission_date" ? (
                    sortOrder === "ASC" ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )
                  ) : null}
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">Ward</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">Room / Bed</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">Admitted By</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">Status</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">Action</th>
              </tr>
            </thead>

            <tbody>
              {displayAdmissions.length > 0 ? (
                displayAdmissions.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100 hover:bg-[#FBFBFF] transition-all"
                  >
                    <td className="px-4 py-3 text-[12px] font-medium text-gray-800">
                      {item.patient
                        ? `${item.patient.first_name} ${item.patient.last_name}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {item.patient?.patient_code || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {formatDate(item.admission_date)}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {item.ward?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {item.room?.room_no || "—"} / {item.bed?.bed_no || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {item.admittedBy?.username || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px]">
                      <span
                        className={`px-2.5 py-1.5 uppercase rounded-full text-[12px] font-semibold ${
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
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {item.status !== "discharged" ? (
                        <button
                          onClick={() => handleDischarge(item.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
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
                    className="py-4 text-center text-gray-500 text-[12px]"
                  >
                    No admissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total} admissions
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={limit.toString()}
            onValueChange={(v) => {
              setLimit(Number(v));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs bg-white border border-gray-200 rounded">
              <SelectValue placeholder="Items / page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className={`text-xs rounded ${
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
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* Discharge Modal */}
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
    </motion.div>
  );
}
