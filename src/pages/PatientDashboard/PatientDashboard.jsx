import React, { useEffect, useState } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    FileText,
    Droplet,
    Activity,
    ChevronRight as ArrowRight,
    Eye
} from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableHeader,
} from "@/components/ui/table";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import patientService from "../../service/patientService.js";

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contact, setContact] = useState(null);

    const query = new URLSearchParams(useLocation().search);
    const appointmentId = query.get("appointmentId");

    // ✅ Get logged-in user contact
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setContact({
                email: user.email,
                phone: user.phone
            });
        }
    }, []);

    // ✅ Fetch Patient + History
    useEffect(() => {
        if (!contact) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const patientRes = await patientService.getByEmailOrPhone(contact);
                const patientData = patientRes?.data;

                if (!patientData?.id) return;

                const historyRes = await patientService.getHistory(patientData.id);
                const rawHistory = historyRes?.data || {};

                const getLatest = (arr, dateField = "createdAt") =>
                    Array.isArray(arr) && arr.length
                        ? [...arr].sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]))[0]
                        : null;

                const formattedHistory = {
                    latestEncounter: getLatest(rawHistory.encounters, "encounter_date"),
                    latestAdmission: getLatest(rawHistory.admissions),
                    latestVital: getLatest(rawHistory.vitals),
                    latestDiagnosis: getLatest(rawHistory.diagnoses),
                    latestAppointment: getLatest(rawHistory.appointments),
                    latestNote: getLatest(rawHistory.clinicalNotes),
                    ...rawHistory,
                };

                setPatient(patientData);
                setHistory(formattedHistory);
                console.log(formattedHistory)
            } catch (err) {
                console.error("Error fetching patient:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [contact]);

    // ✅ Derived Data
    const latestVitals = history?.latestVital;
    const latestDiagnosis = history?.latestDiagnosis;
    const latestNote = history?.latestNote;

    const vitalsChartData = history?.vitals?.map((v) => ({
        name: new Date(v.measured_at).toLocaleDateString(),
        pulse: v.pulse,
        temperature: v.temperature,
        spo2: v.spo2,
    })) || [];

    // ✅ Navigation
    const handleTodayConsultation = () => {
        navigate(`/patient/appointment/create`);
    };

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (!patient) return <p className="text-center mt-10 text-red-500">No patient found</p>;

    return (
        <div className="min-h-screen p-4">
            <div className="mx-auto space-y-6">

                {/* 🔥 ROW 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* SpO2 */}
                    <div className="bg-blue-50 p-6 rounded-xl shadow flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">SpO2</p>
                            <h3 className="text-3xl font-bold">{latestVitals?.spo2 || "--"}%</h3>
                        </div>
                        <div className='bg-white p-2 rounded-full shadow-sm'>
                            <Droplet className="text-blue-500 " size={26} />
                        </div>
                    </div>

                    {/* Temp */}
                    <div className="bg-red-50 p-4 rounded-xl shadow flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Temperature</p>
                            <h3 className="text-3xl font-bold">
                                {latestVitals?.temperature || "--"}°C
                            </h3>
                        </div>
                        <div className='bg-white p-2 rounded-full shadow-sm'>
                            <Activity className="text-red-500" size={26} />
                        </div>
                    </div>

                    {/* Pulse */}
                    <div className="bg-green-50 p-4 rounded-xl shadow flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Pulse</p>
                            <h3 className="text-3xl font-bold">
                                {latestVitals?.pulse || "--"}
                            </h3>
                        </div>
                        <div className='bg-white p-2 rounded-full shadow-sm'>
                            <Activity className="text-green-500" size={26} />
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="bg-purple-50 p-4 rounded-xl shadow flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Diagnosis</p>
                            <p className="text-3xl font-semibold">
                                {latestDiagnosis?.description || "No diagnosis"}
                            </p>
                        </div>
                        <div className='bg-white p-2 rounded-full shadow-sm'>
                            <FileText className="text-purple-500" size={26} />
                        </div>
                    </div>

                </div>

                {/* 🔥 ROW 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ✅ BOOK AN APPOINTMENT CARD */}
                    <div className="bg-[#0077b6] p-8 rounded-3xl shadow-lg flex justify-between items-center relative overflow-hidden min-h-[180px]">

                        {/* Left Content */}
                        <div className="z-10 flex flex-col justify-between h-full">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Book an appointment
                                </h2>
                                <p className="text-blue-100 text-sm mb-6">
                                    Schedule your next virtual or onsite appointment
                                </p>
                            </div>

                            <button
                                onClick={handleTodayConsultation}
                                className="bg-white text-[#0077b6] px-6 py-2 rounded-xl font-bold w-fit transition-transform hover:scale-105 active:scale-95"
                            >
                                Book Now
                            </button>
                        </div>

                        {/* Right Image/Illustration */}
                        <div className="relative w-40 h-40 flex items-end">
                            <img
                                src="https://img.freepik.com/premium-vector/book-doctor-appointment-card-template_151150-11155.jpg?w=2000"
                                alt="doctors"
                                className="w-full h-auto object-contain"
                            />
                            {/* Decorative elements to mimic the background floaties in your image */}
                            <div className="absolute top-0 right-4 bg-red-400 w-4 h-4 rounded-full opacity-50 blur-sm"></div>
                        </div>
                    </div>
                    {/* NOTES */}
                    <div className="bg-green-50 p-6 rounded-2xl shadow">
                        <h3 className="font-semibold mb-2">Notes</h3>
                        <p className="text-sm text-gray-600">
                            {latestNote?.note || "No notes available"}
                        </p>
                    </div>
                </div>


                <div className="">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={18} className="text-indigo-600" />
                            Lab Reports
                        </h3>
                    </div>

                    {history?.labOrders?.length ? (
                        <div className="overflow-x-auto">
                            <Table className="min-w-full rounded-xl overflow-hidden border border-gray-200">

                                {/* Table Head */}
                                <TableHeader>
                                    <TableRow className="bg-[#E5E7FB] hover:bg-[#E5E7FB]">
                                        <TableHead className="py-3 px-4 text-[#475467]">
                                            Order
                                        </TableHead>
                                        <TableHead className="py-3 px-4 text-[#475467]">
                                            Priority
                                        </TableHead>
                                        <TableHead className="py-3 px-4 text-[#475467]">
                                            Date
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                {/* Table Body */}
                                <TableBody>
                                    {history.labOrders.map((order) => (
                                        <TableRow
                                            key={order.id}
                                            className="bg-white hover:bg-gray-50 transition"
                                        >
                                            <TableCell className="px-4 py-4 font-medium text-gray-700">
                                                {order.order_no}
                                            </TableCell>

                                            {/* Priority Badge */}
                                            <TableCell className="px-4 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.priority === "High" || order.priority === "Urgent"
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-purple-100 text-purple-600"
                                                        }`}
                                                >
                                                    {order.priority}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-4 text-gray-600">
                                                {new Date(order.order_date).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-400 text-sm italic">
                                No reports found
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PatientDashboard;