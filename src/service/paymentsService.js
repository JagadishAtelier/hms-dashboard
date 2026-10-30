import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/ims/billing`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const paymentsService = {
  /**
   * Phase 6 Edge Case 30: Multi-Split Payment Settlement
   */
  async processSplitPayment(data) {
    const res = await axios.post(`${API_URL}/split-payment`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Phase 6 Edge Case 34: IPD Advance Deposit Intake
   */
  async recordAdvanceDeposit(data) {
    const res = await axios.post(`${API_URL}/advance-deposit`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Phase 6 Edge Case 34: Auto-Offset Advance Against Bill
   */
  async adjustAdvance(data) {
    const res = await axios.post(`${API_URL}/adjust-advance`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Phase 6 Edge Cases 31 & E2E-05: Settle Government Scheme Package
   */
  async settleSchemePackage(data) {
    const res = await axios.post(`${API_URL}/settle-scheme`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * Phase 6 Edge Case 32: Audited Credit Note Refund
   */
  async issueCreditNote(data) {
    const res = await axios.post(`${API_URL}/credit-note`, data, {
      headers: authHeader(),
    });
    return res.data;
  },
};

export default paymentsService;

