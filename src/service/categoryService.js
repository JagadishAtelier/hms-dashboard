import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/ims/product`;

const authHeader = () => ({
    Authorization: `Bearer ${authService.getToken()}`,
  });

const categoryService = {
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/category`, {
      params,
      headers: authHeader(),
    });
    return res.data;
  },

  async getById(id) {
    const res = await axios.get(`${API_BASE}/category/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async create(data) {
    const res = await axios.post(`${API_BASE}/category`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async update(id, data) {
    const res = await axios.put(`${API_BASE}/category/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async remove(id) {
    const res = await axios.delete(`${API_BASE}/category/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default categoryService;
