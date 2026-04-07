import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const API = `${BASE_API}/ims/billable-items`;
const h = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const billableItemService = {
    getAll: (params = {}) => axios.get(API, { params, headers: h() }),
    getById: (id) => axios.get(`${API}/${id}`, { headers: h() }),
    create: (data) => axios.post(API, data, { headers: h() }),
    update: (id, data) => axios.put(`${API}/${id}`, data, { headers: h() }),
    delete: (id) => axios.delete(`${API}/${id}`, { headers: h() }),
    updateStock: (id, quantity, operation = 'add') => axios.put(`${API}/${id}/stock`, { quantity, operation }, { headers: h() }),
};

export default billableItemService;
