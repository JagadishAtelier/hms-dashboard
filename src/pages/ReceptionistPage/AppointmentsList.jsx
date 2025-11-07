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
  CalendarRange,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/Context/SidebarContext";
import appointmentsService from "../../service/appointmentsService.js";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * AppointmentsList.jsx
 * - Uses appointmentsService.getAllAppointments({ page, limit, search, status, doctor_id, start_date, end_date, visit_type, sort_by, sort_order })
 * - Adjust styles/classes to your project theme if needed
 */

const DEFAULT_LIMIT = 10;

function AppointmentsList() {
  const navigate = useNavigate();
  const { setMode, setSelectedPatientId, setActiveLink } = useSidebar();

  // Data + UI state
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterVisitType, setFilterVisitType] = useState("");
  const [filterDoctorId, setFilterDoctorId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Sorting
  const [sortBy, setSortBy] = useState("scheduled_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Debounce search input (simple)
  useEffect(() => {
    const t = setTimeout(() => fetchAppointments(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch on mount & when filters change
  useEffect(() => {
    fetchAppointments(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    limit,
    filterStatus,
    filterVisitType,
    filterDoctorId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  // Main fetch function
  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        status: filterStatus || undefined,
        visit_type: filterVisitType || undefined,
        doctor_id: filterDoctorId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const res = await appointmentsService.getAllAppointments(params);

      // Service returns { status, data } or structured response
      // We handle both shapes: { status: 'success', data: {...} } or raw { data: rows, total, ... }
      if (res?.status === "success" && res?.data) {
        // If your API returns paginated shape under res.data
        const payload = res.data;
        if (payload?.data) {
          setAppointments(payload.data);
          setTotal(
            payload.total || payload.totalItems || payload.totalRecords || 0
          );
        } else if (Array.isArray(payload)) {
          setAppointments(payload);
          setTotal(payload.length);
        } else {
          // fallback
          setAppointments(Array.isArray(res.data) ? res.data : []);
          setTotal(Array.isArray(res.data) ? res.data.length : 0);
        }
      } else if (res?.data && Array.isArray(res.data)) {
        setAppointments(res.data);
        setTotal(res.total || res.count || res?.data?.length || 0);
      } else if (res?.data?.data) {
        // sometimes nested
        setAppointments(res.data.data);
        setTotal(res.data.total || 0);
      } else if (res?.data) {
        // fallback if API returns { total, data }
        setAppointments(res.data || []);
        setTotal(res.total || 0);
      } else if (res?.data === undefined && Array.isArray(res)) {
        setAppointments(res);
        setTotal(res.length);
      } else {
        // default fallback
        setAppointments([]);
        setTotal(0);
      }

      // If page changed by filter, reset current page
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error(
        err.response?.data?.message || "Failed to fetch appointments"
      );
      setAppointments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Action: Take for Consultation -> navigate to overview with appointmentId & set sidebar
  const handleTakeForConsultation = (appointment) => {
    const patientId = appointment?.patient?.id || appointment?.patient_id;
    const appointmentId = appointment?.id;

    if (!patientId || !appointmentId) {
      console.warn("Missing patient or appointment ID:", appointment);
      toast.error("Missing patient or appointment data");
      return;
    }

    try {
      if (setMode) setMode("edit");
      if (setSelectedPatientId) setSelectedPatientId(patientId);
      if (setActiveLink) setActiveLink("edit overview");
    } catch (err) {
      console.warn("Sidebar context unavailable:", err);
    }

    navigate(`/overview/${patientId}?appointmentId=${appointmentId}`);
  };

  // Action: Edit appointment (navigate to appointment edit page)
  const handleEditAppointment = (appointmentId) => {
    navigate(`/appointments/edit/${appointmentId}`);
  };

  // Action: Cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      setLoading(true);
      await appointmentsService.cancelAppointment(appointmentId);
      toast.success("Appointment cancelled");
      fetchAppointments(currentPage);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to cancel appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  // New: Navigate to Add Appointment page
  const handleAddAppointment = () => {
    navigate("/appointment/create");
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(total, currentPage * limit);

  // Derived UI-friendly appointments (ensure patient fields exist)
  const displayAppointments = useMemo(() => appointments || [], [appointments]);

  // Small helper to format date
  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  // Toggle sort (simple cycle)
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  return (
    <div className="p-2 sm:p-2 w-full h-full flex flex-col overflow-hidden text-smrounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
              <CalendarRange className="text-gray-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                Appointments
              </h2>
              <p className="text-xs text-gray-500">
                Manage appointments — use filters to narrow results
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <Input
              type="search"
              placeholder="Search name, ID or appointment no"
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
            <SelectTrigger className="h-9 w-full sm:w-auto text-sm border border-gray-200 bg-white rounded-md shadow-sm hover:bg-gray-50 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>

            <SelectContent className="rounded-md shadow-md border border-gray-100 bg-white text-sm">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* ADD APPOINTMENT BUTTON */}
          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] hover:text-white text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleAddAppointment}
            aria-label="Add Appointment"
          >
            <Plus size={14} /> Add Appointment
          </Button>

          <Button
            className="bg-[#506EE4] hover:bg-[#3f56c2] hover:text-white text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchAppointments(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-md bg-white">
            <div className="min-w-[600px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">
                      Appt No
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">
                      Code
                    </th>
                    <th
                      className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467] cursor-pointer flex items-center justify-center"
                      onClick={() => toggleSort("scheduled_at")}
                      title={`Sort by ${
                        sortOrder === "ASC" ? "descending" : "ascending"
                      }`}
                    >
                      Date{" "}
                      {sortBy === "scheduled_at" ? (
                        sortOrder === "ASC" ? (
                          <ChevronUp size={12} className="inline-block" />
                        ) : (
                          <ChevronDown size={12} className="inline-block" />
                        )
                      ) : (
                        ""
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467] cursor-pointer"
                      onClick={() => toggleSort("scheduled_time")}
                    >
                      Time{" "}
                      {sortBy === "scheduled_time"
                        ? sortOrder === "ASC"
                          ? "↑"
                          : "↓"
                        : ""}
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#475467]">
                      Visit
                    </th>
                    <th className="px-4 py-3 text-center text-[10px]   font-semibold text-[#475467]">
                      Status
                    </th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Action</th> */}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="py-4 text-center text-gray-500 text-xs"
                      >
                        Loading appointments...
                      </td>
                    </tr>
                  ) : displayAppointments.length > 0 ? (
                    displayAppointments.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-center font-medium text-gray-800 text-[10px]">
                          {item.appointment_no}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 text-[10px]">
                          {item.patient
                            ? `${item.patient.first_name} ${item.patient.last_name}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 text-[10px]">
                          {item.patient?.patient_code || "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 text-[10px]">
                          {formatDate(item.scheduled_at)}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 text-[10px]">
                          {item.scheduled_time || "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 text-[10px]">
                          {item.doctor?.doctor_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.visit_type === "OPD"
                                ? "bg-blue-100 text-blue-700"
                                : item.visit_type === "teleconsult"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.visit_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.status === "Confirmed"
                                ? "bg-green-100 text-green-700"
                                : item.status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        {/* <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button className="bg-[#0E1680] text-white text-xs h-7 px-2 rounded" onClick={() => handleTakeForConsultation(item)}>Consultation</Button>
                            <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => handleEditAppointment(item.id)}>
                              <Edit2 size={14} />
                            </Button>
                            {item.status !== "Cancelled" && (
                              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => handleCancelAppointment(item.id)} title="Cancel appointment">
                                <X size={14} />
                              </Button>
                            )}
                          </div>
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={11}
                        className="py-4 text-center text-gray-500 text-[10px]"
                      >
                        No appointments found.
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
            <p className="text-center text-gray-500 text-xs">
              Loading appointments...
            </p>
          ) : displayAppointments.length > 0 ? (
            displayAppointments.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div>
                    <p className="font-semibold text-[#0E1680] text-sm">
                      {item.appointment_no}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.patient
                        ? `${item.patient.first_name} ${item.patient.last_name}`
                        : "—"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 text-[11px] rounded-full ${
                        item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {item.scheduled_time || "—"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div>
                    <div className="text-[11px] text-gray-500">Code</div>
                    <div className="text-sm">
                      {item.patient?.patient_code || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">Doctor</div>
                    <div className="text-sm">
                      {item.doctor?.doctor_name || "—"}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-[11px] text-gray-500">Reason</div>
                    <div className="text-xs text-gray-700">
                      {item.reason || "—"}
                    </div>
                  </div>

                  {item.notes && (
                    <div className="col-span-2">
                      <div className="text-[11px] text-gray-500">Notes</div>
                      <div className="text-xs text-gray-700">{item.notes}</div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <Button
                      className="bg-[#0E1680] text-white w-full mt-3 text-sm"
                      onClick={() => handleTakeForConsultation(item)}
                    >
                      Consultation
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500 text-xs">
              No appointments found.
            </p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
        <p className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIndex}-{endIndex} of {total}{" "}
          appointments
        </p>

        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs border border-gray-200 bg-white rounded shadow-sm hover:bg-gray-50 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>

            <SelectContent className="rounded-md shadow-md border border-gray-100 bg-white text-xs">
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
    </div>
  );
}

export default AppointmentsList;
