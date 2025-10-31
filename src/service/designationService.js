// src/service/designationService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ For JWT token

// ✅ Base API URL
const API_URL = `${BASE_API}/hms/hospital/designation`;

// ✅ Helper: Authorization Header
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const designationService = {
  /**
   * ✅ Create a new Designation
   */
  async createDesignation(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Designations (supports optional filters)
   */
  async getAllDesignations(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Designation by ID
   */
  async getDesignationById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Designation details
   */
  async updateDesignation(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft delete Designation
   */
  async deleteDesignation(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore a soft-deleted Designation
   */
  async restoreDesignation(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default designationService;
