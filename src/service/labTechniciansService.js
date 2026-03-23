import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/staff/labtechnician`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const labTechniciansService = {
  // ✅ GET ALL
  getAllLabTechnicians(params) {
    return axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
  },

  // ✅ GET BY ID  ⭐ ADD THIS
  getLabTechnicianById(id) {
    return axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
  },

  // ✅ CREATE
  createLabTechnician(data) {
    return axios.post(API_URL, data, {
      headers: authHeader(),
    });
  },

  // ✅ UPDATE
  updateLabTechnician(id, data) {
    return axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
  },

  // ✅ DELETE
  deleteLabTechnician(id) {
    return axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
  },

  // ✅ RESTORE
  restoreLabTechnician(id) {
    return axios.patch(`${API_URL}/${id}/restore`, {}, {
      headers: authHeader(),
    });
  },
};

export default labTechniciansService;