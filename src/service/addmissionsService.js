// src/service/admissionsService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/admissions`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const admissionsService = {
  async createAdmission(data) {
    const res = await axios.post(`${API_URL}/admission`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all admissions (with filters, pagination, search)
   * @param {Object} params - e.g. { page, limit, search, status, ward_id, start_date, end_date }
   */
  async getAllAdmissions(params = {}) {
    const res = await axios.get(`${API_URL}/admission`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get admission by ID
   * @param {string} id - Admission ID (UUID)
   */
  async getAdmissionById(id) {
    const res = await axios.get(`${API_URL}/admission/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update admission details (e.g., room/bed transfer)
   * @param {string} id - Admission ID
   * @param {Object} data - Updated fields
   */
  async updateAdmission(id, data) {
    const res = await axios.put(`${API_URL}/admission/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Discharge a patient
   * @param {string} id - Admission ID
   * @param {Object} data - { discharge_date, discharge_notes, discharge_summary }
   */
  async dischargeAdmission(id, data) {
    const res = await axios.put(`${API_URL}/admission/${id}/discharge`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft delete an admission (mark as deleted)
   * @param {string} id - Admission ID
   */
  async deleteAdmission(id) {
    const res = await axios.delete(`${API_URL}/admission/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore a soft-deleted admission
   * @param {string} id - Admission ID
   */
  async restoreAdmission(id) {
    const res = await axios.patch(`${API_URL}/admission/${id}/restore`, {}, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default admissionsService;
