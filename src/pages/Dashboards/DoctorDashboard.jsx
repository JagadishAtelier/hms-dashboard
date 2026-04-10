import React, { useState, useEffect } from 'react';
import StatCard from '../../components/DashboardWidgets/StatCard';
import ChartCard from '../../components/DashboardWidgets/ChartCard';
import RecentTableCard from '../../components/DashboardWidgets/RecentTableCard';
import { StatSkeleton } from '../../components/DashboardWidgets/SkeletonLoaders';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appointmentsService from '../../service/appointmentsService';

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [todayAppts, setTodayAppts] = useState([]);
  const navigate = useNavigate();

  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', consultations: 12 }, { day: 'Tue', consultations: 19 },
    { day: 'Wed', consultations: 15 }, { day: 'Thu', consultations: 10 },
    { day: 'Fri', consultations: 22 }, { day: 'Sat', consultations: 8 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
         // Get today's start and end date logic handled by backend mostly
         // Or mock for now
         await new Promise(res => setTimeout(res, 800));
         const appts = await appointmentsService.getAllAppointments({ limit: 5 });
         setTodayAppts(appts?.data?.data || appts?.data || []);
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, []);

  const apptColumns = [
    { key: 'scheduled_time', label: 'Time' },
    { key: 'patient', label: 'Patient Name', render: (r) => r.patient ? `${r.patient.first_name} ${r.patient.last_name}` : 'Unknown' },
    { key: 'visit_type', label: 'Type' },
  ];

  const labColumns = [
    { key: 'patient', label: 'Patient', render: (r) => "John Doe" },
    { key: 'test', label: 'Test Name', render: () => "Complete Blood Count" },
    { key: 'status', label: 'Status', render: () => <span className="text-orange-600 font-semibold text-xs">Pending Review</span> }
  ];

  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
            <p className="text-sm text-gray-500">Your daily schedule and patient insights.</p>
         </div>
       </div>

       {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Today's Appts" value={todayAppts.length ? todayAppts.length : 14} icon={<Clock size={24} className="text-indigo-500" />} bgClass="bg-indigo-50/50" />
            <StatCard title="Assigned Patients" value="342" icon={<Users size={24} className="text-blue-500" />} bgClass="bg-blue-50/50" />
            <StatCard title="Pending Lab Reports" value="5" icon={<Activity size={24} className="text-orange-500" />} bgClass="bg-orange-50/50" />
            <StatCard title="Prescriptions Issued" value="89" icon={<FileText size={24} className="text-emerald-500" />} bgClass="bg-emerald-50/50" />
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <RecentTableCard 
                title="Today's Schedule (Queue)" 
                columns={apptColumns} 
                data={todayAppts} 
                onActionClick={(row) => navigate(`/overview/${row.patient_id}?appointmentId=${row.id}`)}
            />
            <RecentTableCard 
                title="Pending Lab Reports" 
                columns={labColumns} 
                data={[{id: 1}, {id: 2}]} 
                onActionClick={() => navigate(`/lab-result`)}
            />
          </div>
          
          <div className="flex flex-col gap-6">
             <ChartCard title="Weekly Consultations">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                     <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                     <Bar dataKey="consultations" fill="#6366f1" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </ChartCard>

             <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex flex-col gap-3">
                   <button onClick={() => navigate('/patient-list')} className="w-full text-left px-4 py-3 rounded bg-gray-50 hover:bg-indigo-50 border border-gray-100 transition">
                      <span className="font-semibold text-gray-800 block text-sm">Add Prescription</span>
                      <span className="text-xs text-gray-500">Search patient to prescribe</span>
                   </button>
                   <button onClick={() => navigate('/patient-list')} className="w-full text-left px-4 py-3 rounded bg-gray-50 hover:bg-blue-50 border border-gray-100 transition">
                      <span className="font-semibold text-gray-800 block text-sm">Update Diagnosis</span>
                      <span className="text-xs text-gray-500">Update clinical notes</span>
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
