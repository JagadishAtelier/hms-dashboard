import React,{useState,useEffect} from "react";
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
const baseTableHead = [
  "Patient Name",
  "Patient ID",
  "Date",
  "Sex",
  "Status",
  "Assigned Doctor",
  "Service Type",
];

const allPagesData = [
  {
    name: "John Doe",
    id: "P001",
    date: "2025-10-21",
    sex: "Male",
    status: "Active",
    doctor: "Dr. Priya Mehta",
    service: "Cardiology",
  },
  {
    name: "Aarav Patel",
    id: "P002",
    date: "2025-10-20",
    sex: "Male",
    status: "Active",
    doctor: "Dr. R. Kumar",
    service: "Orthopedics",
  },
  {
    name: "Saanvi Sharma",
    id: "P003",
    date: "2025-10-22",
    sex: "Female",
    status: "Completed",
    doctor: "Dr. Neha Kapoor",
    service: "Neurology",
  },
  {
    name: "Ishaan Verma",
    id: "P004",
    date: "2025-10-23",
    sex: "Male",
    status: "Completed",
    doctor: "Dr. Anil Desai",
    service: "Pediatrics",
  },
  {
    name: "Diya Nair",
    id: "P005",
    date: "2025-10-24",
    sex: "Female",
    status: "Completed",
    doctor: "Dr. Sneha Rao",
    service: "Dermatology",
  },
];

function RecentActivities() {
  const navigate = useNavigate()
    const [role, setRole] = useState("");
    const { setMode, setActiveLink,setSelectedPatientId } = useSidebar();
      useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

    const handleEdit = (id) => {
    setMode("edit"); // switch sidebar mode
    setSelectedPatientId(id);
    setActiveLink("edit overview"); // highlight edit link
    navigate(`/overview/:${id}`); // navigate to overview page
  };

const tableHead = role === "doctor" ? [...baseTableHead, "Action"] : baseTableHead;
  return (
    <div className="my-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <a href="/" className="text-blue-700 underline">
          View All
        </a>
      </div>

      {/* Responsive table wrapper */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="min-w-[570px] rounded-2xl overflow-hidden border border-gray-200">
          <TableHeader>
            <TableRow className="bg-[#E5E7FB] rounded-2xl hover:bg-[#E5E7FB]">
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

          <TableBody>
            {allPagesData.map((patient, index) => (
              <TableRow key={index} className="text-[#475467] bg-white">
                <TableCell className="font-medium py-4 px-2 text-[#475467] whitespace-nowrap">
                  {patient.name}
                </TableCell>
                <TableCell className="px-2">{patient.id}</TableCell>
                <TableCell className="px-2">{patient.date}</TableCell>
                <TableCell className="px-2">{patient.sex}</TableCell>
                <TableCell className="px-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      patient.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {patient.status}
                  </span>
                </TableCell>
                <TableCell className="px-2">{patient.doctor}</TableCell>
                <TableCell className="px-2">{patient.service}</TableCell>
                {role === "doctor" && (
                  <TableCell className="px-2">
                    <Button className="bg-[#0E1680] text-white h-8" onClick={() => handleEdit("P001")}><Eye/></Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="block md:hidden space-y-4">
  {allPagesData.map((patient, index) => (
    <div key={index} className="border p-4 rounded-xl shadow-sm bg-white">
      <p><b>Name:</b> {patient.name}</p>
      <p><b>ID:</b> {patient.id}</p>
      <p><b>Date:</b> {patient.date}</p>
      <p><b>Status:</b> {patient.status}</p>
    </div>
  ))}
</div>
    </div>
  );
}

export default RecentActivities;
