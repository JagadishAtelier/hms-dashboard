import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import adminDashboardService from "../../service/admindashboardService";
import StatCard from "@/components/StatCard";
import { Link } from "react-router-dom";
import AdmittedPatientsChart from "@/components/ui/AdmittedPatientsChart";
import AdmissionsDonutChart from "@/components/AdmissionsDonutChart";
import { Eye } from "lucide-react";
import RevenueOverviewCard from "@/components/RevenueOverviewCard";
import OpdAppointmentsTrend from "@/components/OpdAppointmentsTrend";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminDashboardService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="p-4 space-y-8 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className="bg-white shadow-sm p-5 rounded-xl flex items-center justify-between border-l-4 border-gray-200"
              >
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                </div>
                <div className="p-3 bg-gray-100 rounded-full h-10 w-10"></div>
              </div>
            ))}
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 text-lg">
        No dashboard data found
      </div>
    );

  const { summary, admitted_day_wise, recent_admitted } = data;

  const stats = [
    {
      title: "Total Patients",
      total: 284,
      percentage: 1.2,
      active: 254,
      inactive: 30,
      icon: (
        <img
          src="/dashoard-icon/activepatients.png"
          alt="Available Beds"
          className="w-9 h-9 object-contain"
        />
      ),
      color: "#2563EB",
    },
    {
      title: "Total Revenue",
      total: 5000,
      percentage: 0.8,
      active: 40,
      inactive: 10,
      icon: (
        <img
          src="/dashoard-icon/totalrevenue.png"
          alt="Available Beds"
          className="w-9 h-9 object-contain"
        />
      ),
      color: "#EA580C",
    },
    {
      title: "Appointments",
      total: 12000,
      percentage: 2.5,
      active: 80,
      inactive: 20,
      icon: (
        <img
          src="/dashoard-icon/totalappointments.png"
          alt="Available Beds"
          className="w-9 h-9 object-contain"
        />
      ),
      color: "#16A34A",
    },
    {
      title: "Available beds",
      total: 7800,
      percentage: 1.1,
      active: 55,
      inactive: 12,
      icon: (
        <img
          src="/dashoard-icon/availablebeds.png"
          alt="Available Beds"
          className="w-9 h-9 object-contain"
        />
      ),
      color: "#9333EA",
    },
  ];

  return (
    <div className="p-3 sm:p-4 space-y-8">
      {/* ✅ Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
            Admin Dashboard
          </h1>
          <Breadcrumb className="mb-2 sm:mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
          <Link
            to="/patients/create"
            className="text-sm bg-[#506EE4] py-2 px-3 text-white shadow-sm rounded-sm"
          >
            Add Patient
          </Link>
          <Link
            to="/admission/create"
            className="text-sm bg-[#E9EDF4] py-2 px-3 text-gray-700 shadow-sm rounded-sm"
          >
            Add Admission
          </Link>
        </div>
      </div>

      {/* ✅ Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* ✅ Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
        <div className="lg:col-span-7 w-full">
          <div className="overflow-x-auto">
            <AdmittedPatientsChart admitted_day_wise={admitted_day_wise} />
          </div>
        </div>
        <div className="lg:col-span-3">
          <AdmissionsDonutChart
            data={[
              { label: "Male", value: 140, fill: "#6366f1" },
              { label: "Female", value: 110, fill: "#EAB300" },
              { label: "Children", value: 50, fill: "#E82646" },
            ]}
          />
        </div>
      </div>

      {/* ✅ Recent Admissions Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Recent Admissions
          </h3>

          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            <Select defaultValue="all-wards">
              <SelectTrigger className="w-[130px] h-9 border-gray-200">
                <SelectValue placeholder="All Wards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-wards">All Wards</SelectItem>
                <SelectItem value="ward-a">Ward A</SelectItem>
                <SelectItem value="ward-b">Ward B</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-status">
              <SelectTrigger className="w-[130px] h-9 border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="admitted">Admitted</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {recent_admitted.length > 0 ? (
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_admitted.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.patient.patient_code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.patient.avatar ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj8LgZC5q9DKpw9Ueip9qKZM7I3A_1H0WyiA&s"
                          }
                          alt={item.patient.first_name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <span className="font-medium text-gray-800">
                          {item.patient.first_name} {item.patient.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.reason || "—"}</TableCell>
                    <TableCell>
                      {new Date(item.admission_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          item.status === "admitted"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        } text-xs px-3 py-1 rounded-full font-semibold`}
                      >
                        {item.status === "admitted" ? "Admitted" : "Discharged"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/admission/${item.id}`}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        <Eye size={18} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-gray-500 text-center py-6">
              No recent admissions found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 mt-4 gap-3">
          <p>Showing {recent_admitted.length} Entries</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="rounded">
              Prev
            </Button>
            <Button className="bg-blue-800 hover:bg-blue-900 rounded text-white h-8 px-3 text-xs">
              1
            </Button>
            <Button variant="outline" size="sm" className="rounded">
              2
            </Button>
            <Button variant="outline" size="sm" className="rounded">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Revenue & OPD Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
        <div className="lg:col-span-3">
          <RevenueOverviewCard />
        </div>
        <div className="lg:col-span-7">
          <OpdAppointmentsTrend />
        </div>
      </div>
    </div>
  );
}
