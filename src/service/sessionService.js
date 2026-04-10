import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const API = `${BASE_API}/hms/session-plan`;
const h = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const sessionService = {
    createPlan: (data) => axios.post(API, data, { headers: h() }),
    getAllPlans: (params = {}) => axios.get(API, { params, headers: h() }),
    getPlanById: (id) => axios.get(`${API}/${id}`, { headers: h() }),
    updatePlan: (id, data) => axios.put(`${API}/${id}`, data, { headers: h() }),
    cancelPlan: (id) => axios.delete(`${API}/${id}`, { headers: h() }),
    getSessionsDueTomorrow: () => axios.get(`${API}/due-tomorrow`, { headers: h() }),
    getSessionsForDate: (date) => axios.get(`${API}/by-date`, { params: { date }, headers: h() }),
    confirmAndCreateAppointment: (sessionId, data) => axios.post(`${API}/session/${sessionId}/confirm`, data, { headers: h() }),
    rescheduleSession: (sessionId, new_date) => axios.patch(`${API}/session/${sessionId}/reschedule`, { new_date }, { headers: h() }),
    cancelSession: (sessionId) => axios.patch(`${API}/session/${sessionId}/cancel`, {}, { headers: h() }),
    updateSessionRecord: (sessionId, data) => axios.patch(`${API}/session/${sessionId}/record`, data, { headers: h() }),
    getSessionsByDoctor: (doctorId, params = {}) => axios.get(`${API}/doctor/${doctorId}`, { params, headers: h() }),
};

export default sessionService;
