// src/service/bedsService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ for JWT token

const API_URL = `${BASE_API}/hms/admissions/bed`; // 👈 adjust the module path if needed (e.g., /hms/bed)

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const bedsService = {
  /**
   * ✅ Create a new Bed
   */
  async createBed(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Beds (supports optional filters)
   */
  async getAllBeds(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Bed by ID
   */
  async getBedById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Bed details
   */
  async updateBed(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft delete Bed
   */
  async deleteBed(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore a soft-deleted Bed
   */
  async restoreBed(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default bedsService;
