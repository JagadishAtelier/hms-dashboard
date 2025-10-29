// src/services/appointmentsService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // to reuse token header

const API_URL = `${BASE_API}/hms/appointments`;

// ✅ Helper to set token in headers
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

// ✅ Appointment Service
const appointmentsService = {
  /**
   * ✅ Create a new appointment
   * @param {Object} data - appointment details (patient_id, doctor_id, scheduled_at, etc.)
   */
  async createAppointment(data) {
    const res = await axios.post(`${API_URL}/appointment`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getAllAppointments(params = {}) {
    const res = await axios.get(`${API_URL}/appointment`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  async getAppointmentById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update appointment by ID
   */
  async updateAppointment(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Cancel appointment (soft delete)
   */
  async cancelAppointment(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore cancelled appointment
   */
  async restoreAppointment(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, {}, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get available slots for all doctors (next 5 days)
   */
  async getAvailableSlots() {
    const res = await axios.get(`${API_URL}/appointmentavailability`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get today's appointments for logged-in doctor
   */
  async getTodaysAppointmentsByDoctor() {
    const res = await axios.get(`${API_URL}/appointmentsbydoctor/today`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default appointmentsService;
