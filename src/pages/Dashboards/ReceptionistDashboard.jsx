import React, { useState, useEffect } from 'react';
import StatCard from '../../components/DashboardWidgets/StatCard';
import RecentTableCard from '../../components/DashboardWidgets/RecentTableCard';
import { StatSkeleton } from '../../components/DashboardWidgets/SkeletonLoaders';
import { Users, CalendarPlus, UserCheck, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appointmentsService from '../../service/appointmentsService';

export default function ReceptionistDashboard() {
  const [loading, setLoading] = useState(true);
  const [todayAppts, setTodayAppts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
         await new Promise(res => setTimeout(res, 800));
         const appts = await appointmentsService.getAllAppointments({ limit: 8 });
         setTodayAppts(appts?.data?.data || appts?.data || []);
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, []);

  const apptColumns = [
    { key: 'appointment_no', label: 'Appt No' },
    { key: 'patient', label: 'Patient Name', render: (r) => r.patient ? `${r.patient.first_name} ${r.patient.last_name}` : 'Unknown' },
    { key: 'doctor', label: 'Doctor', render: (r) => r.doctor?.doctor_name || '—' },
    { key: 'scheduled_time', label: 'Time' },
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
            <h1 className="text-2xl font-bold text-gray-800">Front Desk Snapshot</h1>
            <p className="text-sm text-gray-500">Manage patient queues and walk-ins.</p>
         </div>
         <div className="flex gap-2">
            <button onClick={() => navigate('/appointment/create')} className="px-4 py-2 bg-indigo-600 text-white rounded shadow text-sm hover:bg-indigo-700 transition">
              + Book Appt
            </button>
            <button onClick={() => navigate('/patients/create')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded shadow-sm text-sm hover:bg-gray-50 transition">
              + Walk-in Patient
            </button>
         </div>
       </div>

       {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Expected Today" value={42} icon={<CalendarPlus size={24} className="text-indigo-500" />} bgClass="bg-indigo-50/50" />
            <StatCard title="Walk-ins Registered" value={14} icon={<UserCheck size={24} className="text-emerald-500" />} bgClass="bg-emerald-50/50" />
            <StatCard title="Waiting in Queue" value={8} icon={<Users size={24} className="text-orange-500" />} bgClass="bg-orange-50/50" />
            <StatCard title="Completed Billing" value={21} icon={<IndianRupee size={24} className="text-blue-500" />} bgClass="bg-blue-50/50" />
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <RecentTableCard 
                title="Today's Appointment Schedule" 
                columns={apptColumns} 
                data={todayAppts} 
                onActionClick={(row) => navigate(`/overview/${row.patient_id}?appointmentId=${row.id}`)}
             />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
             <ul className="space-y-4">
               <li>
                  <button onClick={() => navigate('/admissions')} className="w-full text-left px-4 py-3 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-sm transition">
                    Manage Admissions
                  </button>
               </li>
               <li>
                  <button onClick={() => navigate('/pos-billing')} className="w-full text-left px-4 py-3 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm transition">
                    Initiate Billing
                  </button>
               </li>
             </ul>
          </div>
       </div>
    </div>
  );
}
