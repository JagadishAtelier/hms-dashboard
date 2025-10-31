// src/service/doctorScheduleService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ For JWT token

// ✅ Base API URL (matches backend route)
const API_URL = `${BASE_API}/hms/appointments/doctor-schedule`;

// ✅ Helper: Authorization Header
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const doctorScheduleService = {
  /**
   * ✅ Create a new Doctor Schedule
   * Roles allowed: Admin, Super Admin
   */
  async createSchedule(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Doctor Schedules
   * Roles allowed: All authenticated users
   */
  async getAllSchedules(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Doctor Schedule by ID
   * Roles allowed: All authenticated users
   */
  async getScheduleById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get Doctor Schedule by Doctor ID
   * Roles allowed: All authenticated users
   */
  async getScheduleByDoctorId(doctorId) {
    const res = await axios.get(`${API_URL}/doctor/${doctorId}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Doctor Schedule
   * Roles allowed: Admin, Super Admin
   */
  async updateSchedule(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft Delete Doctor Schedule
   * Roles allowed: Admin, Super Admin
   */
  async deleteSchedule(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore Doctor Schedule
   * Roles allowed: Admin, Super Admin
   */
  async restoreSchedule(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default doctorScheduleService;
