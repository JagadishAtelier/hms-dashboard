// src/service/doctorsService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ For JWT token

// ✅ Base API URL (matches backend route)
const API_URL = `${BASE_API}/hms/staff/doctor`;

// ✅ Helper: Authorization Header
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const doctorsService = {
  /**
   * ✅ Create a new Doctor
   * Roles allowed: Admin, Super Admin
   */
  async createDoctor(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Doctors
   * Roles allowed: any logged-in user
   */
  async getAllDoctors(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Doctor by ID
   * Roles allowed: any logged-in user
   */
  async getDoctorById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Doctor
   * Roles allowed: Admin, Super Admin
   */
  async updateDoctor(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft Delete Doctor
   * Roles allowed: Admin, Super Admin
   */
  async deleteDoctor(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore Soft-Deleted Doctor
   * Roles allowed: Admin, Super Admin
   */
  async restoreDoctor(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default doctorsService;
