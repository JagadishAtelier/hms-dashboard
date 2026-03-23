import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/staff/pharmacist`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const pharmacistsService = {
  async createPharmacist(data) {
    const res = await axios.post(API_URL, data, { headers: authHeader() });
    return res.data;
  },
  async getAllPharmacists(params = {}) {
    const res = await axios.get(API_URL, { headers: authHeader(), params });
    return res.data;
  },
  async getPharmacistById(id) {
    const res = await axios.get(`${API_URL}/${id}`, { headers: authHeader() });
    return res.data;
  },
  async updatePharmacist(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, { headers: authHeader() });
    return res.data;
  },
  async deletePharmacist(id) {
    const res = await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
    return res.data;
  },
  async restorePharmacist(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, { headers: authHeader() });
    return res.data;
  },
};

export default pharmacistsService;
