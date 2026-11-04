import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/tasks`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const taskBoardService = {
  async getTasks(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  async getTaskStats(wardId = null) {
    const res = await axios.get(`${API_URL}/stats`, {
      headers: authHeader(),
      params: wardId ? { ward_id: wardId } : {},
    });
    return res.data;
  },

  async createTask(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async updateTaskStatus(id, updateData) {
    const res = await axios.patch(`${API_URL}/${id}/status`, updateData, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getWardSLAConfigs() {
    const res = await axios.get(`${API_URL}/ward-sla-configs`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async updateWardSLAConfig(wardId, configData) {
    const res = await axios.put(`${API_URL}/ward-sla-configs/${wardId}`, configData, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default taskBoardService;

