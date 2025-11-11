// src/prescription/pages/TodayAppointments.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  CalendarRange,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/Context/SidebarContext";
import appointmentsService from "../service/appointmentsService";
import { toast } from "sonner";
import Loading from "./Loading.jsx";

const DEFAULT_LIMIT = 7;

function TodayAppointments() {
  const navigate = useNavigate();
  const { setMode, setSelectedPatientId, setActiveLink } = useSidebar?.() ?? {};

  // Data + UI
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters / pagination / sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState("scheduled_time");
  const [sortOrder, setSortOrder] = useState("ASC");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchAppointments(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // fetch on mount / when deps change
  useEffect(() => {
    fetchAppointments(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, filterStatus, sortBy, sortOrder]);

  // robust parser to accept different API shapes
  const robustParseAppointmentsResponse = (res) => {
    if (!res) return { rows: [], total: 0, page: 1, limit };
    const top = res?.data ?? res;

    // common paginated shape: { data: { data: rows, total, page, limit } }
    if (top?.data && Array.isArray(top.data)) {
      const rows = top.data;
      const totalVal = top.total ?? top.count ?? rows.length;
      return { rows, total: totalVal, page: top.page ?? 1, limit: top.limit ?? limit };
    }

    // nested: res.data.data
    if (res?.data?.data && Array.isArray(res.data.data)) {
      const rows = res.data.data;
      const totalVal = res.data.total ?? res.total ?? rows.length;
      return { rows, total: totalVal, page: res.data.page ?? 1, limit: res.data.limit ?? limit };
    }

    // raw array
    if (Array.isArray(top)) {
      return { rows: top, total: top.length, page: 1, limit };
    }

    // shape: { rows:[], total }
    if (top?.rows && Array.isArray(top.rows)) {
      return { rows: top.rows, total: top.total ?? top.count ?? top.rows.length, page: top.page ?? 1, limit: top.limit ?? limit };
    }

    // fallback single item
    if (top?.id) {
      return { rows: [top], total: 1, page: 1, limit };
    }

    return { rows: [], total: 0, page: 1, limit };
  };

  // main fetch
  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      // try specialized API for today's appointments first, then fallback to general endpoints
      let res = null;
      if (appointmentsService.getTodaysAppointmentsByDoctor) {
        res = await appointmentsService.getTodaysAppointmentsByDoctor();
      } else if (appointmentsService.getTodaysAppointments) {
        res = await appointmentsService.getTodaysAppointments();
      } else if (appointmentsService.getAllAppointments) {
        // if only generic endpoint exists, pass date filters (service may ignore)
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const start_date = `${yyyy}-${mm}-${dd}`;
        const end_date = start_date;
        res = await appointmentsService.getAllAppointments({
          page,
          limit,
          status: filterStatus || undefined,
          search: searchQuery || undefined,
          start_date,
          end_date,
          sort_by: sortBy,
          sort_order: sortOrder,
        });
      } else if (appointmentsService.list) {
        res = await appointmentsService.list({ page, limit });
      } else {
        throw new Error("No suitable appointmentsService method found");
      }

      const { rows, total: t, page: p, limit: l } = robustParseAppointmentsResponse(res);
      let mapped = (rows || []).map((r) => ({
        ...r,
        appointment_no: r.appointment_no ?? r.id ?? "-",
        patient: r.patient ?? r.patient_info ?? r.customer ?? null,
        scheduled_time: r.scheduled_time ?? r.time ?? r.slot ?? "-",
        scheduled_at: r.scheduled_at ?? r.date ?? null,
        visit_type: r.visit_type ?? r.type ?? "OPD",
        status: r.status ?? "Pending",
      }));

      setAppointments(mapped || []);
      setTotal(Number(t || mapped.length || 0));
      setCurrentPage(Number(p ?? page));
      setLimit(Number(l ?? limit));
    } catch (err) {
      console.error("Error fetching today's appointments:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch today's appointments");
      setAppointments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Action: Take for Consultation
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

  // local filtering (search + status) — happens on already-fetched today's list
  const filteredData = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return (appointments || []).filter((item) => {
      const matchesSearch =
        !q ||
        (item?.patient?.first_name && item.patient.first_name.toLowerCase().includes(q)) ||
        (item?.patient?.last_name && item.patient.last_name.toLowerCase().includes(q)) ||
        (item?.appointment_no && item.appointment_no.toLowerCase().includes(q)) ||
        (item?.patient?.patient_code && item.patient.patient_code.toLowerCase().includes(q));
      const matchesFilter = !filterStatus || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [appointments, searchQuery, filterStatus]);

  // pagination math (client-side paging for today's list)
  const totalPages = Math.max(1, Math.ceil((total || filteredData.length) / limit));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(filteredData.length || total, currentPage * limit);
  const currentData = filteredData.slice((currentPage - 1) * limit, (currentPage - 1) * limit + limit);

  // guard currentPage
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm ">
      {loading && <Loading />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-white shadow-sm rounded-sm p-1.5 border border-gray-200">
              <CalendarRange size={20} className="inline-block text-gray-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Today’s Appointments</h2>
          </div>
          <p className="text-xs text-gray-500">Showing all appointments scheduled for today</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search by name, ID or appointment no"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white h-9 pl-9 text-sm"
            />
          </div>

          <select
            className="h-9 border border-gray-200 px-3 rounded-md bg-white w-full sm:w-auto text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>

          <Button
            className="bg-[#506EE4] text-white h-[36px] flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={() => fetchAppointments(1)}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[900px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Appointment No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Patient Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Patient Code</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-[#475467] cursor-pointer flex items-center gap-1"
                      onClick={() => toggleSort("scheduled_time")}
                    >
                      Scheduled Time {sortBy === "scheduled_time" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Visit Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">Loading appointments...</td>
                    </tr>
                  ) : currentData.length > 0 ? (
                    currentData.map((item, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-800 text-xs">{item.appointment_no}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{item.patient ? `${item.patient.first_name || ""} ${item.patient.last_name || ""}`.trim() : "—"}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{item.patient?.patient_code || "—"}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{item.scheduled_time || formatDate(item.scheduled_at) || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.visit_type === "OPD" ? "bg-blue-100 text-blue-700" : item.visit_type === "teleconsult" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{item.visit_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.status === "Pending" ? "bg-yellow-100 text-yellow-700" : item.status === "Confirmed" ? "bg-green-100 text-green-700" : item.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{item.reason || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{item.notes || "—"}</td>
                        <td className="px-4 py-3">
                          <Button className="bg-[#506EE4] text-white text-xs h-6 px-2 rounded" onClick={() => handleTakeForConsultation(item)}>Consultation</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">No appointments found for today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 mt-3">
          {loading ? (
            <p className="text-center text-gray-500 text-xs">Loading appointments...</p>
          ) : currentData.length > 0 ? (
            currentData.map((item, idx) => (
              <article key={item.id ?? idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div>
                    <p className="font-semibold text-[#0E1680] text-sm">{item.appointment_no}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.patient ? `${item.patient.first_name || ""} ${item.patient.last_name || ""}`.trim() : "—"}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 text-[11px] rounded-full ${item.status === "Pending" ? "bg-yellow-100 text-yellow-700" : item.status === "Confirmed" ? "bg-green-100 text-green-700" : item.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{item.status}</span>
                    <span className="text-[11px] text-gray-500">{item.scheduled_time || formatDate(item.scheduled_at) || "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div>
                    <div className="text-[11px] text-gray-500">Code</div>
                    <div className="text-sm">{item.patient?.patient_code || "—"}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">Visit</div>
                    <div>
                      <span className={`px-2 py-0.5 text-[11px] rounded ${item.visit_type === "OPD" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{item.visit_type}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-[11px] text-gray-500">Reason</div>
                    <div className="text-xs text-gray-700">{item.reason || "—"}</div>
                  </div>

                  {item.notes && (
                    <div className="col-span-2">
                      <div className="text-[11px] text-gray-500">Notes</div>
                      <div className="text-xs text-gray-700">{item.notes}</div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <Button className="bg-[#0E1680] text-white w-full mt-3 text-sm" onClick={() => handleTakeForConsultation(item)}>Consultation</Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500 text-xs">No appointments found for today.</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
          <p className="text-xs text-gray-500">Showing {filteredData.length === 0 ? 0 : startIndex}-{endIndex} of {filteredData.length} appointments</p>

          <div className="flex items-center gap-2">
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }} className="h-8 text-xs border rounded px-2 bg-white">
              <option value={5}>5 / page</option>
              <option value={7}>7 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>

            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="text-xs">
              <ChevronLeft />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} size="sm" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)} className={`text-xs ${currentPage === i + 1 ? "bg-[#506EE4] text-white" : ""}`}>
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="text-xs">
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodayAppointments;
