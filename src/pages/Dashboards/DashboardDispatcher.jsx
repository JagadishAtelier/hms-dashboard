import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRole } from '../../store/slices/dashboardSlice';

// We will lazy load or import the dashboards here directly
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import LabDashboard from './LabDashboard';
import PharmacyDashboard from './PharmacyDashboard';
import HRDashboard from './HRDashboard';

export default function DashboardDispatcher() {
    const { currentRole } = useSelector((state) => state.dashboard);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        // Sync Redux with explicit localStorage rule to prevent stale state after client-side login redirect
        const savedRole = localStorage.getItem('role');
        if (savedRole && savedRole !== currentRole) {
            dispatch(setRole(savedRole));
        }
    }, [dispatch, currentRole]);

    // Mapping roles to their respective dashboards
    const roleMap = {
        'admin': <AdminDashboard />,
        'doctor': <DoctorDashboard />,
        'receptionist': <ReceptionistDashboard />,
        'lab': <LabDashboard />,
        'pharmacy': <PharmacyDashboard />,
        'hr': <HRDashboard />,
    };

    // Safe fallback if role not matched
    const RenderedDashboard = roleMap[currentRole?.toLowerCase()] || (
        <div className="flex flex-col items-center justify-center h-96">
            <h2 className="text-xl font-bold text-gray-700">Role Undefined</h2>
            <p className="text-sm text-gray-500">Please contact support or sign in again.</p>
        </div>
    );

    return (
        <div className="w-full">
            {/* Header control for dev testing/mocking the current role - can be removed later */}
            {/* <div className="mb-4 text-xs text-gray-400">Currently viewing as: {currentRole}</div> */}
            {RenderedDashboard}
        </div>
    );
}
