import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/system/dr`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const disasterRecoveryService = {
  async getHealthTelemetry() {
    const res = await axios.get(`${API_URL}/health`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async getBackupHistory(limit = 20) {
    const res = await axios.get(`${API_URL}/backups`, {
      headers: authHeader(),
      params: { limit },
    });
    return res.data;
  },

  async triggerBackupSnapshot(backupType = "MANUAL_ON_DEMAND") {
    const res = await axios.post(
      `${API_URL}/backup/trigger`,
      { backupType },
      { headers: authHeader() }
    );
    return res.data;
  },
};

export default disasterRecoveryService;

