import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const API = `${BASE_API}/hms/surgeries`;
const authHeader = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const surgeriesService = {
  getAll: (params = {}) => axios.get(`${API}/surgery`, { headers: authHeader(), params }),
  getById: (id) => axios.get(`${API}/surgery/${id}`, { headers: authHeader() }),
  getByPatient: (patient_id) => axios.get(`${API}/surgery/patient/${patient_id}`, { headers: authHeader() }),
  getByAdmission: (admission_id) => axios.get(`${API}/surgery/admission/${admission_id}`, { headers: authHeader() }),
  create: (data) => axios.post(`${API}/surgery`, data, { headers: authHeader() }),
  update: (id, data) => axios.put(`${API}/surgery/${id}`, data, { headers: authHeader() }),
  delete: (id) => axios.delete(`${API}/surgery/${id}`, { headers: authHeader() }),

  getAllProcedures: (params = {}) => axios.get(`${API}/procedure`, { headers: authHeader(), params }),
};

export default surgeriesService;
