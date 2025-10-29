import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/Context/SidebarContext";
import appointmentsService from "../service/appointmentsService";

function TodayAppointments() {
  const navigate = useNavigate();
  const { setMode, setSelectedPatientId, setActiveLink } = useSidebar();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 7;

  // Fetch Today's Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsService.getTodaysAppointmentsByDoctor();
      if (res?.status === "success" && Array.isArray(res.data)) {
        setAppointments(res.data);
        setCurrentPage(1);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handler: Take for Consultation
  // Handler: Take for Consultation
const handleTakeForConsultation = (appointment) => {
  const patientId = appointment?.patient?.id || appointment?.patient_id;
  const appointmentId = appointment?.id;

  if (!patientId || !appointmentId) {
    console.warn("Missing patient or appointment ID:", appointment);
    return;
  }

  // Set sidebar context for doctor view
  try {
    if (setMode) setMode("edit");
    if (setSelectedPatientId) setSelectedPatientId(patientId);
    if (setActiveLink) setActiveLink("edit overview");
  } catch (err) {
    console.warn("Sidebar context unavailable:", err);
  }

  // ✅ Navigate with both patient ID & appointment ID
  navigate(`/overview/${patientId}?appointmentId=${appointmentId}`);
};


  // Filter + Search Logic
  const filteredData = appointments.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item?.patient?.first_name?.toLowerCase().includes(q) ||
      item?.patient?.last_name?.toLowerCase().includes(q) ||
      item?.appointment_no?.toLowerCase().includes(q) ||
      item?.patient?.patient_code?.toLowerCase().includes(q);

    const matchesFilter = filterStatus ? item.status === filterStatus : true;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Guard currentPage when filtered length changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    // root text-sm reduces most font sizes; adjust specific elements below as needed
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-hidden text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          {/* reduced heading sizes */}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">🩺 Today’s Appointments</h2>
          <p className="text-xs text-gray-500">Showing all appointments scheduled for today</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search by name, ID or appointment no"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>

          <Button
            className="bg-[#0E1680] text-white h-9 flex items-center gap-2 w-full sm:w-auto text-sm"
            onClick={fetchAppointments}
          >
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Main content: table (desktop) + cards (mobile) */}
      <div className="flex-1 overflow-y-auto">
        {/* Advanced Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[900px]">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F6F7FF]">
                  <tr>
                    {/* smaller header font sizes */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Appointment No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Patient Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Patient Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">Scheduled Time</th>
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
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
                        Loading appointments...
                      </td>
                    </tr>
                  ) : currentData.length > 0 ? (
                    currentData.map((item, idx) => (
                      <tr
                        key={item.id ?? idx}
                        className="hover:bg-[#FBFBFF] transition-colors duration-150 border-t border-gray-100"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800 text-xs">{item.appointment_no}</td>

                        <td className="px-4 py-3 text-gray-700 text-xs">
                          {item.patient ? `${item.patient.first_name} ${item.patient.last_name}` : "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-700 text-xs">{item.patient?.patient_code || "—"}</td>

                        <td className="px-4 py-3 text-gray-700 text-xs">{item.scheduled_time || "—"}</td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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

                        <td className="px-4 py-3 text-gray-600 text-xs">{item.reason || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{item.notes || "—"}</td>

                        <td className="px-4 py-3">
                          <Button
                            className="bg-[#0E1680] text-white text-xs h-6 px-2 rounded"
                            onClick={() => handleTakeForConsultation(item)}
                          >
                        Consultation
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500 text-xs">
                        No appointments found for today.
                      </td>
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
              <article
                key={item.id ?? idx}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div>
                    <p className="font-semibold text-[#0E1680] text-sm">{item.appointment_no}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.patient ? `${item.patient.first_name} ${item.patient.last_name}` : "—"}
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
                    <span className="text-[11px] text-gray-500">{item.scheduled_time || "—"}</span>
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
                      <span
                        className={`px-2 py-0.5 text-[11px] rounded ${
                          item.visit_type === "OPD" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.visit_type}
                      </span>
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

                  {/* Take for Consultation button on mobile */}
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
            <p className="text-center text-gray-500 text-xs">No appointments found for today.</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
          <p className="text-xs text-gray-500">
            Showing {filteredData.length === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, filteredData.length)} of {filteredData.length} appointments
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="text-xs"
            >
              <ChevronLeft />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className={`${currentPage === i + 1 ? "bg-[#0E1680] text-white" : ""} text-xs`}
              >
                {i + 1}
              </Button>
            ))}

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
      )}
    </div>
  );
}

export default TodayAppointments;
