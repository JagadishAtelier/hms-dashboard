import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const API = `${BASE_API}/hms/food`;
const h = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const foodService = {
  // Dashboard
  getDashboard: () => axios.get(`${API}/dashboard`, { headers: h() }),

  // Diet Types (Admin)
  getAllDietTypes: (p = {}) => axios.get(`${API}/diet-type`, { headers: h(), params: p }),
  getDietTypeById: (id) => axios.get(`${API}/diet-type/${id}`, { headers: h() }),
  createDietType: (data) => axios.post(`${API}/diet-type`, data, { headers: h() }),
  updateDietType: (id, data) => axios.put(`${API}/diet-type/${id}`, data, { headers: h() }),
  deleteDietType: (id) => axios.delete(`${API}/diet-type/${id}`, { headers: h() }),

  // Meal Plans
  getAllMealPlans: (p = {}) => axios.get(`${API}/meal-plan`, { headers: h(), params: p }),
  getMealPlanById: (id) => axios.get(`${API}/meal-plan/${id}`, { headers: h() }),
  createMealPlan: (data) => axios.post(`${API}/meal-plan`, data, { headers: h() }),
  createMealPlanForAdmission: (data) => axios.post(`${API}/meal-plan/admission`, data, { headers: h() }),
  updateMealPlan: (id, data) => axios.put(`${API}/meal-plan/${id}`, data, { headers: h() }),
  deleteMealPlan: (id) => axios.delete(`${API}/meal-plan/${id}`, { headers: h() }),

  // Meal Logs
  getAllMealLogs: (p = {}) => axios.get(`${API}/meal-log`, { headers: h(), params: p }),
  createMealLog: (data) => axios.post(`${API}/meal-log`, data, { headers: h() }),
  generateDailyLogs: (meal_date) => axios.post(`${API}/meal-log/generate`, { meal_date }, { headers: h() }),
  markDistributed: (id) => axios.patch(`${API}/meal-log/${id}/distribute`, {}, { headers: h() }),
  updateMealLog: (id, data) => axios.put(`${API}/meal-log/${id}`, data, { headers: h() }),
};

export default foodService;
