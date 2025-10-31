// src/service/roomsService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // ✅ for JWT token

// 👇 Base API for Rooms
const API_URL = `${BASE_API}/hms/admissions/room`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const roomsService = {
  /**
   * ✅ Create a new Room
   */
  async createRoom(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Rooms (supports optional filters)
   */
  async getAllRooms(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Room by ID
   */
  async getRoomById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Room details
   */
  async updateRoom(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft delete Room
   */
  async deleteRoom(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore a soft-deleted Room
   */
  async restoreRoom(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, null, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default roomsService;
