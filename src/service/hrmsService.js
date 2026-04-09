import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const API = `${BASE_API}/hms/hrms`;
const h = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const hrmsService = {
    // Staff Profiles (for dropdowns)
    getAllStaffProfiles: (params = {}) => axios.get(`${BASE_API}/hms/staff/staffprofile`, { params, headers: h() }),

    // Salary Config
    upsertSalaryConfig: (staffId, data) => axios.post(`${API}/salary-config/${staffId}`, data, { headers: h() }),
    getSalaryConfig: (staffId) => axios.get(`${API}/salary-config/${staffId}`, { headers: h() }),
    getAllSalaryConfigs: (params = {}) => axios.get(`${API}/salary-config`, { params, headers: h() }),

    // Leave Config
    createLeaveConfig: (data) => axios.post(`${API}/leave-config`, data, { headers: h() }),
    getAllLeaveConfigs: () => axios.get(`${API}/leave-config`, { headers: h() }),
    updateLeaveConfig: (id, data) => axios.put(`${API}/leave-config/${id}`, data, { headers: h() }),
    deleteLeaveConfig: (id) => axios.delete(`${API}/leave-config/${id}`, { headers: h() }),

    // Leave Applications
    applyLeave: (data) => axios.post(`${API}/leave`, data, { headers: h() }),
    getAllLeaves: (params = {}) => axios.get(`${API}/leave`, { params, headers: h() }),
    getLeaveById: (id) => axios.get(`${API}/leave/${id}`, { headers: h() }),
    getLeaveBalance: (staffId, year) => axios.get(`${API}/leave/balance/${staffId}`, { params: { year }, headers: h() }),
    hrActionLeave: (id, action, remarks) => axios.patch(`${API}/leave/${id}/hr-action`, { action, remarks }, { headers: h() }),
    adminActionLeave: (id, action, remarks) => axios.patch(`${API}/leave/${id}/admin-action`, { action, remarks }, { headers: h() }),

    // Attendance
    markAttendance: (data) => axios.post(`${API}/attendance`, data, { headers: h() }),
    getAllAttendance: (params = {}) => axios.get(`${API}/attendance`, { params, headers: h() }),
    getAttendanceByStaff: (staffId, params = {}) => axios.get(`${API}/attendance/${staffId}`, { params, headers: h() }),
    signIn: (staffId) => axios.post(`${API}/attendance/${staffId}/sign-in`, {}, { headers: h() }),
    signOut: (staffId) => axios.post(`${API}/attendance/${staffId}/sign-out`, {}, { headers: h() }),

    // Salary Slips
    generateSalarySlip: (data) => axios.post(`${API}/salary-slip/generate`, data, { headers: h() }),
    getAllSalarySlips: (params = {}) => axios.get(`${API}/salary-slip`, { params, headers: h() }),
    getSalarySlipById: (id) => axios.get(`${API}/salary-slip/${id}`, { headers: h() }),
    markSalaryPaid: (id) => axios.patch(`${API}/salary-slip/${id}/mark-paid`, {}, { headers: h() }),

    // Documents
    uploadDocument: (data) => axios.post(`${API}/document`, data, { headers: h() }),
    getDocumentsByStaff: (staffId) => axios.get(`${API}/document/${staffId}`, { headers: h() }),
    deleteDocument: (id) => axios.delete(`${API}/document/${id}`, { headers: h() }),
};

export default hrmsService;
