import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const API = `${BASE_API}/hms/staff/hr`;
const h = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const hrService = {
    getAll: (params = {}) => axios.get(API, { params, headers: h() }),
    getById: (id) => axios.get(`${API}/${id}`, { headers: h() }),
    create: (data) => axios.post(API, data, { headers: h() }),
    update: (id, data) => axios.put(`${API}/${id}`, data, { headers: h() }),
    delete: (id) => axios.delete(`${API}/${id}`, { headers: h() }),
    restore: (id) => axios.patch(`${API}/${id}/restore`, {}, { headers: h() }),
};

export default hrService;
