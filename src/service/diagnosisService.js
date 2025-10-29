// src/service/diagnosisService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ for JWT token

const API_URL = `${BASE_API}/hms/clinical/diagnosis`;

// ✅ Helper: Authorization Header
const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const diagnosisService = {
  /**
   * ✅ Create a new Diagnosis
   */
  async createDiagnosis(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get All Diagnoses (supports optional query filters)
   */
  async getAllDiagnoses(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Diagnosis by ID
   */
  async getDiagnosisById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get Diagnoses by Encounter ID
   */
  async getDiagnosesByEncounterId(id) {
    const res = await axios.get(`${API_URL}/encounter/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Diagnosis
   */
  async updateDiagnosis(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Delete (soft delete) Diagnosis
   */
  async deleteDiagnosis(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default diagnosisService;
