// frontend/src/service/notificationService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/notifications`;

const authHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const notificationService = {
  /**
   * 🔔 Fetch recent hospital notifications
   */
  async getNotifications(params = {}) {
    try {
      const res = await axios.get(API_URL, {
        params,
        headers: authHeader(),
      });
      return res.data;
    } catch (err) {
      console.warn("Failed to fetch notifications:", err.message);
      return { success: false, data: [], unread_count: 0 };
    }
  },

  /**
   * 🔢 Get current unread notifications count
   */
  async getUnreadCount(params = {}) {
    try {
      const res = await axios.get(`${API_URL}/unread-count`, {
        params,
        headers: authHeader(),
      });
      return res.data?.unread_count || 0;
    } catch (err) {
      return 0;
    }
  },

  /**
   * ✅ Mark a notification as read
   */
  async markAsRead(id) {
    try {
      const res = await axios.patch(`${API_URL}/${id}/read`, {}, {
        headers: authHeader(),
      });
      return res.data;
    } catch (err) {
      console.warn("Failed to mark notification read:", err.message);
      return null;
    }
  },

  /**
   * 🧹 Mark all notifications as read
   */
  async markAllAsRead(body = {}) {
    try {
      const res = await axios.post(`${API_URL}/mark-all-read`, body, {
        headers: authHeader(),
      });
      return res.data;
    } catch (err) {
      console.warn("Failed to mark all notifications read:", err.message);
      return null;
    }
  },
};

export default notificationService;

