import React, { useState, useEffect } from 'react';
import StatCard from '../../components/DashboardWidgets/StatCard';
import RecentTableCard from '../../components/DashboardWidgets/RecentTableCard';
import { StatSkeleton } from '../../components/DashboardWidgets/SkeletonLoaders';
import { Users, UserMinus, UserCheck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HRDashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const leaveRequests = [
    { id: 1, employee: 'Dr. Sarah Smith', department: 'Cardiology', days: 2, status: 'Pending Approval' },
    { id: 2, employee: 'Mark Johnson', department: 'Nursing', days: 1, status: 'Pending Approval' },
    { id: 3, employee: 'Elena Rodriguez', department: 'Pharmacy', days: 5, status: 'Pending Approval' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const cols = [
    { key: 'employee', label: 'Employee Name' },
    { key: 'department', label: 'Department' },
    { key: 'days', label: 'Days Requested' },
  ];

  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">HR & Payroll</h1>
            <p className="text-sm text-gray-500">Manage staff attendance, leaves, and payroll.</p>
         </div>
       </div>

       {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Employees" value={214} icon={<Users size={24} className="text-indigo-500" />} bgClass="bg-indigo-50/50" />
            <StatCard title="Active Today" value={198} icon={<UserCheck size={24} className="text-emerald-500" />} bgClass="bg-emerald-50/50" />
            <StatCard title="On Leave Today" value={16} icon={<UserMinus size={24} className="text-orange-500" />} bgClass="bg-orange-50/50" />
            <StatCard title="Pending Payroll" value="2" icon={<CreditCard size={24} className="text-blue-500" />} bgClass="bg-blue-50/50" />
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <RecentTableCard 
                title="Pending Leave Requests" 
                columns={cols} 
                data={leaveRequests} 
                onActionClick={() => navigate('/leave-application')}
             />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
             <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
             
             <button onClick={() => navigate('/hrms')} className="w-full text-left px-5 py-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition flex items-center justify-between">
                <div>
                   <span className="font-semibold text-indigo-900 block text-sm">Add New Employee</span>
                   <span className="text-xs text-indigo-700/80">Onboard a new staff member</span>
                </div>
                <div className="bg-indigo-200 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">+</div>
             </button>

             <button onClick={() => navigate('/salary-config')} className="w-full text-left px-5 py-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition flex items-center justify-between">
                <div>
                   <span className="font-semibold text-emerald-900 block text-sm">Process Payroll</span>
                   <span className="text-xs text-emerald-700/80">Check salary slips and generate</span>
                </div>
                <div className="bg-emerald-200 text-emerald-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">➔</div>
             </button>
             
             <button onClick={() => navigate('/attendance')} className="w-full text-left px-5 py-4 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 transition flex items-center justify-between">
                <div>
                   <span className="font-semibold text-blue-900 block text-sm">Attendance Review</span>
                   <span className="text-xs text-blue-700/80">Check current punch-in data</span>
                </div>
             </button>
          </div>
       </div>
    </div>
  );
}
