// src/services/vitalsService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ for JWT token

const API_URL = `${BASE_API}/hms/clinical/vitals`;

// ✅ Helper: Add Authorization header
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const vitalsService = {
  /**
   * ✅ Create new Vitals
   */
  async createVitals(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get All Vitals (with optional query filters)
   */
  async getAllVitals(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Vitals by ID
   */
  async getVitalsById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get Vitals by Encounter ID
   */
  async getVitalsByEncounterId(id) {
    const res = await axios.get(`${API_URL}/encounter/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get Vitals by Admission ID (if added in controller)
   */
  async getVitalsByAdmissionId(id) {
    const res = await axios.get(`${API_URL}/encounter/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update existing Vitals
   */
  async updateVitals(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Delete (soft delete) Vitals
   */
  async deleteVitals(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default vitalsService;
