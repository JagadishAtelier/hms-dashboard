// billingService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; 

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/ims/billing`;

// Function to get token from localStorage
const authHeader = () => ({
    Authorization: `Bearer ${authService.getToken()}`,
  });

const billingService = {
  // 🔹 Get all billings (with optional filters + pagination)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/billing`, {
      params,
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Get single billing by ID (with items)
  async getById(id) {
    const res = await axios.get(`${API_BASE}/${id}/billing`, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Create new billing with items
  async create(data) {
    const res = await axios.post(`${API_BASE}/billing`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Update billing
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/billing/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Delete billing
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/billing/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default billingService;
