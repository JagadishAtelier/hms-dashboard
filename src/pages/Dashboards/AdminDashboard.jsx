import React, { useState, useEffect } from 'react';
import StatCard from '../../components/DashboardWidgets/StatCard';
import ChartCard from '../../components/DashboardWidgets/ChartCard';
import RecentTableCard from '../../components/DashboardWidgets/RecentTableCard';
import { StatSkeleton, ChartSkeleton } from '../../components/DashboardWidgets/SkeletonLoaders';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, UserPlus, IndianRupee, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appointmentsService from '../../service/appointmentsService';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#14b8a6', '#06b6d4'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const navigate = useNavigate();

  // Mock data for charts
  const revenueData = [
    { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 }, { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 }, { name: 'Jun', revenue: 2390 },
  ];

  const deptData = [
    { name: 'Cardiology', value: 400 }, { name: 'Neurology', value: 300 },
    { name: 'Orthopedics', value: 300 }, { name: 'Pediatrics', value: 200 },
  ];

  useEffect(() => {
    // In a real scenario, this would aggregate data from dashboardService.js
    const fetchData = async () => {
      setLoading(true);
      try {
         // Mock API call delay
         await new Promise(res => setTimeout(res, 800));
         
         const appts = await appointmentsService.getAllAppointments({ limit: 5, sort_by: 'scheduled_at', sort_order: 'DESC' });
         
         setStats({
            patients: 1240,
            doctors: 45,
            revenue: "₹124,500",
            todayAppts: 89
         });
         setRecentAppointments(appts?.data?.data || appts?.data || []);
      } catch (err) {
         console.error("Failed to load admin stats", err);
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tableColumns = [
    { key: 'appointment_no', label: 'Appt ID' },
    { key: 'patient', label: 'Patient Name', render: (r) => r.patient ? `${r.patient.first_name} ${r.patient.last_name}` : 'Unknown' },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {r.status}
      </span>
    )}
  ];

  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
            <p className="text-sm text-gray-500">Welcome back! Here's the latest summary of HMS operations.</p>
         </div>
         <div className="flex gap-2">
            <button onClick={() => navigate('/doctors/create')} className="px-4 py-2 bg-indigo-600 text-white rounded shadow text-sm hover:bg-indigo-700 transition">
              + Add Doctor
            </button>
            <button onClick={() => navigate('/staff/create')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded shadow-sm text-sm hover:bg-gray-50 transition">
              Manage Staff
            </button>
         </div>
       </div>

       {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Patients" value={stats.patients} icon={<Users size={24} className="text-indigo-500" />} bgClass="bg-white" trend={{positive: true, value: 5.2}} />
            <StatCard title="Active Doctors" value={stats.doctors} icon={<UserPlus size={24} className="text-blue-500" />} bgClass="bg-white" trend={{positive: true, value: 2.1}} />
            <StatCard title="Monthly Revenue" value={stats.revenue} icon={<IndianRupee size={24} className="text-emerald-500" />} bgClass="bg-white" trend={{positive: true, value: 12.5}} />
            <StatCard title="Today's Appts" value={stats.todayAppts} icon={<CalendarCheck size={24} className="text-purple-500" />} bgClass="bg-white" trend={{positive: false, value: 1.2}} />
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Revenue Trends" colSpan={2}>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} dot={{r: 4, fill: '#6366f1', strokeWidth: 0}} activeDot={{r: 8}} />
                </LineChart>
             </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Department Distribution">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {deptData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
          </ChartCard>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <RecentTableCard 
                title="Recent Appointments" 
                columns={tableColumns} 
                data={recentAppointments} 
                onActionClick={(row) => navigate(`/overview/${row.patient_id}`)}
             />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">System Alerts</h3>
             <ul className="space-y-4">
               <li className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0"></div>
                  <div><p className="font-semibold text-gray-800">Paracetamol Low Stock</p><p className="text-gray-500">Only 12 boxes left.</p></div>
               </li>
               <li className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-400 shrink-0"></div>
                  <div><p className="font-semibold text-gray-800">Pending Leave Approvals</p><p className="text-gray-500">3 Nurses requested leave.</p></div>
               </li>
               <li className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                  <div><p className="font-semibold text-gray-800">Server Maintainance</p><p className="text-gray-500">Scheduled in 2 days.</p></div>
               </li>
             </ul>
          </div>
       </div>
    </div>
  );
}
