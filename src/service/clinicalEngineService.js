import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/clinical`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const clinicalEngineService = {
  async recordPhysicianRounding(data) {
    const res = await axios.post(`${API_URL}/roundings`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getPatientRoundings(admissionId) {
    const res = await axios.get(`${API_URL}/roundings/admission/${admissionId}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async scheduleFollowUp(data) {
    const res = await axios.post(`${API_URL}/follow-ups`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getPendingFollowUps(params = {}) {
    const res = await axios.get(`${API_URL}/follow-ups`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  async completeFollowUp(id, data) {
    const res = await axios.patch(`${API_URL}/follow-ups/${id}/complete`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async generateVitalTasks(wardId = null) {
    const res = await axios.post(
      `${API_URL}/vital-tasks/generate`,
      { ward_id: wardId },
      { headers: authHeader() }
    );
    return res.data;
  },
};

export default clinicalEngineService;

