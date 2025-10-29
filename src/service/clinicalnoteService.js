// src/service/clinicalNoteService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; 

const API_URL = `${BASE_API}/hms/clinical/clinical-note`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const clinicalNoteService = {
  async createClinicalNote(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getAllClinicalNotes(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  async getClinicalNoteById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getClinicalNotesByEncounterId(id) {
    const res = await axios.get(`${BASE_API}/hms/clinical/clinical-notes/encounter/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async updateClinicalNote(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  async deleteClinicalNote(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default clinicalNoteService;
