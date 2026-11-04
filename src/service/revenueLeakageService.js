import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/ims/revenue-leakage`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const revenueLeakageService = {
  async getStats() {
    const res = await axios.get(`${API_URL}/stats`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getLeakageLogs(params = {}) {
    const res = await axios.get(`${API_URL}/logs`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  async runFacilityScan() {
    const res = await axios.post(`${API_URL}/scan-facility`, {}, {
      headers: authHeader(),
    });
    return res.data;
  },

  async scanPatientLeakage(patientId, admissionId = null) {
    const res = await axios.get(`${API_URL}/scan-patient/${patientId}`, {
      headers: authHeader(),
      params: admissionId ? { admissionId } : {},
    });
    return res.data;
  },

  async reconcileItem(id, actionData) {
    const res = await axios.patch(`${API_URL}/${id}/reconcile`, actionData, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default revenueLeakageService;

