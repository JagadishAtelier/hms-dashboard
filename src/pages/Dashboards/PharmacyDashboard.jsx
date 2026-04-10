import React, { useState, useEffect } from 'react';
import StatCard from '../../components/DashboardWidgets/StatCard';
import ChartCard from '../../components/DashboardWidgets/ChartCard';
import RecentTableCard from '../../components/DashboardWidgets/RecentTableCard';
import { StatSkeleton } from '../../components/DashboardWidgets/SkeletonLoaders';
import { Pill, Activity, Receipt, PackageSearch } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function PharmacyDashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const inventoryData = [
    { day: 'Mon', itemsDispensed: 120 }, { day: 'Tue', itemsDispensed: 210 },
    { day: 'Wed', itemsDispensed: 180 }, { day: 'Thu', itemsDispensed: 150 },
    { day: 'Fri', itemsDispensed: 300 }, { day: 'Sat', itemsDispensed: 110 },
  ];

  const prescriptionQueue = [
    { id: 'PR-1029', patient: 'Liam Patel', items: 3, status: 'Pending Review' },
    { id: 'PR-1030', patient: 'Emma Watson', items: 1, status: 'Ready to Dispense' },
    { id: 'PR-1031', patient: 'Chris Evans', items: 5, status: 'Pending Review' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const cols = [
    { key: 'id', label: 'Rx Code' },
    { key: 'patient', label: 'Patient Name' },
    { key: 'items', label: 'Items Count' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Pharmacy Operations</h1>
            <p className="text-sm text-gray-500">Inventory levels and prescription queue.</p>
         </div>
       </div>

       {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Rx to Fulfill" value={28} icon={<Receipt size={24} className="text-indigo-500" />} bgClass="bg-indigo-50/50" />
            <StatCard title="Low Stock Items" value={14} icon={<PackageSearch size={24} className="text-red-500" />} bgClass="bg-red-50/50" />
            <StatCard title="Medicines Dispensed" value={180} icon={<Pill size={24} className="text-emerald-500" />} bgClass="bg-emerald-50/50" />
            <StatCard title="Daily Sales" value="₹1,450" icon={<Activity size={24} className="text-blue-500" />} bgClass="bg-blue-50/50" />
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Weekly Dispense Volume" colSpan={2}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={inventoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorDispensed" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <Tooltip />
                 <Area type="monotone" dataKey="itemsDispensed" stroke="#6366f1" fillOpacity={1} fill="url(#colorDispensed)" />
               </AreaChart>
             </ResponsiveContainer>
          </ChartCard>

          <div className="bg-red-50/50 rounded-lg shadow-sm border border-red-100 p-5 w-full flex flex-col justify-between">
             <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2 whitespace-nowrap">⚠️ Urgent Restocks</h3>
                <p className="text-sm text-red-600 mb-4 whitespace-nowrap lg:whitespace-normal">The following items are critically low on stock.</p>
                <div className="space-y-3">
                   <div className="flex justify-between bg-white px-3 py-2 rounded border border-red-100 shadow-sm whitespace-nowrap">
                      <span className="font-semibold text-sm">Amoxicillin 500mg</span>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">2 Units</span>
                   </div>
                   <div className="flex justify-between bg-white px-3 py-2 rounded border border-red-100 shadow-sm whitespace-nowrap">
                      <span className="font-semibold text-sm">Ibuprofen Syrup</span>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">5 Units</span>
                   </div>
                   <div className="flex justify-between bg-white px-3 py-2 rounded border border-red-100 shadow-sm whitespace-nowrap">
                      <span className="font-semibold text-sm">Metformin 1000mg</span>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">4 Units</span>
                   </div>
                </div>
             </div>
             <button onClick={() => navigate('/stockinventory')} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium text-sm py-2 rounded transition whitespace-nowrap">
               Go to Inventory Management
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1">
           <RecentTableCard 
                title="Prescription Fulfillment Queue" 
                columns={cols} 
                data={prescriptionQueue} 
                onActionClick={() => navigate('/prescriptions')}
           />
       </div>
    </div>
  );
}
