// inwardService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; 

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/ims/inward`;

// Function to get token from localStorage
const authHeader = () => ({
    Authorization: `Bearer ${authService.getToken()}`,
  });

const inwardService = {
  // 🔹 Get all inwards (with optional filters + pagination)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/inward`, {
      params,
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Get single inward by ID (with items)
  async getById(id) {
    const res = await axios.get(`${API_BASE}/inward/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Create new inward with items
  async create(data) {
    const res = await axios.post(`${API_BASE}/inward`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Update inward
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/inward/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Delete inward
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/inward/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default inwardService;
