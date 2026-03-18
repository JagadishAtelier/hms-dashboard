import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/Context/SidebarContext";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import appointmentService from "../../service/appointmentsService";
import patientService from "../../service/patientService.js";

const baseTableHead = [
    "Patient Name",
    "Appointment No",
    "Date",
    "Reason",
    "Status",
    "Assigned Doctor",
    "Visit Type",
];

function PatientAppointmentList() {
    const navigate = useNavigate();
    const { setMode, setActiveLink, setSelectedPatientId } = useSidebar();

    const [role, setRole] = useState("");
    const [contact, setContact] = useState(null);
    const [appointments, setAppointments] = useState([]);

    // ✅ Get role
    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
    }, []);

    // ✅ Get logged-in user contact
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setContact({
                email: user.email,
                phone: user.phone,
            });
        }
    }, []);

    // ✅ Fetch patient + appointments
    useEffect(() => {
        if (!contact) return;

        const fetchData = async () => {
            try {
                const patientRes = await patientService.getByEmailOrPhone(contact);
                const patientData = patientRes?.data;

                if (!patientData?.id) return;

                const appointmentRes = await appointmentService.getByPatientId(patientData.id);
                const appointmentData = appointmentRes?.data || [];

                setAppointments(appointmentData);
                console.log("Appointments:", appointmentData);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, [contact]);

    // ✅ Handle view
    const handleEdit = (id) => {
        setMode("edit");
        setSelectedPatientId(id);
        setActiveLink("edit overview");
        navigate(`/overview/${id}`);
    };

    const tableHead =
        role === "doctor" ? [...baseTableHead, "Action"] : baseTableHead;

    return (
        <div className="p-4 my-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Appointments</h2>
            </div>

            <div className="overflow-x-auto max-sm:w-[570px]">
                <Table className="min-w-[570px] rounded-2xl overflow-hidden border border-gray-200">
                    
                    {/* ✅ Table Header */}
                    <TableHeader>
                        <TableRow className="bg-[#E5E7FB] hover:bg-[#E5E7FB]">
                            {tableHead.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className="py-4 px-2 text-[#475467] whitespace-nowrap"
                                >
                                    {column}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* ✅ Table Body */}
                    <TableBody>
                        {appointments.length > 0 ? (
                            appointments.map((appt, index) => {
                                const fullName = `${appt.patient?.first_name || ""} ${appt.patient?.last_name || ""}`;
                                const patientCode = appt.appointment_no || "-";
                                const gender = appt.reason || "-";
                                const doctorName = appt.doctor?.doctor_name || "-";
                                const serviceType = appt.visit_type || "-";
                                const status = appt.status || "-";

                                const formattedDate = appt.scheduled_at
                                    ? new Date(appt.scheduled_at).toLocaleDateString()
                                    : "-";

                                return (
                                    <TableRow key={index} className="bg-white text-[#475467]">
                                        
                                        {/* Patient Name */}
                                        <TableCell className="font-medium py-4 px-2 whitespace-nowrap">
                                            {fullName}
                                        </TableCell>

                                        {/* Patient ID */}
                                        <TableCell className="px-2">
                                            {patientCode}
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="px-2">
                                            {formattedDate}
                                        </TableCell>

                                        {/* Gender */}
                                        <TableCell className="px-2">
                                            {gender}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="px-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    status === "Completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-purple-100 text-purple-700"
                                                }`}
                                            >
                                                {status}
                                            </span>
                                        </TableCell>

                                        {/* Doctor */}
                                        <TableCell className="px-2">
                                            {doctorName}
                                        </TableCell>

                                        {/* Service */}
                                        <TableCell className="px-2">
                                            {serviceType}
                                        </TableCell>

                                        {/* Action */}
                                        {role === "doctor" && (
                                            <TableCell className="px-2">
                                                <Button
                                                    className="bg-[#0E1680] text-white h-8"
                                                    onClick={() => handleEdit(appt.patient_id)}
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableHead.length} className="text-center py-6 text-gray-500">
                                    No Appointments Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default PatientAppointmentList;