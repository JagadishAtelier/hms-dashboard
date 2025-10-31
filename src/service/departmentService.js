// src/service/departmentService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ For JWT token

// ✅ Base API URL (adjust module path if needed)
const API_URL = `${BASE_API}/hms/hospital/department`;

// ✅ Helper: Authorization Header
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const departmentService = {
  /**
   * ✅ Create a new Department
   */
  async createDepartment(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Departments (supports optional filters)
   */
  async getAllDepartments(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Department by ID
   */
  async getDepartmentById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Department details
   */
  async updateDepartment(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft delete Department
   */
  async deleteDepartment(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore a soft-deleted Department
   */
  async restoreDepartment(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default departmentService;
