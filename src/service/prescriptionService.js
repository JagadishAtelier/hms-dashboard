import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const API_URL = `${BASE_API}/hms/clinical/prescription`;

const authHeader = () => ({
    Authorization: `Bearer ${authService.getToken()}`,
});

const prescriptionService = {
    async createPrescription(data) {
        const res = await axios.post(API_URL, data, { headers: authHeader() });
        return res.data;
    },
    async getAllPrescriptions(params = {}) {
        const res = await axios.get(API_URL, { headers: authHeader(), params });
        return res.data;
    },
    async getPrescriptionById(id) {
        const res = await axios.get(`${API_URL}/${id}`, { headers: authHeader() });
        return res.data;
    },
    async getPrescriptionByAppointmentId(appointment_id) {
        const res = await axios.get(`${API_URL}/appointment/${appointment_id}`, { headers: authHeader() });
        return res.data;
    },
    async getPrescriptionsByPatientId(patient_id) {
        const res = await axios.get(`${API_URL}/patient/${patient_id}`, { headers: authHeader() });
        return res.data;
    },
    async updatePrescription(id, data) {
        const res = await axios.put(`${API_URL}/${id}`, data, { headers: authHeader() });
        return res.data;
    },
    async deletePrescription(id) {
        const res = await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
        return res.data;
    },
};

export default prescriptionService;
