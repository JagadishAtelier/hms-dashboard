import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; 

const API_BASE =
  `${BASE_API}/ims/product`;

  const authHeader = () => ({
    Authorization: `Bearer ${authService.getToken()}`,
  });

const productService = {
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/product`, {
      params,
      headers: authHeader(),
      
    });
    return res.data;
  },

  async getById(id) {
    const res = await axios.get(`${API_BASE}/product/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getByCode(code) {
    const res = await axios.get(`${API_BASE}/product/code/${code}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async create(data) {
    const res = await axios.post(`${API_BASE}/product`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async update(id, data) {
    const res = await axios.put(`${API_BASE}/product/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async remove(id) {
    const res = await axios.delete(`${API_BASE}/product/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default productService;
