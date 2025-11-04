// src/service/admindashboardService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/dashboard/admindashboard`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const adminDashboardService = {
  async getDashboard() {
    try {
      const res = await axios.get(API_URL, {
        headers: authHeader(),
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching admin dashboard:", err);
      throw err;
    }
  },
};

export default adminDashboardService;
