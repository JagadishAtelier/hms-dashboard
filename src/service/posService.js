import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const API = `${BASE_API}/ims/pos`;
const ITEMS_API = `${BASE_API}/ims/billable-items`;
const h = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const posService = {
    getAllItems: (params = {}) => axios.get(ITEMS_API, { params, headers: h() }),
    createSale: (data) => axios.post(API, data, { headers: h() }),
    getAllSales: (params = {}) => axios.get(API, { params, headers: h() }),
    getSaleById: (id) => axios.get(`${API}/${id}`, { headers: h() }),
    updateSale: (id, data) => axios.put(`${API}/${id}`, data, { headers: h() }),
    deleteSale: (id) => axios.delete(`${API}/${id}`, { headers: h() }),
    collectPayment: (id, data) => axios.post(`${API}/${id}/collect`, data, { headers: h() }),
};

export default posService;
