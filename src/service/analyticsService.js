/**
 * Atelier HMS — Analytics Frontend Service
 * 
 * Communicates with backend endpoints:
 *   /api/v1/hms/analytics/summary
 *   /api/v1/hms/analytics/financials
 *   /api/v1/hms/analytics/inpatient
 *   /api/v1/hms/analytics/opd
 *   /api/v1/hms/analytics/laboratory
 *   /api/v1/hms/analytics/pharmacy
 */

import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/analytics`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const analyticsService = {
  /**
   * Executive Consolidated Summary
   */
  async getSummary(params = {}) {
    const res = await axios.get(`${API_URL}/summary`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * Financial & Profitability Analytics
   */
  async getFinancials(params = {}) {
    const res = await axios.get(`${API_URL}/financials`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * Inpatient & Bed Capacity Analytics
   */
  async getInpatient(params = {}) {
    const res = await axios.get(`${API_URL}/inpatient`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * OPD & Clinical Appointment Analytics
   */
  async getOpd(params = {}) {
    const res = await axios.get(`${API_URL}/opd`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * Laboratory Diagnostic Analytics
   */
  async getLaboratory(params = {}) {
    const res = await axios.get(`${API_URL}/laboratory`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * Pharmacy & Inventory Valuation Analytics
   */
  async getPharmacy(params = {}) {
    const res = await axios.get(`${API_URL}/pharmacy`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },
};

export default analyticsService;
