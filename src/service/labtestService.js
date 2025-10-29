// src/service/labtestService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ for JWT token

// Base API endpoint for Lab Tests Master
const API_URL = `${BASE_API}/hms/laboratory/labtest`;

// ✅ Helper: Add Authorization header
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const labtestService = {
  /**
   * ✅ Create a new Lab Test (Admin / Super Admin only)
   */
  async createLabTest(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Lab Tests (available to all authenticated users)
   */
  async getAllLabTests(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Lab Test by ID
   */
  async getLabTestById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Lab Test (Admin / Super Admin only)
   */
  async updateLabTest(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft Delete Lab Test (Admin / Super Admin only)
   */
  async deleteLabTest(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore Deleted Lab Test (Admin / Super Admin only)
   */
  async restoreLabTest(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, {}, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default labtestService;
