// src/services/patientService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/patients/patient`; // matches router paths like /patient, /patient/:id, /patient/:id/history

// helper to include JWT header
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const patientService = {
  /**
   * Create patient (request body should include required patient fields)
   * If you need to create linked EndUser with password, send body.user = { password: "..." } or include password at top-level as your backend expects.
   * Example payload shape (your create controller expects patient data and password in req.body.user.password):
   * {
   *   first_name: "John",
   *   last_name: "Doe",
   *   email: "john@example.com",
   *   phone: "9999999999",
   *   patient_code: "PAT-1001", // optional
   *   user: { password: "secret123" } // required by your controller
   * }
   */
  async createPatient(data) {
    const res = await axios.post(API_URL, data, { headers: authHeader() });
    return res.data;
  },

  /**
   * Get all patients (supports query params: page, limit, search, is_active, sort_by, sort_order)
   * Example: getAllPatients({ page: 1, limit: 20, search: "john" })
   */
  async getAllPatients(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * Get single patient by id
   */
  async getPatientById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Update patient by id
   * data should be the update payload (your DTO validated on backend)
   */
  async updatePatient(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Soft-delete patient (admin/super admin route)
   */
  async deletePatient(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Restore soft-deleted patient
   */
  async restorePatient(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, {}, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Get patient history (encounters, appointments, vitals, admissions, diagnoses, notes, lab orders)
   * Accepts optional query params: fromDate, toDate, limit
   * Example: getHistory(patientId, { fromDate: '2025-01-01', limit: 200 })
   */
  async getHistory(patientId, params = {}) {
    const res = await axios.get(`${API_URL}/${patientId}/history`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * Convenience: Creates end-user + patient when backend expects nested structure
   * Some clients prefer sending { patientData, user: { password } } — adapt as needed.
   */
  async createPatientWithUser(payload) {
    // Calls same endpoint as createPatient — kept for readability
    const res = await axios.post(API_URL, payload, { headers: authHeader() });
    return res.data;
  },
};

export default patientService;
