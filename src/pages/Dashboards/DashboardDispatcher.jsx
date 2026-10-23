import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRole } from '../../store/slices/dashboardSlice';

// Role-specific Dashboards
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import LabDashboard from './LabDashboard';
import PharmacyDashboard from './PharmacyDashboard';
import HRDashboard from './HRDashboard';
import NurseDashboard from '../NursePage/NurseDashboard';
import FoodDashboard from '../FoodPage/FoodDashboard';
import AccountantDashboard from '../AccountantPage/AccountantDashboard';
import PatientDashboard from '../PatientDashboard/PatientDashboard';

export default function DashboardDispatcher() {
    const { currentRole } = useSelector((state) => state.dashboard);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        // Sync Redux with explicit localStorage rule
        const savedRole = localStorage.getItem('role');
        if (savedRole && savedRole !== currentRole) {
            dispatch(setRole(savedRole));
        }
    }, [dispatch, currentRole]);

    // Normalized role key
    const normalizedRole = (currentRole || localStorage.getItem('role') || 'admin')
        .toLowerCase()
        .replace(/\s+/g, '');

    // Mapping all system roles to their respective dashboards
    const roleMap = {
        'superadmin': <AdminDashboard />,
        'admin': <AdminDashboard />,
        'doctor': <DoctorDashboard />,
        'receptionist': <ReceptionistDashboard />,
        'lab': <LabDashboard />,
        'labtechnician': <LabDashboard />,
        'pharmacy': <PharmacyDashboard />,
        'pharmacist': <PharmacyDashboard />,
        'hr': <HRDashboard />,
        'nurse': <NurseDashboard />,
        'foodmanager': <FoodDashboard />,
        'accountant': <AccountantDashboard />,
        'patient': <PatientDashboard />,
    };

    // Safe fallback if role not matched
    const RenderedDashboard = roleMap[normalizedRole] || (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Role Dashboard Initializing</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
                Logged in as <span className="font-semibold text-indigo-600">{currentRole || 'User'}</span>. If this screen persists, please sign in again.
            </p>
            <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
                Return to Login
            </button>
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
