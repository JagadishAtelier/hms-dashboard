import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/staff/accountant`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const accountantsService = {
  // ✅ CREATE
  createAccountant: (data) => {
    return axios.post(API_URL, data, {
      headers: authHeader(),
    });
  },

  // ✅ GET ALL (LIST)
  getAllAccountants: (params) => {
    return axios.get(API_URL, {
      params,
      headers: authHeader(),
    });
  },

  // ✅ GET BY ID
  getAccountantById: (id) => {
    return axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
  },

  // ✅ UPDATE
  updateAccountant: (id, data) => {
    return axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
  },

  // ✅ DELETE (SOFT DELETE)
  deleteAccountant: (id) => {
    return axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
  },

  // ✅ RESTORE
  restoreAccountant: (id) => {
    return axios.patch(`${API_URL}/${id}/restore`, {}, {
      headers: authHeader(),
    });
  },
};

export default accountantsService;