import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/staff/nurse`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const nursesService = {
  async createNurse(data) {
    const res = await axios.post(API_URL, data, { headers: authHeader() });
    return res.data;
  },
  async getAllNurses(params = {}) {
    const res = await axios.get(API_URL, { headers: authHeader(), params });
    return res.data;
  },
  async getNurseById(id) {
    const res = await axios.get(`${API_URL}/${id}`, { headers: authHeader() });
    return res.data;
  },
  async updateNurse(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, { headers: authHeader() });
    return res.data;
  },
  async deleteNurse(id) {
    const res = await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
    return res.data;
  },
  async restoreNurse(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, { headers: authHeader() });
    return res.data;
  },
};

export default nursesService;
