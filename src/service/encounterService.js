// src/services/encounterService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // For token handling

const API_URL = `${BASE_API}/hms/clinical/encounter`;

// ✅ Helper: include JWT token
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const encounterService = {
  async createEncounter(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getAllEncounters(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },


  async getEncounterById(id) {
    const res = await axios.get(`${API_URL}/admission/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getEncounterByAddminonId(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Encounter by ID
   * @param {string} id
   * @param {Object} data
   */
  async updateEncounter(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Delete Encounter (soft delete)
   * @param {string} id
   */
  async deleteEncounter(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore Encounter
   * @param {string} id
   */
  async restoreEncounter(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, {}, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default encounterService;
