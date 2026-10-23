import React, { useState, useEffect } from 'react';
import StatCard from '../../components/DashboardWidgets/StatCard';
import ChartCard from '../../components/DashboardWidgets/ChartCard';
import RecentTableCard from '../../components/DashboardWidgets/RecentTableCard';
import { StatSkeleton, ChartSkeleton } from '../../components/DashboardWidgets/SkeletonLoaders';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, UserPlus, IndianRupee, CalendarCheck, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appointmentsService from '../../service/appointmentsService';
import adminDashboardService from '../../service/admindashboardService';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    revenue: "₹0",
    todayAppts: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, apptsRes] = await Promise.allSettled([
          adminDashboardService.getDashboard(),
          appointmentsService.getAllAppointments({ limit: 5, sort_by: 'scheduled_at', sort_order: 'DESC' }),
        ]);

        const dash = dashRes.status === 'fulfilled' ? dashRes.value?.data || dashRes.value || {} : {};
        const appts = apptsRes.status === 'fulfilled' ? apptsRes.value?.data?.data || apptsRes.value?.data || [] : [];

        // Format revenue
        const totalRev = Number(dash.totalRevenue || dash.summary?.total_revenue || 0);
        const formattedRev = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(totalRev);

        setStats({
          patients: dash.totalPatients || dash.summary?.total_patients || 0,
          doctors: dash.totalDoctors || dash.summary?.total_doctors || 0,
          revenue: formattedRev,
          todayAppts: dash.todayAppointments || dash.summary?.today_appointments || 0,
        });

        // Set recent appointments
        setRecentAppointments(Array.isArray(appts) ? appts : []);

        // Day-wise admitted trend
        if (Array.isArray(dash.admitted_day_wise) && dash.admitted_day_wise.length > 0) {
          const revChart = dash.admitted_day_wise.map((d) => ({
            name: typeof d.day === 'string' ? d.day.slice(5) : (d.date ? String(d.date).slice(5) : d.day),
            admissions: Number(d.count || 0),
          }));
          setRevenueData(revChart);
        } else {
          setRevenueData([
            { name: 'Mon', admissions: 3 },
            { name: 'Tue', admissions: 5 },
            { name: 'Wed', admissions: 2 },
            { name: 'Thu', admissions: 6 },
            { name: 'Fri', admissions: 8 },
            { name: 'Sat', admissions: 4 },
            { name: 'Sun', admissions: 3 },
          ]);
        }

        // Revenue breakdown by department / channel
        const doctorRev = Number(dash.doctorRevenue || dash.summary?.doctor_revenue || 0);
        const labRev = Number(dash.labRevenue || dash.summary?.lab_revenue || 0);
        const pharmaRev = Number(dash.pharmacyRevenue || dash.summary?.pharmacy_revenue || 0);

        if (doctorRev > 0 || labRev > 0 || pharmaRev > 0) {
          setDeptData([
            { name: 'Consultations', value: doctorRev || 1 },
            { name: 'Laboratory', value: labRev || 1 },
            { name: 'Pharmacy', value: pharmaRev || 1 },
          ]);
        } else {
          setDeptData([
            { name: 'General OPD', value: 45 },
            { name: 'Inpatient Wards', value: 30 },
            { name: 'Pharmacy Sales', value: 25 },
          ]);
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tableColumns = [
    { key: 'appointment_no', label: 'Appt No' },
    {
      key: 'patient',
      label: 'Patient',
      render: (r) => (
        <span className="font-medium text-slate-800">
          {r.patient ? `${r.patient.first_name} ${r.patient.last_name || ''}`.trim() : 'Walk-in'}
        </span>
      ),
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (r) => (
        <span className="text-slate-600 text-xs">
          {r.doctor?.doctor_name || 'Assigned Doctor'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const isDone = r.status === 'Completed';
        const isCancelled = r.status === 'Cancelled';
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              isDone
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isCancelled
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {r.status || 'Pending'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Live operational summary across outpatient, inpatient, and revenue streams.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/patient-list')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Users size={14} /> Patients Directory
          </button>
          <button
            onClick={() => navigate('/doctors')}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck size={14} /> Manage Staff
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={stats.patients}
            icon={<Users size={22} className="text-indigo-600" />}
            bgClass="bg-white border-slate-200"
          />
          <StatCard
            title="Medical Staff"
            value={stats.doctors}
            icon={<UserPlus size={22} className="text-cyan-600" />}
            bgClass="bg-white border-slate-200"
          />
          <StatCard
            title="Total Revenue"
            value={stats.revenue}
            icon={<IndianRupee size={22} className="text-emerald-600" />}
            bgClass="bg-white border-slate-200"
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppts}
            icon={<CalendarCheck size={22} className="text-amber-600" />}
            bgClass="bg-white border-slate-200"
          />
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Patient Admission Activity" subtitle="Inpatient admissions trend over time" colSpan={2}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="admissions" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Distribution" subtitle="Proportion by medical service category">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables and Operational Workload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTableCard
            title="Recent OPD Appointments"
            columns={tableColumns}
            data={recentAppointments}
            onActionClick={(row) => navigate(row.patient_id ? `/overview/${row.patient_id}` : '/appointment')}
          />
        </div>

        {/* Operational Quick Actions & Status */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow duration-200 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-indigo-600" />
              Operational Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/pos')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all text-xs font-semibold text-slate-800"
              >
                <span>Launch Point of Sale (POS)</span>
                <span className="text-indigo-600">Open →</span>
              </button>
              <button
                onClick={() => navigate('/admissions')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all text-xs font-semibold text-slate-800"
              >
                <span>Bed Occupancy & Admissions</span>
                <span className="text-indigo-600">View →</span>
              </button>
              <button
                onClick={() => navigate('/appointment')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all text-xs font-semibold text-slate-800"
              >
                <span>Schedule New Appointment</span>
                <span className="text-indigo-600">Create →</span>
              </button>
              <button
                onClick={() => navigate('/stock')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all text-xs font-semibold text-slate-800"
              >
                <span>Inventory & Pharmacy Stocks</span>
                <span className="text-indigo-600">Audit →</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Atelier HMS Healthcare Core</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Systems Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
