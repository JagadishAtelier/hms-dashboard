// vendorService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; 

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/ims/vendor/vendor`;

// 🔐 Get token from localStorage
const authHeader = () => ({
    Authorization: `Bearer ${authService.getToken()}`,
  });

const vendorService = {
  // 🔹 Get all vendors (supports filters, pagination, etc.)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}`, {
      params,
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Get vendor by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Create a new vendor
  async create(data) {
    const res = await axios.post(`${API_BASE}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Update vendor by ID
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Delete vendor by ID
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default vendorService;
