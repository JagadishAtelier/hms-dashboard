// src/service/wardsService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ to get JWT token

// 👇 API Base URL for wards
const API_URL = `${BASE_API}/hms/admissions/ward`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const wardsService = {
  /**
   * ✅ Create a new Ward
   */
  async createWard(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Wards (supports optional filters)
   */
  async getAllWards(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Ward by ID
   */
  async getWardById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Ward
   */
  async updateWard(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft Delete Ward
   */
  async deleteWard(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore Soft Deleted Ward
   */
  async restoreWard(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default wardsService;
