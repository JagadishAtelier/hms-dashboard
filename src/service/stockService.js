// services/stockService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/ims/stock`;

// Function to get token from localStorage
const authHeader = () => ({
    Authorization: `Bearer ${authService.getToken()}`,
  });


const stockService = {
  // ✅ Get all stock records with optional filters
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/stock`, {
      params,
      headers: authHeader(),
    });
    return res.data;
  },

  // ✅ Get stock by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/stock/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  // ✅ Add single stock
  async create(data) {
    const res = await axios.post(`${API_BASE}/stock`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // ✅ Bulk add stock
  async createBulk(dataArray) {
    const res = await axios.post(`${API_BASE}/stockbulk`, dataArray, {
      headers: authHeader(),
    });
    return res.data;
  },

  // ✅ Update stock by ID
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/stock/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // ✅ Delete stock by ID
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/stock/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default stockService;
