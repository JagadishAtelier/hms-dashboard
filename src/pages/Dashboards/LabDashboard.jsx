import React, { useState, useEffect } from 'react';
import StatCard from '../../components/DashboardWidgets/StatCard';
import ChartCard from '../../components/DashboardWidgets/ChartCard';
import RecentTableCard from '../../components/DashboardWidgets/RecentTableCard';
import { StatSkeleton } from '../../components/DashboardWidgets/SkeletonLoaders';
import { Activity, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#14b8a6', '#f59e0b', '#ef4444']; // Completed, Pending, Urgent

export default function LabDashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const testStatusData = [
    { name: 'Completed', value: 45 },
    { name: 'Pending Review', value: 20 },
    { name: 'Urgent', value: 5 },
  ];

  const pendingTests = [
    { id: 1, test_name: 'Complete Blood Count', patient: 'Sarah Jennings', priority: 'Normal', status: 'In Progress' },
    { id: 2, test_name: 'Lipid Profile', patient: 'Marcus Doe', priority: 'Urgent', status: 'Sample Collected' },
    { id: 3, test_name: 'Thyroid Function', patient: 'Alice Smith', priority: 'Normal', status: 'Pending' },
    { id: 4, test_name: 'Liver Function Test', patient: 'John Smith', priority: 'Normal', status: 'In Progress' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const cols = [
    { key: 'test_name', label: 'Test Name' },
    { key: 'patient', label: 'Patient' },
    { key: 'priority', label: 'Priority', render: (r) => (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
        {r.priority}
      </span>
    )},
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Laboratory Dashboard</h1>
            <p className="text-sm text-gray-500">Track and upload lab reports efficiently.</p>
         </div>
       </div>

       {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Tests Today" value={70} icon={<Activity size={24} className="text-indigo-500" />} bgClass="bg-indigo-50/50" />
            <div onClick={() => navigate('/lab-tech-prescriptions?status=completed')} className="cursor-pointer">
               <StatCard title="Completed" value={45} icon={<CheckCircle size={24} className="text-emerald-500" />} bgClass="bg-emerald-50/50 hover:ring-2 hover:ring-emerald-300 transition-all" />
            </div>
            <div onClick={() => navigate('/lab-tech-prescriptions?status=pending')} className="cursor-pointer">
               <StatCard title="Pending Review" value={20} icon={<FileText size={24} className="text-yellow-500" />} bgClass="bg-yellow-50/50 hover:ring-2 hover:ring-yellow-300 transition-all" />
            </div>
            <StatCard title="Urgent Tests" value={5} icon={<AlertTriangle size={24} className="text-red-500" />} bgClass="bg-red-50/50" />
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <RecentTableCard 
                title="Pending & Urgent Lab Tests" 
                columns={cols} 
                data={pendingTests} 
                onActionClick={() => navigate('/lab-tech-prescriptions')}
             />
          </div>
          
          <ChartCard title="Daily Output Status">
             <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie data={testStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {testStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="flex justify-center gap-4 text-xs mt-2">
                 {testStatusData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></span>
                        {d.name}
                    </div>
                 ))}
             </div>
          </ChartCard>
       </div>
    </div>
  );
}
