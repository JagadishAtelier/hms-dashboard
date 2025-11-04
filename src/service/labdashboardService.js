// src/service/labdashboardService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/dashboard/labdashboard`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const labDashboardService = {
  async getDashboard() {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default labDashboardService;
