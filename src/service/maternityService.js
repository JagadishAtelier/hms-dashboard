import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/hms/maternity`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const maternityService = {
  /**
   * Phase 1: Naegele EDD & Gestational Age Calculation
   */
  async calculateEDD(data) {
    const res = await axios.post(`${API_URL}/antenatal/calculate`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Phase 1: Create Antenatal Care Record
   */
  async createAntenatalRecord(data) {
    const res = await axios.post(`${API_URL}/antenatal`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Phase 1: Get Active Antenatal Record for Patient
   */
  async getAntenatalRecordByPatient(patientId) {
    const res = await axios.get(`${API_URL}/antenatal/patient/${patientId}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Phase 1 & E2E-02: Parturition Split for Singleton or Multi-Birth (Twins)
   */
  async recordDeliveryAndSplit(data) {
    const res = await axios.post(`${API_URL}/delivery/parturition-split`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Phase 1: Get Newborn Records Linked to Mother
   */
  async getNewbornsByMother(motherId) {
    const res = await axios.get(`${API_URL}/delivery/mother/${motherId}/newborns`, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default maternityService;

