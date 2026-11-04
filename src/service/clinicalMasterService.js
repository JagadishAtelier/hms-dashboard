// frontend/src/service/clinicalMasterService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";
import { CLINICAL_SYSTEM_DEFAULTS, determineSpecimenType } from "../constants/clinicalDefaults.js";

const API_URL = `${BASE_API}/hms/clinical-masters`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

// In-memory cache for fast responsive dropdown rendering
const cache = new Map();

const clinicalMasterService = {
  /**
   * 🏥 Get clinical masters by category with automatic caching and zero-latency fallback
   */
  async getMastersByCategory(category) {
    if (cache.has(category)) {
      return cache.get(category);
    }

    try {
      const res = await axios.get(`${API_URL}?category=${category}`, {
        headers: authHeader(),
      });
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) {
        cache.set(category, data);
        return data;
      }
    } catch (err) {
      // Backend not reached or offline; fall back cleanly to system defaults
    }

    const fallback = CLINICAL_SYSTEM_DEFAULTS.filter((d) => d.category === category);
    cache.set(category, fallback);
    return fallback;
  },

  /**
   * 🔬 Automatically determine specimen type from test attributes
   */
  determineSpecimen(testName = "", testCode = "", category = "") {
    return determineSpecimenType(testName, testCode, category);
  },

  /**
   * ➕ Create custom hospital master option
   */
  async createMaster(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    if (data.category) cache.delete(data.category);
    return res.data;
  },

  /**
   * ✏️ Update hospital master option
   */
  async updateMaster(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    if (data.category) cache.delete(data.category);
    return res.data;
  },

  /**
   * 🗑️ Delete or deactivate master option
   */
  async deleteMaster(id, category = null) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    if (category) cache.delete(category);
    return res.data;
  },
};

export default clinicalMasterService;

