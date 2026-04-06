import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

// Full path: /api/v1/ims/billing/billing
const API = `${BASE_API}/ims/billing/billing`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const billingService = {
  getAll: (params = {}) =>
    axios.get(API, { params, headers: authHeader() }),

  getById: (id) =>
    axios.get(`${API}/${id}`, { headers: authHeader() }),

  create: (data) =>
    axios.post(API, data, { headers: authHeader() }),

  update: (id, data) =>
    axios.put(`${API}/${id}`, data, { headers: authHeader() }),

  remove: (id) =>
    axios.delete(`${API}/${id}`, { headers: authHeader() }),
};

export default billingService;
