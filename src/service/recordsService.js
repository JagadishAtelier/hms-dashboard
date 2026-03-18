import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const BASE = `${BASE_API}/hms`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const recordsService = {
  // ==================== RECORD TYPES ====================
  async getAllRecordTypes(params = {}) {
    const res = await axios.get(`${BASE}/types`, { headers: authHeader(), params });
    return res.data;
  },
  async getRecordTypeById(id) {
    const res = await axios.get(`${BASE}/types/${id}`, { headers: authHeader() });
    return res.data;
  },
  async createRecordType(data) {
    const res = await axios.post(`${BASE}/types`, data, { headers: authHeader() });
    return res.data;
  },
  async updateRecordType(id, data) {
    const res = await axios.put(`${BASE}/types/${id}`, data, { headers: authHeader() });
    return res.data;
  },
  async deleteRecordType(id) {
    const res = await axios.delete(`${BASE}/types/${id}`, { headers: authHeader() });
    return res.data;
  },

  // ==================== RECORD TEMPLATES ====================
  async getAllTemplates(params = {}) {
    const res = await axios.get(`${BASE}/templates`, { headers: authHeader(), params });
    return res.data;
  },
  async getTemplateById(id) {
    const res = await axios.get(`${BASE}/templates/${id}`, { headers: authHeader() });
    return res.data;
  },
  async createTemplate(data) {
    const res = await axios.post(`${BASE}/templates`, data, { headers: authHeader() });
    return res.data;
  },
  async updateTemplate(id, data) {
    const res = await axios.put(`${BASE}/templates/${id}`, data, { headers: authHeader() });
    return res.data;
  },
  async deleteTemplate(id) {
    const res = await axios.delete(`${BASE}/templates/${id}`, { headers: authHeader() });
    return res.data;
  },

  // ==================== MEDICAL RECORDS ====================
  async getAllRecords(params = {}) {
    const res = await axios.get(`${BASE}/records`, { headers: authHeader(), params });
    return res.data;
  },
  async getRecordById(id) {
    const res = await axios.get(`${BASE}/records/${id}`, { headers: authHeader() });
    return res.data;
  },
  async createRecord(data) {
    const res = await axios.post(`${BASE}/records`, data, { headers: authHeader() });
    return res.data;
  },
  async updateRecord(id, data) {
    const res = await axios.put(`${BASE}/records/${id}`, data, { headers: authHeader() });
    return res.data;
  },
  async deleteRecord(id) {
    const res = await axios.delete(`${BASE}/records/${id}`, { headers: authHeader() });
    return res.data;
  },
};

export default recordsService;
