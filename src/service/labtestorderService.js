// src/service/labTestOrderService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; 

const API_URL = `${BASE_API}/hms/laboratory/labtestorder`;

const authHeader = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

const labTestOrderService = {
  /**
   * ✅ Create a new Lab Test Order
   */
  async createLabTestOrder(data) {
    const res = await axios.post(API_URL, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get all Lab Test Orders (supports filters and pagination)
   */
  async getAllLabTestOrders(params = {}) {
    const res = await axios.get(API_URL, {
      headers: authHeader(),
      params,
    });
    return res.data;
  },

  /**
   * ✅ Get Lab Test Order by ID
   */
  async getLabTestOrderById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get Lab Test Order by Encounter ID
   */
  async getLabTestOrderByEncounterId(id) {
    const res = await axios.get(`${BASE_API}/hms/laboratory/labtest-order/encounter/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get Lab Test Orders by Patient ID
   */
  async getLabTestOrdersByPatientId(patient_id) {
    const res = await axios.get(`${API_URL}/patient/${patient_id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Get Pending Lab Test Orders
   */
  async getPendingLabTestOrders() {
    const res = await axios.get(`${API_URL}/test/pending`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Update Lab Test Order
   */
  async updateLabTestOrder(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Soft Delete (Cancel) Lab Test Order
   */
  async deleteLabTestOrder(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Restore a Deleted Lab Test Order
   */
  async restoreLabTestOrder(id) {
    const res = await axios.patch(`${API_URL}/${id}/restore`, {}, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Mark Lab Test Item as Resulted
   */
  async markLabTestItemResulted(item_id, data) {
    const res = await axios.patch(`${API_URL}/item/${item_id}/result`, data, {
      headers: authHeader(),
    });
    return res.data;
  },
  /**
 * ✅ Upload Lab Result File
 */
async uploadFile(formData) {
  const res = await axios.post(
    `${BASE_API}/hms/laboratory/upload`,
    formData,
    {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
},

};

export default labTestOrderService;
