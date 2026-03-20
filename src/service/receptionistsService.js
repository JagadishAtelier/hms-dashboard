import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/staff/receptionist`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const receptionistsService = {
  // ✅ CREATE
async createReceptionist(data) {
  const res = await axios.post(API_URL, data, {
    headers: authHeader(),
  });
  return res.data;
},

  // ✅ GET ALL
  async getAllReceptionists(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },
  // ✅ GET ALL
  async getAllReceptionists(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  // ✅ GET BY ID
  async getReceptionistById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  // ✅ UPDATE
  async updateReceptionist(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  // ✅ DELETE
  async deleteReceptionist(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  // ✅ RESTORE
  async restoreReceptionist(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default receptionistsService;